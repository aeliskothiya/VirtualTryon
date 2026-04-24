from datetime import datetime

from pydantic import BaseModel


class TryOnJobOut(BaseModel):
    id: str
    user_id: str
    top_item_id: str
    user_photo_path: str | None = None
    input_photo_used: str
    output_url: str | None = None
    status: str
    error_message: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

__all__ = ["TryOnJobOut"]
