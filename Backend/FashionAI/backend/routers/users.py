from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pymongo.database import Database

from Backend.FashionAI.backend import auth, crud
from Backend.FashionAI.backend import schemas
from Backend.FashionAI.backend.database import get_db
from Backend.FashionAI.backend.deps import get_current_active_user
from Backend.FashionAI.backend.services.storage import absolute_to_media_url, create_profile_photo_path, save_upload_file


router = APIRouter(tags=["users"])


@router.get("/me", response_model=schemas.UserProfile)
def get_me(current_user: dict = Depends(get_current_active_user)):
    return crud.serialize_document(current_user)


@router.patch("/me", response_model=schemas.UserProfile)
def update_me(
    payload: schemas.UserUpdateRequest,
    current_user: dict = Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    updates = {"updated_at": crud.utcnow()}
    if payload.name is not None:
        updates["name"] = payload.name
    if payload.gender_preference is not None:
        if payload.gender_preference not in {"male", "female", "other"}:
            raise HTTPException(status_code=400, detail="Gender preference must be male, female, or other")
        updates["gender_preference"] = payload.gender_preference

    merged_gender = updates.get("gender_preference", current_user.get("gender_preference"))
    updates["is_fully_registered"] = bool(current_user.get("profile_photo_url") and merged_gender)

    db.users.update_one({"_id": current_user["_id"]}, {"$set": updates})
    updated_user = crud.get_user(db, str(current_user["_id"]))
    return crud.serialize_document(updated_user)


@router.patch("/me/password")
def update_password(
    payload: schemas.PasswordChangeRequest,
    current_user: dict = Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    if payload.new_password != payload.confirm_new_password:
        raise HTTPException(status_code=400, detail="New passwords do not match")
    if not auth.verify_password(payload.current_password, current_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"hashed_password": auth.get_password_hash(payload.new_password), "updated_at": crud.utcnow()}},
    )
    return {"message": "Password updated successfully"}


@router.post("/me/photo", response_model=schemas.UserProfile)
async def upload_profile_photo(
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    destination = create_profile_photo_path(str(current_user["_id"]), photo.filename)
    save_upload_file(photo, destination)

    updated_photo_url = absolute_to_media_url(destination)
    db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "profile_photo_url": updated_photo_url,
                "is_fully_registered": bool(updated_photo_url and current_user.get("gender_preference")),
                "updated_at": crud.utcnow(),
            }
        },
    )
    updated_user = crud.get_user(db, str(current_user["_id"]))
    return crud.serialize_document(updated_user)


@router.get("/coins/transactions", response_model=list[schemas.CoinTransactionOut])
def list_coin_transactions(
    current_user: dict = Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    transactions = list(
        db.coin_transactions.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
    )
    return crud.serialize_many(transactions)


@router.get("/pricing", response_model=list[schemas.PricingOut])
def list_pricing(db: Database = Depends(get_db)):
    pricing = list(db.pricing.find().sort("feature", 1))
    return crud.serialize_many(pricing)
