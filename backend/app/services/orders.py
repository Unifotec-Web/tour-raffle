"""Campaign-row serialized checkout, payment confirmation, issuance, and closure."""
import hashlib
import json
import secrets
from datetime import timedelta
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import AuditLog, Campaign, CheckoutHold, Coupon, NotificationRecord, Order, ProviderEvent, RemedyRecord
from app.services.redemption import utcnow

PRICE = Decimal("10.00")
CURRENCY = "USD"

class OrderError(Exception):
    def __init__(self, code: int, message: str):
        self.code, self.message = code, message


def lock_campaign(db: Session, campaign_id: UUID) -> Campaign:
    campaign = db.scalar(select(Campaign).where(Campaign.id == campaign_id).with_for_update())
    if campaign is None:
        raise OrderError(404, "Campaign not found")
    return campaign


def close_registration(db: Session, campaign: Campaign, reason: str, now=None) -> bool:
    """Caller holds campaign lock. Expiry and eligibility freeze commit together."""
    now = now or utcnow()
    if campaign.status != "open":
        return False
    campaign.status = "closed"
    campaign.updated_at = now
    for hold in db.scalars(select(CheckoutHold).where(CheckoutHold.campaign_id == campaign.id, CheckoutHold.status == "active").with_for_update()):
        hold.status = "expired"
        campaign.active_holds -= hold.quantity
    for order in db.scalars(select(Order).where(Order.campaign_id == campaign.id, Order.status == "paid_pending_issuance").with_for_update()):
        # An interrupted issuance is retained as a paid remedy, never issued after closure.
        order.status = "reconciliation_required"
        campaign.unused_reservations -= order.quantity
        db.add(RemedyRecord(order_id=order.id, reason="paid_unissued_at_closure", details="Verified payment requires manual remedy after registration closed", created_at=now))
    for coupon in db.scalars(select(Coupon).where(Coupon.campaign_id == campaign.id, Coupon.status.in_(["unused", "active"])).with_for_update()):
        if coupon.status == "unused":
            campaign.unused_reservations -= 1
            db.add(RemedyRecord(coupon_id=coupon.id, order_id=coupon.order_id, reason="expired_unused", details="Payment retained pending explicit remedy review", created_at=now))
        coupon.status = "expired"
    db.add(AuditLog(admin_email="system", action="campaign.status", details=json.dumps({"campaign_id": str(campaign.id), "from": "open", "to": "closed", "reason": reason}), ip_address="system", created_at=now))
    return True


def expire_holds(db: Session, campaign: Campaign, now=None) -> int:
    now = now or utcnow()
    count = 0
    for hold in db.scalars(select(CheckoutHold).where(CheckoutHold.campaign_id == campaign.id, CheckoutHold.status == "active", CheckoutHold.expires_at <= now).with_for_update()):
        hold.status = "expired"
        campaign.active_holds -= hold.quantity
        count += hold.quantity
    return count


def enforce_deadline(db: Session, campaign: Campaign, now=None):
    now = now or utcnow()
    if campaign.status == "open" and (now >= campaign.end_date or campaign.current_entries >= campaign.max_capacity):
        close_registration(db, campaign, "deadline" if now >= campaign.end_date else "registered entry limit", now)
    else:
        expire_holds(db, campaign, now)


def create_order(db: Session, owner_id: UUID, campaign_id: UUID, quantity: int, provider: str, idempotency_key: str) -> Order:
    try:
        campaign = lock_campaign(db, campaign_id)
        now = utcnow()
        enforce_deadline(db, campaign, now)
        existing = db.scalar(select(Order).where(Order.user_id == owner_id, Order.idempotency_key == idempotency_key))
        if existing:
            if existing.campaign_id != campaign_id or existing.quantity != quantity or existing.provider != provider:
                db.commit()  # Persist any due closure/hold expiry observed above.
                raise OrderError(409, "Idempotency key was used for another order")
            db.commit()
            return existing
        if campaign.status != "open" or not (campaign.start_date <= now < campaign.end_date):
            db.commit()
            raise OrderError(409, "Registration is closed")
        if campaign.current_entries + campaign.unused_reservations + campaign.active_holds + quantity > campaign.max_capacity:
            db.commit()
            raise OrderError(409, "No checkout capacity remains")
        if campaign.issued_count + campaign.active_holds + quantity > campaign.max_capacity:
            db.commit()
            raise OrderError(409, "Coupon issuance limit reached")
        order = Order(user_id=owner_id, campaign_id=campaign_id, quantity=quantity, unit_amount=PRICE, total_amount=PRICE * quantity, currency=CURRENCY, idempotency_key=idempotency_key, provider=provider, status="held", created_at=now)
        db.add(order)
        db.flush()
        db.add(CheckoutHold(order_id=order.id, campaign_id=campaign_id, quantity=quantity, status="active", expires_at=now + timedelta(minutes=settings.CHECKOUT_HOLD_MINUTES), created_at=now))
        campaign.active_holds += quantity
        db.commit()
        return order
    except IntegrityError as error:
        db.rollback()
        if getattr(getattr(error.orig, "diag", None), "constraint_name", None) == "uq_order_user_idempotency":
            raise OrderError(409, "Idempotency key was used for another order") from error
        raise
    except Exception:
        db.rollback()
        raise


def get_order_locked(db: Session, order_id: UUID) -> tuple[Campaign, Order, CheckoutHold]:
    ref = db.execute(select(Order.campaign_id).where(Order.id == order_id)).first()
    if ref is None:
        raise OrderError(404, "Order not found")
    campaign = lock_campaign(db, ref.campaign_id)
    order = db.scalar(select(Order).where(Order.id == order_id).with_for_update())
    hold = db.scalar(select(CheckoutHold).where(CheckoutHold.order_id == order_id).with_for_update())
    return campaign, order, hold


def cancel_order(db: Session, order_id: UUID, owner_id: UUID) -> Order:
    try:
        campaign, order, hold = get_order_locked(db, order_id)
        if order.user_id != owner_id:
            raise OrderError(404, "Order not found")
        if order.status in ("issued", "paid_pending_issuance", "reconciliation_required"):
            raise OrderError(409, "Paid orders require review")
        if order.status not in ("cancelled", "failed"):
            order.status = "cancelled"
            if hold.status == "active":
                hold.status = "cancelled"
                campaign.active_holds -= hold.quantity
        db.commit()
        return order
    except Exception:
        db.rollback()
        raise


def confirm_payment(db: Session, order_id: UUID, provider: str, event_id: str, transaction_id: str, reference: str, amount_minor: int, currency: str, raw: bytes, event_type: str = "payment.success") -> Order:
    """Authn of webhook happens before this call. Payment record commits before issuance."""
    try:
        campaign, order, hold = get_order_locked(db, order_id)
        now = utcnow()
        enforce_deadline(db, campaign, now)
        if order.provider != provider or order.provider_reference != reference:
            raise OrderError(409, "Payment reference does not match order")
        prior = db.scalar(select(ProviderEvent).where(ProviderEvent.provider == provider, ProviderEvent.event_id == event_id))
        if prior:
            if prior.order_id != order.id or prior.payload_hash != hashlib.sha256(raw).hexdigest():
                raise OrderError(409, "Provider event identifier conflict")
            db.commit()
            return order
        duplicate_transaction = db.scalar(select(ProviderEvent).where(ProviderEvent.provider == provider, ProviderEvent.transaction_id == transaction_id))
        if duplicate_transaction and duplicate_transaction.order_id != order.id:
            raise OrderError(409, "Provider transaction belongs to another order")
        db.add(ProviderEvent(provider=provider, event_id=event_id, order_id=order.id, event_type=event_type, transaction_id=transaction_id if not duplicate_transaction else None, payload_hash=hashlib.sha256(raw).hexdigest(), created_at=now))
        if amount_minor != int(order.total_amount * 100) or currency.upper() != order.currency:
            if order.paid_at is None:
                order.paid_amount = Decimal(amount_minor) / 100
                order.paid_currency = currency.upper()
                order.fx_snapshot = None  # Provider did not supply an exchange-rate snapshot.
                order.provider_transaction_id = transaction_id
                order.paid_at = now
                order.status = "reconciliation_required"
                if hold.status == "active":
                    hold.status = "cancelled"
                    campaign.active_holds -= hold.quantity
            db.add(RemedyRecord(order_id=order.id, reason="amount_currency_mismatch", details=json.dumps({"transaction_id": transaction_id, "amount_minor": amount_minor, "currency": currency.upper(), "expected_amount_minor": int(order.total_amount * 100), "expected_currency": order.currency}), created_at=now))
            db.commit()
            raise OrderError(409, "Payment amount or currency does not match order")
        if order.status in ("paid_pending_issuance", "issued", "reconciliation_required"):
            if order.provider_transaction_id and order.provider_transaction_id != transaction_id:
                db.add(RemedyRecord(order_id=order.id, reason="possible_duplicate_charge", details=f"Additional verified provider transaction: {transaction_id}", created_at=now))
            db.commit()
            return order
        order.paid_amount = Decimal(amount_minor) / 100
        order.paid_currency = currency.upper()
        order.fx_snapshot = json.dumps({"source_currency": currency.upper(), "settlement_currency": currency.upper(), "rate": "1"})
        order.provider_transaction_id = transaction_id
        order.paid_at = now
        if hold.status == "active" and hold.expires_at > now and campaign.status == "open":
            hold.status = "converted"
            campaign.active_holds -= order.quantity
            campaign.unused_reservations += order.quantity
            order.status = "paid_pending_issuance"
        else:
            if hold.status == "active":
                hold.status = "expired"
                campaign.active_holds -= order.quantity
            if (campaign.status == "open" and campaign.start_date <= now < campaign.end_date
                    and campaign.current_entries + campaign.unused_reservations + campaign.active_holds + order.quantity <= campaign.max_capacity
                    and campaign.issued_count + campaign.active_holds + order.quantity <= campaign.max_capacity):
                hold.status = "converted"
                campaign.unused_reservations += order.quantity
                order.status = "paid_pending_issuance"
            else:
                order.status = "reconciliation_required"
                db.add(RemedyRecord(order_id=order.id, reason="paid_without_capacity", details="Verified payment received after reservation expired or registration closed", created_at=now))
        db.commit()
        return order
    except Exception:
        db.rollback()
        raise


def issue_paid_order(db: Session, order_id: UUID) -> Order:
    try:
        campaign, order, hold = get_order_locked(db, order_id)
        enforce_deadline(db, campaign)
        if order.status in ("issued", "reconciliation_required"):
            db.commit()
            return order
        if order.status == "paid_pending_issuance" and campaign.status != "open":
            order.status = "reconciliation_required"
            campaign.unused_reservations -= order.quantity
            db.add(RemedyRecord(order_id=order.id, reason="paid_unissued_at_closure", details="Verified payment requires manual remedy after closure", created_at=utcnow()))
            db.commit()
            return order
        if order.status != "paid_pending_issuance" or hold.status != "converted":
            raise OrderError(409, "Order is not ready for issuance")
        existing = db.scalars(select(Coupon).where(Coupon.order_id == order.id).order_by(Coupon.order_position)).all()
        if existing:
            if (len(existing) != order.quantity
                    or {coupon.order_position for coupon in existing} != set(range(order.quantity))
                    or any(coupon.user_id != order.user_id or coupon.campaign_id != campaign.id for coupon in existing)):
                raise OrderError(409, "Partial issuance requires manual reconciliation")
        else:
            if campaign.issued_count + order.quantity > campaign.max_capacity:
                raise OrderError(409, "Coupon issuance limit reached")
            now = utcnow()
            for position in range(order.quantity):
                db.add(Coupon(code="TR-" + secrets.token_hex(16).upper(), campaign_id=campaign.id, user_id=order.user_id, order_id=order.id, order_position=position, status="unused", purchase_date=now, valid_until=campaign.end_date))
            campaign.issued_count += order.quantity
        order.status = "issued"
        db.commit()
        return order
    except Exception:
        db.rollback()
        raise


def schedule_reminders(db: Session, campaign_id: UUID) -> int:
    try:
        campaign = lock_campaign(db, campaign_id)
        now = utcnow()
        enforce_deadline(db, campaign, now)
        created = 0
        if campaign.status == "open" and now < campaign.end_date and campaign.end_date - now <= timedelta(days=7):
            for coupon in db.scalars(select(Coupon).where(Coupon.campaign_id == campaign_id, Coupon.status == "unused")):
                if db.scalar(select(NotificationRecord.id).where(NotificationRecord.coupon_id == coupon.id, NotificationRecord.kind == "deadline_reminder")) is None:
                    db.add(NotificationRecord(coupon_id=coupon.id, kind="deadline_reminder", channel="local_sink", status="recorded", created_at=now))
                    created += 1
        db.commit()
        return created
    except Exception:
        db.rollback()
        raise


def record_non_success(db: Session, order_id: UUID, provider: str, event_id: str, transaction_id: str, reference: str, raw: bytes, event_type: str) -> Order:
    """Record out-of-order failures without reversing an already verified payment."""
    try:
        campaign, order, hold = get_order_locked(db, order_id)
        if order.provider != provider or order.provider_reference != reference:
            raise OrderError(409, "Payment reference does not match order")
        prior = db.scalar(select(ProviderEvent).where(ProviderEvent.provider == provider, ProviderEvent.event_id == event_id))
        if prior:
            if prior.order_id != order.id or prior.payload_hash != hashlib.sha256(raw).hexdigest():
                raise OrderError(409, "Provider event identifier conflict")
            db.commit()
            return order
        duplicate = db.scalar(select(ProviderEvent).where(ProviderEvent.provider == provider, ProviderEvent.transaction_id == transaction_id))
        if duplicate and duplicate.order_id != order.id:
            raise OrderError(409, "Provider transaction belongs to another order")
        db.add(ProviderEvent(provider=provider, event_id=event_id, order_id=order.id, event_type=event_type, transaction_id=transaction_id if not duplicate else None, payload_hash=hashlib.sha256(raw).hexdigest(), created_at=utcnow()))
        if event_type in ("payment.failed", "checkout.session.async_payment_failed", "checkout.session.expired", "charge.failed") and order.status in ("held", "checkout_pending"):
            order.status = "failed"
            if hold.status == "active":
                hold.status = "cancelled"
                campaign.active_holds -= hold.quantity
        db.commit()
        return order
    except Exception:
        db.rollback()
        raise
