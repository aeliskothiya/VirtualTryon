from pymongo.database import Database

from app.utils.helpers import utcnow


def seed_default_coin_packages(db: Database) -> None:
    defaults = [
        {
            "code": "starter",
            "title": "Starter Pack",
            "coin_amount": 100,
            "price_label": "$4.99",
            "description": "Good for a few try-ons and recommendations.",
            "bonus_coins": 10,
            "is_active": True,
            "status": "active",
        },
        {
            "code": "popular",
            "title": "Popular Pack",
            "coin_amount": 250,
            "price_label": "$9.99",
            "description": "Balanced pack for regular styling sessions.",
            "bonus_coins": 40,
            "is_active": True,
            "status": "active",
        },
        {
            "code": "premium",
            "title": "Premium Pack",
            "coin_amount": 600,
            "price_label": "$19.99",
            "description": "Best value for heavy try-on and recommendation usage.",
            "bonus_coins": 120,
            "is_active": True,
            "status": "active",
        },
    ]

    for package in defaults:
        now = utcnow()
        db.coin_packages.update_one(
            {"code": package["code"]},
            {
                "$set": {**package, "updated_at": now},
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )


__all__ = ["seed_default_coin_packages"]