import logging

from fastapi import HTTPException, UploadFile
from pymongo.database import Database

from app.database.repositories.wardrobe_repository import get_wardrobe_item_for_user
from app.services.coin_service import charge_feature
from app.services.storage_service import (
    absolute_to_media_url,
    create_override_photo_path,
    create_tryon_output_path,
    media_url_to_absolute,
    save_upload_file,
)
from app.services.tryon_service import run_tryon
from app.utils.helpers import serialize_document, serialize_many, utcnow


logger = logging.getLogger("uvicorn.error")


def create_tryon(
    top_item_id: str,
    override_photo: UploadFile | None,
    garment_photo_type: str,
    current_user: dict,
    db: Database,
) -> dict:
    item = get_wardrobe_item_for_user(db, top_item_id, str(current_user["_id"]))
    if item is None:
        raise HTTPException(status_code=404, detail="Wardrobe item not found")
    if item["type"] != "top":
        raise HTTPException(status_code=400, detail="Only top items can be used for try-on")

    user_photo_url = current_user.get("profile_photo_url")
    input_photo_used = "profile"

    if override_photo is not None:
        override_path = create_override_photo_path(str(current_user["_id"]), override_photo.filename)
        save_upload_file(override_photo, override_path)
        user_photo_url = absolute_to_media_url(override_path)
        input_photo_used = "override"

    input_photo_path = media_url_to_absolute(user_photo_url)
    garment_path = media_url_to_absolute(item["image_url"])
    if input_photo_path is None or garment_path is None:
        raise HTTPException(status_code=400, detail="A valid user photo is required for try-on")

    try:
        charge_feature(db, current_user, "tryon")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Insufficient coins for try-on")

    job = {
        "user_id": str(current_user["_id"]),
        "top_item_id": str(item["_id"]),
        "user_photo_path": user_photo_url,
        "input_photo_used": input_photo_used,
        "output_url": None,
        "status": "processing",
        "error_message": None,
        "created_at": utcnow(),
    }
    result = db.tryon_jobs.insert_one(job)
    job["_id"] = result.inserted_id

    try:
        output_path = create_tryon_output_path(str(current_user["_id"]), str(job["_id"]))
        run_tryon(input_photo_path, garment_path, output_path, garment_photo_type=garment_photo_type)
        db.tryon_jobs.update_one(
            {"_id": job["_id"]},
            {"$set": {"output_url": absolute_to_media_url(output_path), "status": "completed"}},
        )
        updated_job = db.tryon_jobs.find_one({"_id": job["_id"]})
        return serialize_document(updated_job)
    except Exception as exc:
        logger.exception(
            "Try-on failed for user_id=%s job_id=%s top_item_id=%s",
            current_user.get("_id"),
            job.get("_id"),
            item.get("_id"),
        )
        db.tryon_jobs.update_one(
            {"_id": job["_id"]},
            {"$set": {"status": "failed", "error_message": str(exc)}},
        )
        raise HTTPException(status_code=500, detail=f"Try-on failed: {exc}") from exc


def get_tryon_history(current_user: dict, db: Database) -> list[dict]:
    jobs = list(db.tryon_jobs.find({"user_id": str(current_user["_id"])}).sort("created_at", -1))
    return serialize_many(jobs)

__all__ = ["create_tryon", "get_tryon_history"]
