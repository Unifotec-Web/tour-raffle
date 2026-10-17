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
    ENABLE_LOCAL_DRAW: bool = False

    @model_validator(mode="after")
    def validate_production(self):
        if self.APP_ENV == "production" and (not self.SESSION_COOKIE_SECURE or not self.FRONTEND_URL.startswith("https://")):
            raise ValueError("Production requires secure cookies and an HTTPS frontend URL")
        return self

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
