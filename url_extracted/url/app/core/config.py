import os
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    # allow comma-separated string in env; we will accept a single string or list
    ALLOWED_ORIGINS: str = "*"
    TIMEOUT_SECONDS: int = 20
    STORAGE_PATH: str = str(BASE_DIR / "app" / "storage" / "images")
    SUPPORTED_DOMAINS: List[str] = ["amazon", "myntra", "ajio", "flipkart"]
    USER_AGENT: str = "ai-wardrobe-bot/1.0 (+https://example.com)"

    model_config = {"env_file": ".env"}


settings = Settings()

# Ensure storage path exists
os.makedirs(settings.STORAGE_PATH, exist_ok=True)
