from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
from app.config import settings

# Passlib CryptContext for hashing passwords using bcrypt scheme
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a stored hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Computes a secure bcrypt hash of a plain-text password.
    """
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], role: str, expires_delta: Union[timedelta, None] = None) -> str:
    """
    Encodes a payload containing sub (user id/email) and role into a JWT token
    with an expiration timestamp.
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=120)  # Default 2 hours session
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt
