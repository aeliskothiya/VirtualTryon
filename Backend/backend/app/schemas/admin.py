from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class AdminBootstrapRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    secret: str = Field(min_length=1, max_length=256)
    name: str = Field(default="System Admin", min_length=2, max_length=120)


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


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


class AdminAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminOut


class AdminOverviewOut(BaseModel):
    total_users: int
    fully_registered_users: int
    total_admins: int
    total_tryons: int
    total_recommendations: int
    total_coin_transactions: int
    total_coin_balance: int


class PricingUpdateRequest(BaseModel):
    coin_cost: int = Field(ge=0, le=100000)


class CoinPackageUpsertRequest(BaseModel):
    code: str = Field(min_length=2, max_length=50)
    title: str = Field(min_length=2, max_length=120)
    coin_amount: int = Field(gt=0, le=100000)
    price_label: str = Field(min_length=1, max_length=50)
    description: str | None = Field(default=None, max_length=300)
    bonus_coins: int = Field(default=0, ge=0, le=100000)
    is_active: bool = True


class CoinPackageOut(BaseModel):
    id: str
    code: str
    title: str
    coin_amount: int
    price_label: str
    description: str | None = None
    bonus_coins: int = 0
    is_active: bool = True
    status: str = "active"
    created_at: datetime
    updated_at: datetime

__all__ = [
    "CoinPackageOut",
    "CoinPackageUpsertRequest",
    "AdminAuthResponse",
    "AdminBootstrapRequest",
    "AdminLoginRequest",
    "AdminOut",
    "AdminOverviewOut",
    "PricingUpdateRequest",
]
