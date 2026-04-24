from fastapi import HTTPException, UploadFile
from pymongo.database import Database

from app.database.repositories.wardrobe_repository import get_wardrobe_item_for_user, list_wardrobe_items_for_user
from app.services.storage_service import (
    absolute_to_media_url,
    create_wardrobe_item_path,
    delete_file_if_exists,
    media_url_to_absolute,
    save_upload_file,
)
from app.utils.helpers import serialize_document, serialize_many, utcnow


def upload_wardrobe_item(type: str, file: UploadFile, current_user: dict, db: Database) -> dict:
    if type not in {"top", "bottom"}:
        raise HTTPException(status_code=400, detail="Wardrobe item type must be top or bottom")

    destination = create_wardrobe_item_path(str(current_user["_id"]), file.filename)
    save_upload_file(file, destination)

    item = {
        "user_id": str(current_user["_id"]),
        "type": type,
        "occasion": None,
        "image_url": absolute_to_media_url(destination),
        "embedding_done": True,
        "created_at": utcnow(),
    }
    result = db.wardrobe_items.insert_one(item)
    item["_id"] = result.inserted_id
    return serialize_document(item)


def list_wardrobe_items(current_user: dict, db: Database) -> list[dict]:
    items = list_wardrobe_items_for_user(db, str(current_user["_id"]))
    return serialize_many(items)


def delete_wardrobe_item(item_id: str, current_user: dict, db: Database) -> None:
    item = get_wardrobe_item_for_user(db, item_id, str(current_user["_id"]))
    if item is None:
        raise HTTPException(status_code=404, detail="Wardrobe item not found")

    delete_file_if_exists(media_url_to_absolute(item.get("image_url")))
    db.wardrobe_items.delete_one({"_id": item["_id"]})

__all__ = ["delete_wardrobe_item", "list_wardrobe_items", "upload_wardrobe_item"]
