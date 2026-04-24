from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pymongo.database import Database

from Backend.FashionAI.backend import crud
from Backend.FashionAI.backend import schemas
from Backend.FashionAI.backend.database import get_db
from Backend.FashionAI.backend.deps import get_current_fully_registered_user
from Backend.FashionAI.backend.services.storage import (
    absolute_to_media_url,
    create_wardrobe_item_path,
    delete_file_if_exists,
    media_url_to_absolute,
    save_upload_file,
)


router = APIRouter(prefix="/wardrobe", tags=["wardrobe"])


@router.post("/items", response_model=schemas.WardrobeItemOut, status_code=status.HTTP_201_CREATED)
async def upload_wardrobe_item(
    type: str = Form(...),
    occasion: str | None = Form(default=None),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_fully_registered_user),
    db: Database = Depends(get_db),
):
    if type not in {"top", "bottom"}:
        raise HTTPException(status_code=400, detail="Wardrobe item type must be top or bottom")

    destination = create_wardrobe_item_path(str(current_user["_id"]), file.filename)
    save_upload_file(file, destination)

    item = {
        "user_id": str(current_user["_id"]),
        "type": type,
        "occasion": occasion,
        "image_url": absolute_to_media_url(destination),
        "embedding_done": True,
        "created_at": crud.utcnow(),
    }
    result = db.wardrobe_items.insert_one(item)
    item["_id"] = result.inserted_id
    return crud.serialize_document(item)


@router.get("/items", response_model=list[schemas.WardrobeItemOut])
def list_wardrobe_items(
    current_user: dict = Depends(get_current_fully_registered_user),
    db: Database = Depends(get_db),
):
    items = list(db.wardrobe_items.find({"user_id": str(current_user["_id"])}).sort("created_at", -1))
    return crud.serialize_many(items)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wardrobe_item(
    item_id: str,
    current_user: dict = Depends(get_current_fully_registered_user),
    db: Database = Depends(get_db),
):
    item = crud.get_wardrobe_item_for_user(db, item_id, str(current_user["_id"]))
    if item is None:
        raise HTTPException(status_code=404, detail="Wardrobe item not found")

    delete_file_if_exists(media_url_to_absolute(item.get("image_url")))
    db.wardrobe_items.delete_one({"_id": item["_id"]})
