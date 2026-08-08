import hashlib
import hmac
import base64
import json
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from app.config import settings

SECRET_KEY = getattr(settings, "JWT_SECRET", "").strip()
ALGORITHM = getattr(settings, "JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

def hash_password(password: str) -> str:
    """Simple robust password hashing using SHA256 + salt."""
    salt = "chms_secure_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def _b64_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _require_secret_key() -> str:
    if not SECRET_KEY:
        raise RuntimeError("JWT_SECRET is not configured.")
    return SECRET_KEY

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    secret_key = _require_secret_key()
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": int(expire.timestamp())})
    
    # Try using python-jose if available
    try:
        from jose import jwt
        return jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)
    except Exception:
        pass

    # Pure Python JWT implementation
    header = {"alg": "HS256", "typ": "JWT"}
    header_json = json.dumps(header, separators=(',', ':')).encode('utf-8')
    payload_json = json.dumps(to_encode, separators=(',', ':')).encode('utf-8')

    b64_header = _b64_encode(header_json)
    b64_payload = _b64_encode(payload_json)

    signing_input = f"{b64_header}.{b64_payload}".encode('utf-8')
    signature = hmac.new(secret_key.encode('utf-8'), signing_input, hashlib.sha256).digest()
    b64_signature = _b64_encode(signature)

    return f"{b64_header}.{b64_payload}.{b64_signature}"

class TokenExpiredError(Exception):
    pass

class TokenInvalidError(Exception):
    pass

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    secret_key = _require_secret_key()
    try:
        from jose import jwt, ExpiredSignatureError, JWTError
        try:
            return jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        except ExpiredSignatureError:
            raise TokenExpiredError("Token has expired")
        except JWTError:
            raise TokenInvalidError("Invalid signature or token structure")
    except ImportError:
        pass

    try:
        parts = token.split('.')
        if len(parts) != 3:
            raise TokenInvalidError("Invalid token segments count")
        b64_header, b64_payload, b64_signature = parts
        header = json.loads(_b64_decode(b64_header).decode('utf-8'))
        if header.get("alg") != ALGORITHM:
            raise TokenInvalidError("Unsupported token algorithm")

        signing_input = f"{b64_header}.{b64_payload}".encode('utf-8')
        expected_signature = hmac.new(
            secret_key.encode('utf-8'),
            signing_input,
            hashlib.sha256
        ).digest()
        actual_signature = _b64_decode(b64_signature)
        if not hmac.compare_digest(actual_signature, expected_signature):
            raise TokenInvalidError("Invalid token signature")

        payload_bytes = _b64_decode(b64_payload)
        payload = json.loads(payload_bytes.decode('utf-8'))

        if "exp" in payload and payload["exp"] < time.time():
            raise TokenExpiredError("Token has expired")
        return payload
    except (TokenExpiredError, TokenInvalidError):
        raise
    except Exception:
        raise TokenInvalidError("Invalid token format")
