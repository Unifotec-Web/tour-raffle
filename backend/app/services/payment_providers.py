"""Disabled-by-default provider adapters. Redirects never confirm payment."""
import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from urllib.parse import quote

import httpx

from app.core.config import settings

class ProviderError(Exception):
    pass

@dataclass(frozen=True)
class Checkout:
    reference: str
    url: str

@dataclass(frozen=True)
class VerifiedEvent:
    event_id: str
    event_type: str
    reference: str
    transaction_id: str
    amount_minor: int
    currency: str
    order_id: str
    successful: bool
    refund_or_dispute: bool = False

@dataclass(frozen=True)
class ProviderPayment:
    status: str  # paid, pending, failed, or review_required
    reference: str
    transaction_id: str
    amount_minor: int
    currency: str
    order_id: str


def query_payment(provider: str, reference: str) -> ProviderPayment:
    """Fetch current sandbox provider state; never infer payment from a redirect."""
    if not available(provider) or not reference:
        raise ProviderError("Payment provider is not configured for sandbox use")
    if provider == "fake":
        # Tests inject a deterministic fake provider ledger. The built-in fake has
        # no external ledger, so it cannot prove a missing payment.
        return ProviderPayment("pending", reference, "", 0, "", "")
    try:
        with httpx.Client(timeout=12) as client:
            if provider == "stripe":
                if not reference.startswith("cs_test_"):
                    raise ProviderError("Stripe test checkout reference is invalid")
                response = client.get("https://api.stripe.com/v1/checkout/sessions/" + quote(reference, safe=""), auth=(settings.STRIPE_SECRET_KEY, ""))
            else:
                response = client.get("https://api.paystack.co/transaction/verify/" + quote(reference, safe=""), headers={"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"})
    except httpx.HTTPError as error:
        raise ProviderError("Sandbox payment provider is unavailable") from error
    if response.status_code >= 400:
        raise ProviderError("Sandbox payment verification unavailable")
    try:
        body = response.json()
        if provider == "stripe":
            if body.get("id") != reference or body.get("livemode") is not False:
                raise ProviderError("Stripe sandbox session mismatch")
            status = "paid" if body.get("payment_status") == "paid" and body.get("status") == "complete" else "failed" if body.get("status") == "expired" else "pending"
            return ProviderPayment(status, reference, str(body.get("payment_intent") or ""), int(body.get("amount_total") or 0), str(body.get("currency") or "").upper(), str(body.get("client_reference_id") or ""))
        data = body.get("data") or {}
        if body.get("status") is not True or data.get("domain") != "test" or data.get("reference") != reference:
            raise ProviderError("Paystack sandbox transaction mismatch")
        raw_status = str(data.get("status") or "")
        status = "paid" if raw_status == "success" else "review_required" if raw_status in ("reversed", "refunded", "disputed") else "failed" if raw_status in ("failed", "abandoned") else "pending"
        metadata = data.get("metadata") or {}
        if isinstance(metadata, str):
            metadata = json.loads(metadata)
        return ProviderPayment(status, reference, str(data.get("id") or ""), int(data.get("amount") or 0), str(data.get("currency") or "").upper(), str(metadata.get("order_id") or "") if isinstance(metadata, dict) else "")
    except (ValueError, TypeError, AttributeError, json.JSONDecodeError) as error:
        raise ProviderError("Invalid sandbox provider response") from error


def available(provider: str) -> bool:
    local = settings.APP_ENV in ("development", "test")
    return local and {
        "fake": settings.ENABLE_FAKE_PAYMENTS and bool(settings.FAKE_PAYMENT_SECRET),
        "stripe": settings.ENABLE_STRIPE_SANDBOX and settings.STRIPE_SECRET_KEY.startswith("sk_test_") and settings.STRIPE_WEBHOOK_SECRET.startswith("whsec_"),
        "paystack": settings.ENABLE_PAYSTACK_SANDBOX and settings.PAYSTACK_SECRET_KEY.startswith("sk_test_"),
    }.get(provider, False)


def create_checkout(provider: str, order, email: str) -> Checkout:
    if not available(provider):
        raise ProviderError("Payment provider is not configured for sandbox use")
    oid = str(order.id)
    return_url = f"{settings.FRONTEND_URL}/dashboard/payment/processing?order={oid}"
    if provider == "fake":
        return Checkout(f"fake-{oid}", f"{settings.FRONTEND_URL}/dashboard/checkout?order={oid}&fake=1")
    if provider == "stripe":
        data = {
            "mode": "payment", "client_reference_id": oid, "customer_email": email,
            "success_url": return_url, "cancel_url": f"{settings.FRONTEND_URL}/dashboard/checkout?order={oid}&cancelled=1",
            "line_items[0][price_data][currency]": "usd", "line_items[0][price_data][unit_amount]": "1000",
            "line_items[0][price_data][product_data][name]": "Tour Raffle coupon",
            "line_items[0][quantity]": str(order.quantity), "metadata[order_id]": oid,
            "expires_at": str(int(time.time()) + settings.CHECKOUT_HOLD_MINUTES * 60),
        }
        with httpx.Client(timeout=12) as client:
            response = client.post("https://api.stripe.com/v1/checkout/sessions", auth=(settings.STRIPE_SECRET_KEY, ""), headers={"Idempotency-Key": f"tour-raffle-{oid}"}, data=data)
        if response.status_code >= 400:
            raise ProviderError("Stripe sandbox checkout failed")
        result = response.json()
        if not result.get("id", "").startswith("cs_test_") or not result.get("url", "").startswith("https://checkout.stripe.com/"):
            raise ProviderError("Stripe sandbox returned invalid checkout details")
        return Checkout(result["id"], result["url"])
    reference = "tr-" + oid
    data = {"email": email, "amount": str(int(order.total_amount * 100)), "currency": order.currency,
            "reference": reference, "callback_url": return_url, "metadata": {"order_id": oid}}
    with httpx.Client(timeout=12) as client:
        response = client.post("https://api.paystack.co/transaction/initialize", headers={"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"}, json=data)
    if response.status_code >= 400:
        raise ProviderError("Paystack sandbox checkout failed")
    result = response.json()
    details = result.get("data") or {}
    if not result.get("status") or details.get("reference") != reference or not details.get("authorization_url", "").startswith("https://checkout.paystack.com/"):
        raise ProviderError("Paystack sandbox returned invalid checkout details")
    return Checkout(reference, details["authorization_url"])


def parse_webhook(provider: str, raw: bytes, signature: str) -> VerifiedEvent:
    if not available(provider):
        raise ProviderError("Payment provider is disabled")
    if provider == "stripe":
        values = {}
        for component in signature.split(","):
            if "=" in component:
                key, value = component.strip().split("=", 1)
                values.setdefault(key, []).append(value)
        try:
            timestamp = int(values["t"][0])
            candidates = values["v1"]
        except (KeyError, ValueError, IndexError):
            raise ProviderError("Invalid Stripe signature")
        if abs(time.time() - timestamp) > 300:
            raise ProviderError("Stale Stripe signature")
        expected = hmac.new(settings.STRIPE_WEBHOOK_SECRET.encode(), str(timestamp).encode() + b"." + raw, hashlib.sha256).hexdigest()
        if not any(hmac.compare_digest(expected, candidate) for candidate in candidates):
            raise ProviderError("Invalid Stripe signature")
        event = json.loads(raw)
        if not isinstance(event, dict):
            raise ProviderError("Invalid Stripe event")
        if event.get("livemode") is not False:
            raise ProviderError("Only Stripe test-mode events are accepted")
        obj = (event.get("data") or {}).get("object") or {}
        kind = event.get("type", "")
        if kind not in ("checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired", "charge.refunded", "charge.dispute.created"):
            raise ProviderError("Unsupported Stripe event")
        order_id = obj.get("client_reference_id") or (obj.get("metadata") or {}).get("order_id", "")
        return VerifiedEvent(str(event.get("id", "")), kind, str(obj.get("id", "")), str(obj.get("payment_intent") or obj.get("id", "")), int(obj.get("amount_total") or 0), str(obj.get("currency") or "").upper(), str(order_id), kind in ("checkout.session.completed", "checkout.session.async_payment_succeeded") and obj.get("payment_status") == "paid", kind in ("charge.refunded", "charge.dispute.created"))
    secret = settings.FAKE_PAYMENT_SECRET if provider == "fake" else settings.PAYSTACK_SECRET_KEY
    digest = hmac.new(secret.encode(), raw, hashlib.sha256 if provider == "fake" else hashlib.sha512).hexdigest()
    if not hmac.compare_digest(digest, signature):
        raise ProviderError("Invalid payment signature")
    event = json.loads(raw)
    if not isinstance(event, dict):
        raise ProviderError("Invalid payment event")
    if provider == "fake":
        data = event.get("data") or {}
        return VerifiedEvent(str(event.get("id", "")), str(event.get("type", "")), str(data.get("reference", "")), str(data.get("transaction_id", "")), int(data.get("amount", 0)), str(data.get("currency", "")).upper(), str(data.get("order_id", "")), event.get("type") == "payment.success", event.get("type") in ("payment.refunded", "payment.disputed"))
    data = event.get("data") or {}
    if data.get("domain") != "test":
        raise ProviderError("Only Paystack test-mode events are accepted")
    kind = str(event.get("event", ""))
    reference = str(data.get("reference") or (data.get("transaction") or {}).get("reference") or "")
    if kind == "charge.success":
        with httpx.Client(timeout=12) as client:
            response = client.get("https://api.paystack.co/transaction/verify/" + quote(reference, safe=""), headers={"Authorization": f"Bearer {secret}"})
        if response.status_code >= 400:
            raise ProviderError("Paystack verification unavailable")
        verified = response.json().get("data") or {}
        if verified.get("domain") != "test" or verified.get("status") != "success" or verified.get("reference") != reference or int(verified.get("amount", -1)) != int(data.get("amount", -2)) or str(verified.get("currency", "")).upper() != str(data.get("currency", "")).upper():
            raise ProviderError("Paystack transaction verification mismatch")
    metadata = data.get("metadata") or {}
    if isinstance(metadata, str):
        try:
            metadata = json.loads(metadata)
        except json.JSONDecodeError:
            metadata = {}
    if not isinstance(metadata, dict):
        metadata = {}
    return VerifiedEvent(str(event.get("id") or f"{kind}:{data.get('id')}"), kind, reference, str(data.get("id", "")), int(data.get("amount") or 0), str(data.get("currency") or "").upper(), str(metadata.get("order_id", "")), kind == "charge.success" and data.get("status") == "success", kind in ("charge.refund.processed", "charge.dispute.create"))


def verify_fresh_stripe_session(event: VerifiedEvent) -> None:
    """Confirm the current test Checkout Session before delivering coupons."""
    if not event.successful:
        return
    if not available("stripe") or not event.reference.startswith("cs_test_"):
        raise ProviderError("Stripe test checkout reference is invalid")
    with httpx.Client(timeout=12) as client:
        response = client.get("https://api.stripe.com/v1/checkout/sessions/" + quote(event.reference, safe=""), auth=(settings.STRIPE_SECRET_KEY, ""))
    if response.status_code >= 400:
        raise ProviderError("Stripe sandbox session verification unavailable")
    session = response.json()
    if (session.get("id") != event.reference or session.get("livemode") is not False
            or session.get("payment_status") != "paid" or session.get("status") != "complete"
            or int(session.get("amount_total") or -1) != event.amount_minor
            or str(session.get("currency") or "").upper() != event.currency
            or session.get("client_reference_id") != event.order_id
            or str(session.get("payment_intent") or "") != event.transaction_id):
        raise ProviderError("Stripe sandbox session verification mismatch")
