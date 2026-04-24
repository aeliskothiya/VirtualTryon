from fastapi import HTTPException, UploadFile
from pymongo.database import Database

from app.core.config import settings
from app.database.repositories.user_repository import get_user, get_user_by_email
from app.schemas import AuthResponse, LoginRequest, RegisterStepOneRequest
from app.services.auth_service import create_access_token, get_password_hash, verify_password
from app.services.coin_service import credit_user
from app.services.storage_service import absolute_to_media_url, create_profile_photo_path, save_upload_file
from app.utils.helpers import serialize_document, utcnow


def register_step_one(payload: RegisterStepOneRequest, db: Database) -> AuthResponse:
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email is already registered")

    now = utcnow()
    user = {
        "name": payload.name,
        "email": payload.email,
        "hashed_password": get_password_hash(payload.password),
        "profile_photo_url": None,
        "gender_preference": None,
        "coin_balance": 0,
        "is_fully_registered": False,
        "created_at": now,
        "updated_at": now,
    }
    result = db.users.insert_one(user)
    user["_id"] = result.inserted_id

    credit_user(db, user, settings.default_registration_bonus, reason="registration_bonus")
    db_user = get_user(db, str(user["_id"]))
    token = create_access_token({"email": db_user["email"]})
    return AuthResponse(access_token=token, user=serialize_document(db_user))


def register_step_two(gender_preference: str, photo: UploadFile, current_user: dict, db: Database) -> dict:
    if gender_preference not in {"male", "female", "other"}:
        raise HTTPException(status_code=400, detail="Gender preference must be male, female, or other")

    destination = create_profile_photo_path(str(current_user["_id"]), photo.filename)
    save_upload_file(photo, destination)

    db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "gender_preference": gender_preference,
                "profile_photo_url": absolute_to_media_url(destination),
                "is_fully_registered": True,
                "updated_at": utcnow(),
            }
        },
    )
    updated_user = get_user(db, str(current_user["_id"]))
    return serialize_document(updated_user)


def login(payload: LoginRequest, db: Database) -> AuthResponse:
    user = get_user_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"email": user["email"]})
    return AuthResponse(access_token=token, user=serialize_document(user))

__all__ = ["login", "register_step_one", "register_step_two"]
