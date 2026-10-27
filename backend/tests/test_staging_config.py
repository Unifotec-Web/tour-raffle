import pytest
from pydantic import ValidationError
from fastapi import HTTPException
from starlette.requests import Request

from app.api import auth
from app.core.config import Settings


def staging(**changes):
    values = dict(APP_ENV="staging", FRONTEND_URL="https://raffle-staging.unifotecweb.com",
                  SESSION_COOKIE_SECURE=True, EMAIL_TOKEN_SECRET="x" * 48,
                  EMAIL_DELIVERY_MODE="disabled")
    values.update(changes)
    return Settings(**values)


def test_staging_defaults_keep_mutations_and_messaging_disabled():
    config = staging()
    assert config.FRONTEND_URL == "https://raffle-staging.unifotecweb.com"
    assert not config.ENABLE_LOCAL_DRAW and not config.ENABLE_FAKE_PAYMENTS


def test_staging_origin_is_exact(monkeypatch):
    monkeypatch.setattr(auth, "settings", staging())
    def request(origin):
        return Request({"type": "http", "headers": [(b"origin", origin.encode())]})
    auth.check_origin(request("https://raffle-staging.unifotecweb.com"))
    with pytest.raises(HTTPException) as error:
        auth.check_origin(request("https://raffle-staging.unifotecweb.com.evil.example"))
    assert error.value.status_code == 403


@pytest.mark.parametrize("change", [
    {"FRONTEND_URL": "http://raffle-staging.unifotecweb.com"},
    {"SESSION_COOKIE_SECURE": False},
    {"ENABLE_LOCAL_DRAW": True},
    {"ENABLE_FAKE_PAYMENTS": True},
    {"ENABLE_STRIPE_SANDBOX": True},
    {"ENABLE_PAYSTACK_SANDBOX": True},
    {"EMAIL_DELIVERY_MODE": "local"},
    {"EMAIL_DELIVERY_MODE": "provider"},
    {"EMAIL_TOKEN_SECRET": "short"},
])
def test_staging_rejects_unsafe_settings(change):
    with pytest.raises(ValidationError):
        staging(**change)
