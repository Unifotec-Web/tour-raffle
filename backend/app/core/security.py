from hashlib import sha256
from passlib.context import CryptContext
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def new_session_token() -> str:
    return secrets.token_urlsafe(32)

def token_digest(token: str) -> str:
    return sha256(token.encode()).hexdigest()

def generate_secure_coupon_code() -> str:
    # 128 random bits; issued only by local/test fixtures until commerce exists.
    value = secrets.token_hex(16).upper()
    return "TRF-" + "-".join(value[index:index + 8] for index in range(0, 32, 8))
