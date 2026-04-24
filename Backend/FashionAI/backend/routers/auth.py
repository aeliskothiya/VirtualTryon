from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pymongo.database import Database

from Backend.FashionAI.backend import auth, crud
from Backend.FashionAI.backend import schemas
from Backend.FashionAI.backend.config import settings
from Backend.FashionAI.backend.database import get_db
from Backend.FashionAI.backend.deps import get_current_active_user
from Backend.FashionAI.backend.services.coins import credit_user
from Backend.FashionAI.backend.services.storage import absolute_to_media_url, create_profile_photo_path, save_upload_file


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register/step-1", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED)
def register_step_one(payload: schemas.RegisterStepOneRequest, db: Database = Depends(get_db)):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if crud.get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = {
        "name": payload.name,
        "email": payload.email,
        "hashed_password": auth.get_password_hash(payload.password),
        "profile_photo_url": None,
        "gender_preference": None,
        "coin_balance": 0,
        "is_fully_registered": False,
        "created_at": crud.utcnow(),
        "updated_at": crud.utcnow(),
    }
    result = db.users.insert_one(user)
    user["_id"] = result.inserted_id

    credit_user(db, user, settings.default_registration_bonus, reason="registration_bonus")
    db_user = crud.get_user(db, str(user["_id"]))

    token = auth.create_access_token({"email": db_user["email"]})
    return schemas.AuthResponse(access_token=token, user=crud.serialize_document(db_user))


@router.post("/register/step-2", response_model=schemas.UserProfile)
async def register_step_two(
    gender_preference: str = Form(...),
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
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
                "updated_at": crud.utcnow(),
            }
        },
    )
    updated_user = crud.get_user(db, str(current_user["_id"]))
    return crud.serialize_document(updated_user)


@router.post("/login", response_model=schemas.AuthResponse)
def login(payload: schemas.LoginRequest, db: Database = Depends(get_db)):
    user = crud.get_user_by_email(db, payload.email)
    if user is None or not auth.verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = auth.create_access_token({"email": user["email"]})
    return schemas.AuthResponse(access_token=token, user=crud.serialize_document(user))
