from pymongo.database import Database

from app.core.config import settings
from app.utils.helpers import utcnow


def seed_default_pricing(db: Database) -> None:
    defaults = {
        "tryon": settings.default_tryon_price,
        "recommendation": settings.default_recommendation_price,
    }
    for feature, amount in defaults.items():
        db.pricing.update_one(
            {"feature": feature},
            {"$set": {"feature": feature, "coin_cost": amount, "updated_at": utcnow()}},
            upsert=True,
        )

__all__ = ["seed_default_pricing"]
