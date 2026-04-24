from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from pymongo.database import Database


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def to_object_id(value: str | ObjectId) -> ObjectId:
    if isinstance(value, ObjectId):
        return value
    return ObjectId(value)


def serialize_document(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if document is None:
        return None
    serialized = dict(document)
    serialized["id"] = str(serialized.pop("_id"))
    return serialized


def serialize_many(documents: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [serialize_document(doc) for doc in documents]


def get_user(db: Database, user_id: str) -> dict[str, Any] | None:
    return db.users.find_one({"_id": to_object_id(user_id)})


def get_user_by_email(db: Database, email: str) -> dict[str, Any] | None:
    return db.users.find_one({"email": email})


def get_pricing_by_feature(db: Database, feature: str) -> dict[str, Any] | None:
    return db.pricing.find_one({"feature": feature})


def get_wardrobe_item_for_user(db: Database, item_id: str, user_id: str) -> dict[str, Any] | None:
    return db.wardrobe_items.find_one(
        {
            "_id": to_object_id(item_id),
            "user_id": user_id,
        }
    )
