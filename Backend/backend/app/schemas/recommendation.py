from datetime import datetime

from pydantic import BaseModel

from app.schemas.wardrobe import WardrobeItemOut


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

__all__ = [
    "RecommendationCandidate",
    "RecommendationHistoryOut",
    "RecommendationRequest",
    "RecommendationResponse",
]
