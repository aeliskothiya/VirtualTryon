from datetime import datetime, timezone
from typing import Any

from bson import ObjectId


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

__all__ = ["serialize_document", "serialize_many", "to_object_id", "utcnow"]
