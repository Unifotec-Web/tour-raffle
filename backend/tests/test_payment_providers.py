"""Sandbox adapter contract checks without external credentials or network."""
import hashlib
import hmac
import json
import time
from types import SimpleNamespace
from uuid import uuid4
from decimal import Decimal

import pytest

from app.core.config import settings
from app.services import payment_providers as providers


def test_stripe_test_signature_and_checkout_contract(monkeypatch):
    monkeypatch.setattr(settings, "APP_ENV", "test")
    monkeypatch.setattr(settings, "ENABLE_STRIPE_SANDBOX", True)
    monkeypatch.setattr(settings, "STRIPE_SECRET_KEY", "sk_test_local")
    monkeypatch.setattr(settings, "STRIPE_WEBHOOK_SECRET", "whsec_local")
    order_id = str(uuid4())
    raw = json.dumps({"id": "evt_test", "type": "checkout.session.completed", "livemode": False,
                      "data": {"object": {"id": "cs_test_session", "client_reference_id": order_id,
                                          "payment_intent": "pi_test_payment", "amount_total": 1000,
                                          "currency": "usd", "payment_status": "paid"}}}).encode()
    timestamp = int(time.time())
    digest = hmac.new(settings.STRIPE_WEBHOOK_SECRET.encode(), str(timestamp).encode() + b"." + raw, hashlib.sha256).hexdigest()
    event = providers.parse_webhook("stripe", raw, f"t={timestamp},v1={digest}")
    assert event.successful and event.order_id == order_id and event.reference == "cs_test_session"
    with pytest.raises(providers.ProviderError):
        providers.parse_webhook("stripe", raw, f"t={timestamp-301},v1={digest}")
    with pytest.raises(providers.ProviderError):
        providers.parse_webhook("stripe", raw + b" ", f"t={timestamp},v1={digest}")
    live = raw.replace(b'"livemode": false', b'"livemode": true')
    live_digest = hmac.new(settings.STRIPE_WEBHOOK_SECRET.encode(), str(timestamp).encode() + b"." + live, hashlib.sha256).hexdigest()
    with pytest.raises(providers.ProviderError):
        providers.parse_webhook("stripe", live, f"t={timestamp},v1={live_digest}")

    calls = []
    class Client:
        def __init__(self, **kwargs): pass
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def post(self, url, **kwargs):
            calls.append((url, kwargs))
            return SimpleNamespace(status_code=200, json=lambda: {"id": "cs_test_session", "url": "https://checkout.stripe.com/c/test"})
        def get(self, url, **kwargs):
            calls.append((url, kwargs))
            return SimpleNamespace(status_code=200, json=lambda: {"id": "cs_test_session", "livemode": False, "status": "complete", "payment_status": "paid", "amount_total": 1000, "currency": "usd", "client_reference_id": order_id, "payment_intent": "pi_test_payment"})
    monkeypatch.setattr(providers.httpx, "Client", Client)
    order = SimpleNamespace(id=order_id, quantity=2, total_amount=Decimal("20.00"), currency="USD")
    checkout = providers.create_checkout("stripe", order, "member@example.com")
    assert checkout.reference == "cs_test_session"
    assert calls[0][1]["data"]["line_items[0][price_data][unit_amount]"] == "1000"
    assert calls[0][1]["data"]["client_reference_id"] == order_id
    assert calls[0][1]["headers"]["Idempotency-Key"] == "tour-raffle-" + order_id
    providers.verify_fresh_stripe_session(event)
    assert calls[-1][0].endswith("/cs_test_session")
    queried = providers.query_payment("stripe", "cs_test_session")
    assert (queried.status, queried.order_id, queried.amount_minor, queried.currency) == ("paid", order_id, 1000, "USD")


def test_paystack_signature_remote_verification_and_checkout_contract(monkeypatch):
    monkeypatch.setattr(settings, "APP_ENV", "test")
    monkeypatch.setattr(settings, "ENABLE_PAYSTACK_SANDBOX", True)
    monkeypatch.setattr(settings, "PAYSTACK_SECRET_KEY", "sk_test_local")
    order_id = str(uuid4())
    reference = "tr-" + order_id
    raw = json.dumps({"event": "charge.success", "data": {"id": 42, "domain": "test", "status": "success", "reference": reference,
                      "amount": 2000, "currency": "USD", "metadata": {"order_id": order_id}}}).encode()
    signature = hmac.new(settings.PAYSTACK_SECRET_KEY.encode(), raw, hashlib.sha512).hexdigest()
    calls=[]
    class Client:
        def __init__(self, **kwargs): pass
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def get(self, url, **kwargs):
            calls.append(("get",url,kwargs))
            return SimpleNamespace(status_code=200,json=lambda:{"data":{"domain":"test","status":"success","reference":reference,"amount":2000,"currency":"USD"}})
        def post(self, url, **kwargs):
            calls.append(("post",url,kwargs))
            return SimpleNamespace(status_code=200,json=lambda:{"status":True,"data":{"reference":reference,"authorization_url":"https://checkout.paystack.com/test"}})
    monkeypatch.setattr(providers.httpx, "Client", Client)
    event = providers.parse_webhook("paystack", raw, signature)
    assert event.successful and event.amount_minor == 2000 and event.order_id == order_id
    assert calls[0][1].endswith(reference)
    with pytest.raises(providers.ProviderError):
        providers.parse_webhook("paystack", raw, "bad")
    order = SimpleNamespace(id=order_id,quantity=2,total_amount=Decimal("20.00"),currency="USD")
    checkout = providers.create_checkout("paystack",order,"member@example.com")
    assert checkout.reference == reference
    assert calls[-1][2]["json"]["amount"] == "2000" and calls[-1][2]["json"]["currency"] == "USD"
    class VerifyClient(Client):
        def get(self, url, **kwargs):
            return SimpleNamespace(status_code=200,json=lambda:{"status":True,"data":{"id":42,"domain":"test","status":"success","reference":reference,"amount":2000,"currency":"USD","metadata":{"order_id":order_id}}})
    monkeypatch.setattr(providers.httpx, "Client", VerifyClient)
    queried = providers.query_payment("paystack", reference)
    assert (queried.status, queried.order_id, queried.transaction_id, queried.amount_minor) == ("paid", order_id, "42", 2000)
    monkeypatch.setattr(settings, "APP_ENV", "production")
    assert not providers.available("paystack")
