"""Pydantic schema modules split by feature area."""

from app.schemas.admin import AdminBootstrapRequest, AdminOut
from app.schemas.auth import AuthResponse, LoginRequest, RegisterStepOneRequest, TokenData
from app.schemas.recommendation import (
    RecommendationCandidate,
    RecommendationHistoryOut,
    RecommendationRequest,
    RecommendationResponse,
)
from app.schemas.tryon import TryOnJobOut
from app.schemas.user import CoinTransactionOut, PasswordChangeRequest, PricingOut, UserProfile, UserUpdateRequest
from app.schemas.wardrobe import WardrobeEmbeddingSyncOut, WardrobeItemOut

__all__ = [
    "AdminBootstrapRequest",
    "AdminOut",
    "AuthResponse",
    "CoinTransactionOut",
    "LoginRequest",
    "PasswordChangeRequest",
    "PricingOut",
    "RecommendationCandidate",
    "RecommendationHistoryOut",
    "RecommendationRequest",
    "RecommendationResponse",
    "RegisterStepOneRequest",
    "TokenData",
    "TryOnJobOut",
    "UserProfile",
    "UserUpdateRequest",
    "WardrobeEmbeddingSyncOut",
    "WardrobeItemOut",
]
