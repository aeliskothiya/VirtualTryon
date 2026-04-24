from fastapi import APIRouter, Depends, File, UploadFile
from pymongo.database import Database

from app.controllers.user_controller import (
    get_me,
    list_coin_transactions,
    list_pricing,
    update_me,
    update_password,
    upload_profile_photo,
)
from app.core.deps import get_current_active_user
from app.database.connection import get_db
from app.schemas import CoinTransactionOut, PasswordChangeRequest, PricingOut, UserProfile, UserUpdateRequest


router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserProfile)
def get_me_route(current_user: dict = Depends(get_current_active_user)):
    return get_me(current_user)


@router.patch("/me", response_model=UserProfile)
def update_me_route(
    payload: UserUpdateRequest,
    current_user: dict = Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    return update_me(payload, current_user, db)


@router.patch("/me/password")
def update_password_route(
    payload: PasswordChangeRequest,
    current_user: dict = Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    return update_password(payload, current_user, db)


@router.post("/me/photo", response_model=UserProfile)
async def upload_profile_photo_route(
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    return upload_profile_photo(photo, current_user, db)


@router.get("/coins/transactions", response_model=list[CoinTransactionOut])
def list_coin_transactions_route(
    current_user: dict = Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    return list_coin_transactions(current_user, db)


@router.get("/pricing", response_model=list[PricingOut])
def list_pricing_route(db: Database = Depends(get_db)):
    return list_pricing(db)

__all__ = ["router"]
