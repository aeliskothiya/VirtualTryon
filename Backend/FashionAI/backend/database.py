import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pymongo import ASCENDING, MongoClient
from pymongo.database import Database


env_path = Path(__file__).with_name(".env")
load_dotenv(env_path)

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "fashion_db")


@lru_cache(maxsize=1)
def get_mongo_client() -> MongoClient:
    return MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)


def get_db() -> Database:
    return get_mongo_client()[MONGODB_DB_NAME]


def ping_database() -> dict:
    return get_mongo_client().admin.command("ping")


def init_indexes() -> None:
    mongo_db = get_db()
    mongo_db.users.create_index([("email", ASCENDING)], unique=True)
    mongo_db.pricing.create_index([("feature", ASCENDING)], unique=True)
    mongo_db.coin_transactions.create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])
    mongo_db.wardrobe_items.create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])
    mongo_db.tryon_jobs.create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])
    mongo_db.recommendations.create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])
