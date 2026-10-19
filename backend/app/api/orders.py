"""Member checkout and authenticated provider callbacks."""
import hashlib
import hmac
import json
from dataclasses import replace
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Query
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.api.auth import check_origin
from app.api.deps import get_current_admin, get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.models import AuditLog, CheckoutHold, Coupon, Order, ProviderEvent, RemedyRecord, RemedyReviewEvent, User
from app.services.orders import OrderError, cancel_order, confirm_payment, create_order, enforce_deadline, get_order_locked, issue_paid_order, record_non_success, schedule_reminders
from app.services.payment_providers import ProviderError, available, create_checkout, parse_webhook, query_payment, verify_fresh_stripe_session
from app.services.redemption import utcnow

router = APIRouter(tags=["orders and payments"])

class OrderCreate(BaseModel):
    campaign_id: UUID
    quantity: int = Field(ge=1, le=100)
    provider: str = Field(pattern="^(fake|stripe|paystack)$")
    idempotency_key: str = Field(min_length=8, max_length=128)

class RemedyReview(BaseModel):
    decision: str = Field(pattern="^(investigate|escalate|defer)$")
    reason: str = Field(min_length=8, max_length=2000)


def order_states(db: Session, order: Order):
    remedies = db.scalars(select(RemedyRecord).where(RemedyRecord.order_id == order.id)).all()
    payment = "paid" if order.paid_at else "failed" if order.status in ("failed", "cancelled") else "pending"
    issuance = "issued" if order.status == "issued" else "pending" if order.status == "paid_pending_issuance" else "review_required" if order.status == "reconciliation_required" else "not_started"
    remedy = "review_required" if any(r.status == "pending_review" for r in remedies) else "under_review" if remedies else "none"
    return {"payment_status": payment, "issuance_status": issuance, "remedy_status": remedy}


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
            "paid_at": order.paid_at.isoformat() if order.paid_at else None, **order_states(db, order)}


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


def audit_payment(db: Session, admin: User, action: str, details: dict, request: Request):
    db.add(AuditLog(admin_email=admin.email, action=action, details=json.dumps(details, sort_keys=True),
                    ip_address=request.client.host if request.client else "local", created_at=utcnow()))


def remedy_response(db: Session, row: RemedyRecord):
    history = db.scalars(select(RemedyReviewEvent).where(RemedyReviewEvent.remedy_id == row.id).order_by(RemedyReviewEvent.created_at, RemedyReviewEvent.id)).all()
    return {"id": str(row.id), "order_id": str(row.order_id) if row.order_id else None,
            "coupon_id": str(row.coupon_id) if row.coupon_id else None, "reason": row.reason,
            "status": row.status, "details": row.details, "decision": row.decision,
            "review_reason": row.review_reason, "reviewed_by": str(row.reviewed_by) if row.reviewed_by else None,
            "reviewed_at": row.reviewed_at.isoformat() if row.reviewed_at else None,
            "created_at": row.created_at.isoformat(), "history": [{"reviewer_id": str(event.reviewer_id),
            "reviewer_email": event.reviewer_email, "decision": event.decision, "reason": event.reason,
            "created_at": event.created_at.isoformat()} for event in history]}


@router.get("/admin/orders")
def admin_orders(payment_status: str | None = Query(None, pattern="^(pending|paid|failed)$"),
                 issuance_status: str | None = Query(None, pattern="^(not_started|pending|issued|review_required)$"),
                 remedy_status: str | None = Query(None, pattern="^(none|review_required|under_review)$"),
                 provider: str | None = Query(None, pattern="^(fake|stripe|paystack)$"),
                 campaign_id: UUID | None = None, limit: int = Query(25, ge=1, le=100), offset: int = Query(0, ge=0),
                 _: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    query = select(Order)
    if campaign_id:
        query = query.where(Order.campaign_id == campaign_id)
    if provider:
        query = query.where(Order.provider == provider)
    if payment_status == "paid":
        query = query.where(Order.paid_at.is_not(None))
    elif payment_status == "failed":
        query = query.where(Order.paid_at.is_(None), Order.status.in_(["failed", "cancelled"]))
    elif payment_status == "pending":
        query = query.where(Order.paid_at.is_(None), Order.status.not_in(["failed", "cancelled"]))
    if issuance_status:
        statuses = {"issued": ["issued"], "pending": ["paid_pending_issuance"],
                    "review_required": ["reconciliation_required"],
                    "not_started": ["held", "checkout_pending", "failed", "cancelled"]}
        query = query.where(Order.status.in_(statuses[issuance_status]))
    remedy_exists = select(RemedyRecord.id).where(RemedyRecord.order_id == Order.id).exists()
    pending_remedy = select(RemedyRecord.id).where(RemedyRecord.order_id == Order.id, RemedyRecord.status == "pending_review").exists()
    if remedy_status == "none":
        query = query.where(~remedy_exists)
    elif remedy_status == "review_required":
        query = query.where(pending_remedy)
    elif remedy_status == "under_review":
        query = query.where(remedy_exists, ~pending_remedy)
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    rows = db.scalars(query.order_by(Order.created_at.desc(), Order.id.desc()).limit(limit).offset(offset)).all()
    return {"items": [dict(respond(db, row), owner_email=db.get(User, row.user_id).email) for row in rows],
            "total": total, "limit": limit, "offset": offset}


@router.get("/admin/orders/{order_id}")
def admin_order(order_id: UUID, _: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(404, "Order not found")
    data = respond(db, order)
    data["owner_email"] = db.get(User, order.user_id).email
    data["coupon_count"] = db.scalar(select(func.count()).select_from(Coupon).where(Coupon.order_id == order.id))
    data["remedies"] = [remedy_response(db, r) for r in db.scalars(select(RemedyRecord).where(RemedyRecord.order_id == order.id).order_by(RemedyRecord.created_at))]
    return data


@router.post("/admin/orders/{order_id}/reconcile")
def reconcile_order(order_id: UUID, request: Request, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    check_origin(request)
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(404, "Order not found")
    if not order.provider_reference:
        raise HTTPException(409, "Order has no provider checkout reference")
    try:
        payment = query_payment(order.provider, order.provider_reference)
    except ProviderError as error:
        audit_payment(db, admin, "payment.reconciliation_failed", {"order_id": str(order_id), "reason": str(error)}, request)
        db.commit()
        raise HTTPException(503, str(error)) from error
    if payment.reference != order.provider_reference or payment.status == "paid" and (not payment.transaction_id or payment.order_id != str(order.id)):
        audit_payment(db, admin, "payment.reconciliation_mismatch", {"order_id": str(order_id)}, request)
        db.commit()
        raise HTTPException(409, "Provider payment does not match order")
    if payment.status == "paid":
        raw = json.dumps({"reference": payment.reference, "transaction_id": payment.transaction_id,
                          "amount_minor": payment.amount_minor, "currency": payment.currency,
                          "order_id": payment.order_id}, sort_keys=True, separators=(",", ":")).encode()
        try:
            order = confirm_payment(db, order_id, order.provider, "reconcile:" + payment.transaction_id,
                                    payment.transaction_id, payment.reference, payment.amount_minor,
                                    payment.currency, raw, "payment.reconciled")
            if order.status == "paid_pending_issuance":
                order = issue_paid_order(db, order_id)
        except OrderError as error:
            db.rollback()
            audit_payment(db, admin, "payment.reconciliation_review", {"order_id": str(order_id), "reason": error.message}, request)
            db.commit()
            raise fail(error) from error
    audit_payment(db, admin, "payment.reconciled", {"order_id": str(order_id), "provider_status": payment.status, "order_status": order.status}, request)
    db.commit()
    return dict(respond(db, order), provider_status=payment.status)


@router.post("/admin/orders/{order_id}/recover")
def recover_one(order_id: UUID, request: Request, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    check_origin(request)
    try:
        order = issue_paid_order(db, order_id)
    except OrderError as error:
        raise fail(error) from error
    audit_payment(db, admin, "payment.issuance_recovered", {"order_id": str(order_id), "status": order.status}, request)
    db.commit()
    return respond(db, order)


@router.get("/admin/remedy-queue")
def remedy_queue(status: str | None = Query(None, pattern="^(pending_review|under_review)$"),
                 reason: str | None = None, campaign_id: UUID | None = None,
                 limit: int = Query(25, ge=1, le=100), offset: int = Query(0, ge=0),
                 _: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    query = select(RemedyRecord)
    if status:
        query = query.where(RemedyRecord.status == status)
    if reason:
        query = query.where(RemedyRecord.reason == reason)
    if campaign_id:
        query = query.outerjoin(Order, RemedyRecord.order_id == Order.id).outerjoin(Coupon, RemedyRecord.coupon_id == Coupon.id).where((Order.campaign_id == campaign_id) | (Coupon.campaign_id == campaign_id))
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    rows = db.scalars(query.order_by(RemedyRecord.created_at.desc(), RemedyRecord.id.desc()).limit(limit).offset(offset)).all()
    return {"items": [remedy_response(db, row) for row in rows], "total": total, "limit": limit, "offset": offset}


@router.get("/admin/remedy-queue/{remedy_id}")
def remedy_detail(remedy_id: UUID, _: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    row = db.get(RemedyRecord, remedy_id)
    if row is None:
        raise HTTPException(404, "Remedy not found")
    return remedy_response(db, row)


@router.post("/admin/remedy-queue/{remedy_id}/review")
def review_remedy(remedy_id: UUID, payload: RemedyReview, request: Request,
                  admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    check_origin(request)
    row = db.scalar(select(RemedyRecord).where(RemedyRecord.id == remedy_id).with_for_update())
    if row is None:
        raise HTTPException(404, "Remedy not found")
    now = utcnow()
    row.status = "under_review"
    row.decision = payload.decision
    row.review_reason = payload.reason
    row.reviewed_by = admin.id
    row.reviewed_at = now
    db.add(RemedyReviewEvent(remedy_id=row.id, reviewer_id=admin.id, reviewer_email=admin.email,
                             decision=payload.decision, reason=payload.reason, created_at=now))
    audit_payment(db, admin, "remedy.reviewed", {"remedy_id": str(row.id), "decision": payload.decision, "reason": payload.reason}, request)
    db.commit()
    return remedy_response(db, row)
