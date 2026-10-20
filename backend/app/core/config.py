from pydantic_settings import BaseSettings
from pydantic import model_validator

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_NAME: str = "Tour Raffle API"
    API_V1_PREFIX: str = "/api/v1"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/tour_raffle"
    SESSION_COOKIE_SECURE: bool = False
    SESSION_HOURS: int = 8
    FRONTEND_URL: str = "http://localhost:3000"
    EMAIL_TOKEN_SECRET: str = "local-development-only-email-token-secret-change-me"
    EMAIL_DELIVERY_MODE: str = "local"
    LOCAL_EMAIL_SINK_DIR: str = "/tmp/tour-raffle-mail"
    ENABLE_LOCAL_DRAW: bool = False
    ENABLE_FAKE_PAYMENTS: bool = False
    ENABLE_STRIPE_SANDBOX: bool = False
    ENABLE_PAYSTACK_SANDBOX: bool = False
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    PAYSTACK_SECRET_KEY: str = ""
    FAKE_PAYMENT_SECRET: str = ""
    CHECKOUT_HOLD_MINUTES: int = 30
    CLAIM_REQUIRE_PHONE: bool = False
    CLAIM_REQUIRE_PREFERENCE_NOTE: bool = False

    @model_validator(mode="after")
    def validate_production(self):
        if self.APP_ENV == "production" and (not self.SESSION_COOKIE_SECURE or not self.FRONTEND_URL.startswith("https://")):
            raise ValueError("Production requires secure cookies and an HTTPS frontend URL")
        if self.APP_ENV == "production" and (self.ENABLE_FAKE_PAYMENTS or self.ENABLE_STRIPE_SANDBOX or self.ENABLE_PAYSTACK_SANDBOX):
            raise ValueError("Production payment execution is disabled")
        if self.APP_ENV == "production" and (self.EMAIL_TOKEN_SECRET == "local-development-only-email-token-secret-change-me" or len(self.EMAIL_TOKEN_SECRET) < 32 or self.EMAIL_DELIVERY_MODE == "local"):
            raise ValueError("Production requires a configured email token secret and delivery provider")
        if self.CHECKOUT_HOLD_MINUTES < 1 or self.CHECKOUT_HOLD_MINUTES > 60:
            raise ValueError("Checkout hold must be 1 to 60 minutes")
        return self

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
