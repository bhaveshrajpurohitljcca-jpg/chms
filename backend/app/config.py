import os
from typing import List, Union

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
        o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:5174").split(",")
    ]

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://placeholder.supabase.co")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "placeholder")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-for-chms-development-at-least-32-chars-long")
    JWT_ALGORITHM: str = "HS256"

    if SettingsConfigDict is not None:
        model_config = SettingsConfigDict(
            env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
            env_file_encoding="utf-8",
            case_sensitive=True,
            extra="ignore"
        )

settings = Settings()
