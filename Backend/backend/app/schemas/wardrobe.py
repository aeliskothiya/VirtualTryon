from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class WardrobeItemOut(BaseModel):
    id: str
    user_id: str
    type: str
    image_url: str
    occasion: Optional[str] = None
    embedding_done: bool
    embedding_error: Optional[str] = None
    embedding_updated_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WardrobeEmbeddingSyncOut(BaseModel):
    processed: int
    created: int
    existing: int
    failed: int
    failures: list[str]

__all__ = ["WardrobeEmbeddingSyncOut", "WardrobeItemOut"]
