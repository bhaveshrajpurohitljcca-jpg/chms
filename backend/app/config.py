import os
from typing import List, Union

def _load_env_file(filepath: str):
    if not os.path.exists(filepath):
        return
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                os.environ[key] = value

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
_load_env_file(env_path)

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    try:
        from pydantic import BaseSettings
        SettingsConfigDict = None
    except ImportError:
        class BaseSettings:
            def __init__(self, **kwargs):
                for k, v in kwargs.items():
                    setattr(self, k, v)
        SettingsConfigDict = None

class Settings(BaseSettings):
    PROJECT_NAME: str = "College Hackathon Management System"
    ENVIRONMENT: str = "local"
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = [
        o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:5174,https://chms-lj.vercel.app").split(",")
    ]

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://placeholder.supabase.co")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "placeholder")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM: str = "HS256"

    # Email (Gmail SMTP & HTTP API Providers)
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    RESEND_FROM_EMAIL: str = os.getenv("RESEND_FROM_EMAIL", "")
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://chms-lj.vercel.app")

    if SettingsConfigDict is not None:
        model_config = SettingsConfigDict(
            env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
            env_file_encoding="utf-8",
            case_sensitive=True,
            extra="ignore"
        )

settings = Settings()
