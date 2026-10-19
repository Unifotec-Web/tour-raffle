"""Member checkout and authenticated provider callbacks."""
import hashlib
import hmac
import json
from dataclasses import replace
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import check_origin
from app.api.deps import get_current_admin, get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.models import CheckoutHold, Order, ProviderEvent, RemedyRecord, User
from app.services.orders import OrderError, cancel_order, confirm_payment, create_order, enforce_deadline, get_order_locked, issue_paid_order, record_non_success, schedule_reminders
from app.services.payment_providers import ProviderError, available, create_checkout, parse_webhook, verify_fresh_stripe_session
from app.services.redemption import utcnow

router = APIRouter(tags=["orders and payments"])

class OrderCreate(BaseModel):
    campaign_id: UUID
    quantity: int = Field(ge=1, le=100)
    provider: str = Field(pattern="^(fake|stripe|paystack)$")
    idempotency_key: str = Field(min_length=8, max_length=128)


def respond(db: Session, order: Order):
    hold = db.scalar(select(CheckoutHold).where(CheckoutHold.order_id == order.id))
    return {"id": str(order.id), "campaign_id": str(order.campaign_id), "quantity": order.quantity,
            "unit_amount": str(order.unit_amount), "total_amount": str(order.total_amount), "currency": order.currency,
            "paid_amount": str(order.paid_amount) if order.paid_amount is not None else None,
            "paid_currency": order.paid_currency, "fx_snapshot": order.fx_snapshot,
            "provider": order.provider, "reference": order.provider_reference,
            "status": "hold_expired" if hold and (hold.status == "expired" or hold.expires_at <= utcnow()) and order.status in ("held", "checkout_pending") else order.status,
            "checkout_url": order.checkout_url,
            "hold_expires_at": hold.expires_at.isoformat() if hold else None, "created_at": order.created_at.isoformat(),
            "paid_at": order.paid_at.isoformat() if order.paid_at else None}


def fail(error):
    return HTTPException(status_code=error.code if isinstance(error, OrderError) else 409, detail=error.message if isinstance(error, OrderError) else str(error))


@router.get("/payments/providers")
def providers():
    return {name: available(name) for name in ("fake", "stripe", "paystack")}


@router.post("/orders", status_code=201)
def new_order(payload: OrderCreate, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_origin(request)
    if not available(payload.provider):
        raise HTTPException(409, "Payment provider is not configured for sandbox use")
    try:
        order = create_order(db, user.id, payload.campaign_id, payload.quantity, payload.provider, payload.idempotency_key)
        return respond(db, order)
    except OrderError as error:
        raise fail(error) from error


@router.get("/users/me/orders")
def my_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [respond(db, order) for order in db.scalars(select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc()))]


@router.get("/orders/{order_id}")
def one_order(order_id: UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if order is None or order.user_id != user.id:
        raise HTTPException(404, "Order not found")
    return respond(db, order)


@router.post("/orders/{order_id}/checkout")
def checkout(order_id: UUID, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_origin(request)
    try:
        campaign, order, hold = get_order_locked(db, order_id)
        if order.user_id != user.id:
            raise OrderError(404, "Order not found")
        enforce_deadline(db, campaign)
        if order.checkout_url and hold.status == "active" and campaign.status == "open":
            db.commit()
            return respond(db, order)
        if hold.status != "active" or campaign.status != "open" or order.status not in ("held", "checkout_pending"):
            db.commit()  # Keep due closure and expired-hold accounting.
            raise OrderError(409, "Checkout hold has expired")
        db.commit()
        details = create_checkout(order.provider, order, user.email)
        campaign, order, hold = get_order_locked(db, order_id)
        if order.provider_reference and order.provider_reference != details.reference:
            raise OrderError(409, "Checkout reference conflict")
        order.provider_reference = details.reference
        order.checkout_url = details.url
        order.status = "checkout_pending"
        enforce_deadline(db, campaign)
        expired_before_redirect = hold.status != "active" or campaign.status != "open"
        db.commit()
        if expired_before_redirect:
            raise OrderError(409, "Checkout hold expired before provider checkout opened")
        return respond(db, order)
    except (OrderError, ProviderError) as error:
        db.rollback()
        raise fail(error) from error


@router.post("/orders/{order_id}/cancel")
def cancel(order_id: UUID, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_origin(request)
    try:
        return respond(db, cancel_order(db, order_id, user.id))
    except OrderError as error:
        raise fail(error) from error


@router.post("/webhooks/{provider}")
async def webhook(provider: str, request: Request, db: Session = Depends(get_db)):
    if provider not in ("fake", "stripe", "paystack"):
        raise HTTPException(404, "Provider not found")
    raw = await request.body()
    signature = request.headers.get({"fake": "x-fake-signature", "stripe": "stripe-signature", "paystack": "x-paystack-signature"}[provider], "")
    try:
        event = parse_webhook(provider, raw, signature)
        if not event.event_id or not event.transaction_id:
            raise ProviderError("Incomplete provider event")
        if event.order_id:
            try:
                order_id = UUID(event.order_id)
            except ValueError:
                raise ProviderError("Invalid order association")
        else:
            associated = db.scalar(select(Order).where(Order.provider == provider, (Order.provider_transaction_id == event.transaction_id) | (Order.provider_reference == event.reference)))
            if associated is None:
                raise ProviderError("Provider event has no known order")
            order_id = associated.id
            event = replace(event, order_id=str(order_id))
        if event.refund_or_dispute:
            campaign, order, _ = get_order_locked(db, order_id)
            if order.provider != provider or (order.provider_reference != event.reference and order.provider_transaction_id != event.transaction_id):
                raise OrderError(409, "Payment reference does not match order")
            if db.scalar(select(ProviderEvent.id).where(ProviderEvent.provider == provider, ProviderEvent.event_id == event.event_id)) is None:
                db.add(ProviderEvent(provider=provider, event_id=event.event_id, order_id=order_id, event_type=event.event_type, transaction_id=None, payload_hash=hashlib.sha256(raw).hexdigest(), created_at=utcnow()))
                db.add(RemedyRecord(order_id=order_id, reason="refund_or_dispute", details=event.event_type, created_at=utcnow()))
                db.commit()
            return {"received": True, "status": order.status}
        if not event.successful:
            order = record_non_success(db, order_id, provider, event.event_id, event.transaction_id, event.reference, raw, event.event_type)
            return {"received": True, "status": order.status}
        if provider == "stripe":
            verify_fresh_stripe_session(event)
        order = confirm_payment(db, order_id, provider, event.event_id, event.transaction_id, event.reference, event.amount_minor, event.currency, raw, event.event_type)
        try:
            if order.status == "paid_pending_issuance":
                order = issue_paid_order(db, order.id)
        except Exception:
            db.rollback()  # Paid state and capacity reservation already committed for recovery.
            return {"received": True, "status": "paid_pending_issuance"}
        return {"received": True, "status": order.status}
    except (OrderError, ProviderError, json.JSONDecodeError, ValueError, TypeError, KeyError, AttributeError) as error:
        db.rollback()
        raise fail(error) from error


@router.post("/test/orders/{order_id}/confirm")
def fake_confirm(order_id: UUID, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_origin(request)
    if not available("fake"):
        raise HTTPException(403, "Fake payments are disabled")
    order = db.get(Order, order_id)
    if order is None or order.user_id != user.id or order.provider != "fake" or not order.provider_reference:
        raise HTTPException(404, "Order not found")
    raw = json.dumps({"id": "fake-event-" + str(order.id), "type": "payment.success", "data": {"reference": order.provider_reference, "transaction_id": "fake-txn-" + str(order.id), "amount": int(order.total_amount * 100), "currency": order.currency, "order_id": str(order.id)}}, sort_keys=True, separators=(",", ":")).encode()
    signature = hmac.new(settings.FAKE_PAYMENT_SECRET.encode(), raw, hashlib.sha256).hexdigest()
    event = parse_webhook("fake", raw, signature)
    try:
        order = confirm_payment(db, order_id, "fake", event.event_id, event.transaction_id, event.reference, event.amount_minor, event.currency, raw)
        if order.status == "paid_pending_issuance":
            order = issue_paid_order(db, order.id)
        return respond(db, order)
    except OrderError as error:
        raise fail(error) from error


@router.post("/admin/orders/recover")
def recover(request: Request, _: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    check_origin(request)
    ids = list(db.scalars(select(Order.id).where(Order.status == "paid_pending_issuance")))
    recovered = []
    for order_id in ids:
        try:
            issue_paid_order(db, order_id)
            recovered.append(str(order_id))
        except OrderError:
            db.rollback()
    return {"recovered": recovered}


@router.post("/admin/campaigns/{campaign_id}/reminders")
def reminders(campaign_id: UUID, request: Request, _: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    check_origin(request)
    try:
        return {"created": schedule_reminders(db, campaign_id), "delivery": "local_sink"}
    except OrderError as error:
        raise fail(error) from error


@router.get("/admin/remedies")
def remedies(_: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    rows = db.scalars(select(RemedyRecord).order_by(RemedyRecord.created_at.desc(), RemedyRecord.id.desc())).all()
    return [{"id": str(row.id), "order_id": str(row.order_id) if row.order_id else None,
             "coupon_id": str(row.coupon_id) if row.coupon_id else None,
             "reason": row.reason, "status": row.status, "details": row.details,
             "created_at": row.created_at.isoformat()} for row in rows]
