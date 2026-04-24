from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class AdminBootstrapRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    secret: str = Field(min_length=1, max_length=256)
    name: str = Field(default="System Admin", min_length=2, max_length=120)


class AdminOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

__all__ = ["AdminBootstrapRequest", "AdminOut"]
