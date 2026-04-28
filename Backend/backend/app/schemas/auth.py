from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserProfile


class TokenData(BaseModel):
    email: str | None = None
    kind: str | None = None


class RegisterStepOneRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    confirm_password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

__all__ = ["AuthResponse", "LoginRequest", "RegisterStepOneRequest", "TokenData"]
