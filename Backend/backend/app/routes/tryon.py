from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from pymongo.database import Database

from app.controllers.tryon_controller import create_tryon, get_tryon_history
from app.core.deps import get_current_fully_registered_user
from app.database.connection import get_db
from app.schemas import TryOnJobOut


router = APIRouter(prefix="/tryon", tags=["tryon"])


@router.get("")
def tryon_route_help() -> dict:
    return {
        "message": "Use POST /tryon for try-on generation.",
        "required_form_fields": ["top_item_id"],
        "optional_form_fields": ["override_photo"],
        "history_endpoint": "GET /tryon/history",
    }


@router.post("", response_model=TryOnJobOut, status_code=status.HTTP_201_CREATED)
async def create_tryon_route(
    top_item_id: str = Form(...),
    override_photo: UploadFile | None = File(default=None),
    garment_photo_type: str = Form(default="flat-lay"),
    current_user: dict = Depends(get_current_fully_registered_user),
    db: Database = Depends(get_db),
):
    return create_tryon(top_item_id, override_photo, garment_photo_type, current_user, db)


@router.get("/history", response_model=list[TryOnJobOut])
def get_tryon_history_route(
    current_user: dict = Depends(get_current_fully_registered_user),
    db: Database = Depends(get_db),
):
    return get_tryon_history(current_user, db)

__all__ = ["router"]
