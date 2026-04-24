from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserProfile(BaseModel):
    id: str
    name: str
    email: EmailStr
    profile_photo_url: str | None = None
    gender_preference: str | None = None
    coin_balance: int
    is_fully_registered: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    gender_preference: str | None = None


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=6, max_length=128)
    new_password: str = Field(min_length=6, max_length=128)
    confirm_new_password: str = Field(min_length=6, max_length=128)


class CoinTransactionOut(BaseModel):
    id: str
    amount: int
    type: str
    reason: str
    reference_id: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class PricingOut(BaseModel):
    id: str
    feature: str
    coin_cost: int
    updated_at: datetime

    class Config:
        from_attributes = True

__all__ = ["CoinTransactionOut", "PasswordChangeRequest", "PricingOut", "UserProfile", "UserUpdateRequest"]
