from pymongo.database import Database

from app.utils.helpers import to_object_id


def get_wardrobe_item_for_user(db: Database, item_id: str, user_id: str) -> dict | None:
    return db.wardrobe_items.find_one({"_id": to_object_id(item_id), "user_id": user_id})


def list_wardrobe_items_for_user(db: Database, user_id: str) -> list[dict]:
    return list(db.wardrobe_items.find({"user_id": user_id}).sort("created_at", -1))


__all__ = ["get_wardrobe_item_for_user", "list_wardrobe_items_for_user"]
