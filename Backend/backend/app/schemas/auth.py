from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class TokenData(BaseModel):
    email: str | None = None


class RegisterStepOneRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    confirm_password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


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


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

__all__ = ["AuthResponse", "LoginRequest", "RegisterStepOneRequest", "TokenData", "UserProfile"]
