from fastapi import APIRouter, Depends, File, Form, Response, UploadFile, status
from pymongo.database import Database

from app.controllers.wardrobe_controller import (
    delete_wardrobe_item,
    list_wardrobe_items,
    sync_wardrobe_embeddings,
    upload_wardrobe_item,
)
from app.core.deps import get_current_fully_registered_user
from app.database.connection import get_db
from app.schemas import WardrobeEmbeddingSyncOut, WardrobeItemOut


router = APIRouter(prefix="/wardrobe", tags=["wardrobe"])


@router.post("/items", response_model=WardrobeItemOut, status_code=status.HTTP_201_CREATED)
async def upload_wardrobe_item_route(
    type: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_fully_registered_user),
    db: Database = Depends(get_db),
):
    return upload_wardrobe_item(type, file, current_user, db)


@router.get("/items", response_model=list[WardrobeItemOut])
def list_wardrobe_items_route(
    current_user: dict = Depends(get_current_fully_registered_user),
    db: Database = Depends(get_db),
):
    return list_wardrobe_items(current_user, db)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wardrobe_item_route(
    item_id: str,
    current_user: dict = Depends(get_current_fully_registered_user),
    db: Database = Depends(get_db),
):
    delete_wardrobe_item(item_id, current_user, db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/embeddings/sync", response_model=WardrobeEmbeddingSyncOut)
def sync_wardrobe_embeddings_route(
    current_user: dict = Depends(get_current_fully_registered_user),
    db: Database = Depends(get_db),
):
    return sync_wardrobe_embeddings(current_user, db)

__all__ = ["router"]
