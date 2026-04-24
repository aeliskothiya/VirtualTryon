from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pymongo.database import Database

from Backend.FashionAI.backend import crud
from Backend.FashionAI.backend import schemas
from Backend.FashionAI.backend.database import get_db
from Backend.FashionAI.backend.deps import get_current_fully_registered_user
from Backend.FashionAI.backend.services.coins import charge_feature
from Backend.FashionAI.backend.services.storage import (
    absolute_to_media_url,
    create_override_photo_path,
    create_tryon_output_path,
    media_url_to_absolute,
    save_upload_file,
)
from Backend.FashionAI.backend.services.tryon import run_tryon


router = APIRouter(prefix="/tryon", tags=["tryon"])


@router.post("", response_model=schemas.TryOnJobOut, status_code=status.HTTP_201_CREATED)
async def create_tryon(
    top_item_id: str = Form(...),
    override_photo: UploadFile | None = File(default=None),
    current_user: dict = Depends(get_current_fully_registered_user),
    db: Database = Depends(get_db),
):
    item = crud.get_wardrobe_item_for_user(db, top_item_id, str(current_user["_id"]))
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
        "created_at": crud.utcnow(),
    }
    result = db.tryon_jobs.insert_one(job)
    job["_id"] = result.inserted_id

    try:
        output_path = create_tryon_output_path(str(current_user["_id"]), str(job["_id"]))
        run_tryon(input_photo_path, garment_path, output_path)
        db.tryon_jobs.update_one(
            {"_id": job["_id"]},
            {
                "$set": {
                    "output_url": absolute_to_media_url(output_path),
                    "status": "completed",
                }
            },
        )
        updated_job = db.tryon_jobs.find_one({"_id": job["_id"]})
        return crud.serialize_document(updated_job)
    except Exception as exc:
        db.tryon_jobs.update_one(
            {"_id": job["_id"]},
            {
                "$set": {
                    "status": "failed",
                    "error_message": str(exc),
                }
            },
        )
        raise HTTPException(status_code=500, detail=f"Try-on failed: {exc}") from exc


@router.get("/history", response_model=list[schemas.TryOnJobOut])
def get_tryon_history(
    current_user: dict = Depends(get_current_fully_registered_user),
    db: Database = Depends(get_db),
):
    jobs = list(db.tryon_jobs.find({"user_id": str(current_user["_id"])}).sort("created_at", -1))
    return crud.serialize_many(jobs)
