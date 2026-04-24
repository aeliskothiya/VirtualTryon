from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from pymongo.database import Database

from app.controllers.auth_controller import login, register_step_one, register_step_two
from app.core.deps import get_current_active_user
from app.database.connection import get_db
from app.schemas import AuthResponse, LoginRequest, RegisterStepOneRequest, UserProfile


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register/step-1", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_step_one_route(payload: RegisterStepOneRequest, db: Database = Depends(get_db)):
    return register_step_one(payload, db)


@router.post("/register/step-2", response_model=UserProfile)
async def register_step_two_route(
    gender_preference: str = Form(...),
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    return register_step_two(gender_preference, photo, current_user, db)


@router.post("/login", response_model=AuthResponse)
def login_route(payload: LoginRequest, db: Database = Depends(get_db)):
    return login(payload, db)

__all__ = ["router"]
