from fastapi import HTTPException, UploadFile
from pymongo.database import Database

from app.database.repositories.user_repository import get_user
from app.schemas import PasswordChangeRequest, UserUpdateRequest
from app.services.auth_service import get_password_hash, verify_password
from app.services.storage_service import absolute_to_media_url, create_profile_photo_path, save_upload_file
from app.utils.helpers import serialize_document, serialize_many, utcnow


def get_me(current_user: dict) -> dict:
    return serialize_document(current_user)


def update_me(payload: UserUpdateRequest, current_user: dict, db: Database) -> dict:
    updates = {"updated_at": utcnow()}
    if payload.name is not None:
        updates["name"] = payload.name
    if payload.gender_preference is not None:
        if payload.gender_preference not in {"male", "female", "other"}:
            raise HTTPException(status_code=400, detail="Gender preference must be male, female, or other")
        updates["gender_preference"] = payload.gender_preference

    merged_gender = updates.get("gender_preference", current_user.get("gender_preference"))
    updates["is_fully_registered"] = bool(current_user.get("profile_photo_url") and merged_gender)

    db.users.update_one({"_id": current_user["_id"]}, {"$set": updates})
    updated_user = get_user(db, str(current_user["_id"]))
    return serialize_document(updated_user)


def update_password(payload: PasswordChangeRequest, current_user: dict, db: Database) -> dict:
    if payload.new_password != payload.confirm_new_password:
        raise HTTPException(status_code=400, detail="New passwords do not match")
    if not verify_password(payload.current_password, current_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"hashed_password": get_password_hash(payload.new_password), "updated_at": utcnow()}},
    )
    return {"message": "Password updated successfully"}


def upload_profile_photo(photo: UploadFile, current_user: dict, db: Database) -> dict:
    destination = create_profile_photo_path(str(current_user["_id"]), photo.filename)
    save_upload_file(photo, destination)

    updated_photo_url = absolute_to_media_url(destination)
    db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "profile_photo_url": updated_photo_url,
                "is_fully_registered": bool(updated_photo_url and current_user.get("gender_preference")),
                "updated_at": utcnow(),
            }
        },
    )
    updated_user = get_user(db, str(current_user["_id"]))
    return serialize_document(updated_user)


def list_coin_transactions(current_user: dict, db: Database) -> list[dict]:
    transactions = list(db.coin_transactions.find({"user_id": str(current_user["_id"])}).sort("created_at", -1))
    return serialize_many(transactions)


def list_pricing(db: Database) -> list[dict]:
    pricing = list(db.pricing.find().sort("feature", 1))
    return serialize_many(pricing)

__all__ = [
    "get_me",
    "list_coin_transactions",
    "list_pricing",
    "update_me",
    "update_password",
    "upload_profile_photo",
]
