"""Pydantic schema modules split by feature area."""

from app.schemas.admin import (
    AdminAuthResponse,
    AdminBootstrapRequest,
    AdminLoginRequest,
    AdminOut,
    AdminOverviewOut,
    CoinPackageOut,
    CoinPackageUpsertRequest,
    PricingUpdateRequest,
)
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
    "AdminAuthResponse",
    "AdminBootstrapRequest",
    "AdminLoginRequest",
    "AdminOut",
    "AdminOverviewOut",
    "CoinPackageOut",
    "CoinPackageUpsertRequest",
    "AuthResponse",
    "CoinTransactionOut",
    "LoginRequest",
    "PasswordChangeRequest",
    "PricingOut",
    "PricingUpdateRequest",
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
