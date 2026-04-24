import logging

from fastapi import HTTPException, UploadFile
from pymongo.database import Database

from app.database.repositories.wardrobe_repository import get_wardrobe_item_for_user, list_wardrobe_items_for_user
from app.services.wardrobe_embedding_service import (
    embed_new_wardrobe_item,
    get_or_create_item_embedding,
    remove_wardrobe_embedding,
)
from app.services.storage_service import (
    absolute_to_media_url,
    create_wardrobe_item_path,
    delete_file_if_exists,
    media_url_to_absolute,
    save_upload_file,
)
from app.utils.helpers import serialize_document, serialize_many, utcnow


logger = logging.getLogger("uvicorn.error")


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
        "embedding_done": False,
        "created_at": utcnow(),
    }
    result = db.wardrobe_items.insert_one(item)
    item["_id"] = result.inserted_id

    try:
        embed_new_wardrobe_item(
            user_id=str(current_user["_id"]),
            item_id=str(item["_id"]),
            item_type=type,
            image_url=item["image_url"],
        )
        db.wardrobe_items.update_one(
            {"_id": item["_id"]},
            {
                "$set": {
                    "embedding_done": True,
                    "embedding_updated_at": utcnow(),
                    "embedding_error": None,
                }
            },
        )
        item["embedding_done"] = True
    except Exception as exc:
        error_message = str(exc)[:300]
        logger.warning(
            "Wardrobe embedding failed for user_id=%s item_id=%s: %s",
            str(current_user["_id"]),
            str(item["_id"]),
            error_message,
        )
        db.wardrobe_items.update_one(
            {"_id": item["_id"]},
            {"$set": {"embedding_done": False, "embedding_error": error_message}},
        )

    return serialize_document(item)


def list_wardrobe_items(current_user: dict, db: Database) -> list[dict]:
    items = list_wardrobe_items_for_user(db, str(current_user["_id"]))
    return serialize_many(items)


def delete_wardrobe_item(item_id: str, current_user: dict, db: Database) -> None:
    item = get_wardrobe_item_for_user(db, item_id, str(current_user["_id"]))
    if item is None:
        raise HTTPException(status_code=404, detail="Wardrobe item not found")

    remove_wardrobe_embedding(str(current_user["_id"]), str(item["_id"]))
    delete_file_if_exists(media_url_to_absolute(item.get("image_url")))
    db.wardrobe_items.delete_one({"_id": item["_id"]})


def sync_wardrobe_embeddings(current_user: dict, db: Database) -> dict:
    user_id = str(current_user["_id"])
    items = list_wardrobe_items_for_user(db, user_id)

    created = 0
    existing = 0
    failures: list[str] = []

    for item in items:
        item_id = str(item["_id"])
        try:
            _, created_now = get_or_create_item_embedding(
                user_id=user_id,
                item_id=item_id,
                item_type=item.get("type", ""),
                image_url=item.get("image_url", ""),
            )
            if created_now:
                created += 1
            else:
                existing += 1

            db.wardrobe_items.update_one(
                {"_id": item["_id"]},
                {"$set": {"embedding_done": True, "embedding_error": None, "embedding_updated_at": utcnow()}},
            )
        except Exception as exc:
            message = f"{item_id}: {str(exc)[:220]}"
            failures.append(message)
            db.wardrobe_items.update_one(
                {"_id": item["_id"]},
                {"$set": {"embedding_done": False, "embedding_error": str(exc)[:300]}},
            )

    return {
        "processed": len(items),
        "created": created,
        "existing": existing,
        "failed": len(failures),
        "failures": failures,
    }

__all__ = ["delete_wardrobe_item", "list_wardrobe_items", "sync_wardrobe_embeddings", "upload_wardrobe_item"]
