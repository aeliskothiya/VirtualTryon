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


class RecommendationRequest(BaseModel):
    bottom_item_id: str
    occasion: str | None = None


class RecommendationCandidate(BaseModel):
    top_item_id: str
    score: float
    top_item: WardrobeItemOut


class RecommendationResponse(BaseModel):
    recommendation_id: str
    coin_balance: int
    results: list[RecommendationCandidate]


class RecommendationHistoryOut(BaseModel):
    id: str
    user_id: str
    bottom_item_id: str
    occasion: str | None = None
    suggested_top_ids: list[str]
    created_at: datetime

    class Config:
        from_attributes = True
