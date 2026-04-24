from datetime import datetime

from pydantic import BaseModel


class WardrobeItemOut(BaseModel):
    id: str
    user_id: str
    type: str
    image_url: str
    occasion: str | None = None
    embedding_done: bool
    created_at: datetime

    class Config:
        from_attributes = True

__all__ = ["WardrobeItemOut"]
