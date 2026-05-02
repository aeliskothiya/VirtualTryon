from pydantic import BaseModel


class SubscriptionPlanOut(BaseModel):
    code: str
    name: str
    description: str | None = None
    price_inr: float = 0.0
    wardrobe_limit: int
    tryon_daily_limit: int
    recommendation_daily_limit: int | None = None
    saved_tryon_monthly_limit: int
    is_default: bool = False
    active: bool = True


class SubscriptionPlanCreate(BaseModel):
    code: str
    name: str
    description: str | None = None
    price_inr: float = 0.0
    wardrobe_limit: int
    tryon_daily_limit: int
    recommendation_daily_limit: int | None = None
    saved_tryon_monthly_limit: int = 0
    is_default: bool = False
    active: bool = True


class SubscriptionPlanUpdate(BaseModel):
    name: str | None = None
    price_inr: float | None = None
    description: str | None = None
    wardrobe_limit: int | None = None
    tryon_daily_limit: int | None = None
    recommendation_daily_limit: int | None = None
    saved_tryon_monthly_limit: int | None = None
    is_default: bool | None = None
    active: bool | None = None


__all__ = ["SubscriptionPlanOut"]