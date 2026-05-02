from fastapi import HTTPException, UploadFile
from pymongo.database import Database

from app.core.config import settings
from app.database.models import EMAIL_VERIFICATIONS
from app.database.repositories.admin_repository import get_admin_by_email
from app.database.repositories.user_repository import get_user, get_user_by_email
from app.schemas import AuthResponse, LoginRequest, RegisterStepOneRequest
from app.services.auth_service import create_access_token, get_password_hash, verify_password
from app.services.storage_service import absolute_to_media_url, create_profile_photo_path, save_upload_file
from app.services.subscription_service import DEFAULT_SUBSCRIPTION_PLAN
from app.utils.helpers import serialize_document, utcnow


def register_step_one(payload: RegisterStepOneRequest, db: Database) -> AuthResponse:
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    email = payload.email.lower()
    if get_user_by_email(db, email):
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Check if email has been verified via OTP
    otp_record = db[EMAIL_VERIFICATIONS].find_one({"email": email})
    if not otp_record or not otp_record.get("is_verified"):
        raise HTTPException(
            status_code=400,
            detail="Email must be verified before registration. Please verify your email first.",
        )

    now = utcnow()
    user = {
        "name": payload.name,
        "email": email,
        "hashed_password": get_password_hash(payload.password),
        "profile_photo_url": None,
        "gender_preference": None,
        "subscription_plan": DEFAULT_SUBSCRIPTION_PLAN,
        "has_used_free_plan": True,
        "is_fully_registered": False,
        "subscription_started_at": now,
        "created_at": now,
        "updated_at": now,
    }
    result = db.users.insert_one(user)
    user["_id"] = result.inserted_id
    db_user = get_user(db, str(user["_id"]))
    token = create_access_token({"email": db_user["email"], "kind": "user"})
    return AuthResponse(access_token=token, kind="user", user=serialize_document(db_user))


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
    admin = get_admin_by_email(db, payload.email)
    if admin is not None:
        if not verify_password(payload.password, admin["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_access_token({"email": admin["email"], "kind": "admin"})
        return AuthResponse(access_token=token, kind="admin", admin=serialize_document(admin))

    user = get_user_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"email": user["email"], "kind": "user"})
    return AuthResponse(access_token=token, kind="user", user=serialize_document(user))

__all__ = ["login", "register_step_one", "register_step_two"]
