from fastapi import HTTPException, status
from pymongo import ReturnDocument
from pymongo.database import Database

from app.core.config import settings
from app.database.connection import get_db
from app.database.repositories.admin_repository import get_admin_by_email
from app.schemas import (
    AdminAuthResponse,
    AdminBootstrapRequest,
    AdminLoginRequest,
    AdminOverviewOut,
    CoinPackageOut,
    CoinPackageUpsertRequest,
    PricingUpdateRequest,
)
from app.services.analytics_service import get_overview_metrics
from app.services.admin_service import create_admin
from app.services.auth_service import create_access_token, verify_password
from app.utils.helpers import serialize_document
from app.utils.helpers import serialize_many, utcnow


def bootstrap_admin(payload: AdminBootstrapRequest, db: Database) -> dict:
    configured_secret = settings.admin_creation_secret.strip()
    if not configured_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ADMIN_CREATION_SECRET is not configured on the server",
        )

    if payload.secret != configured_secret:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin creation secret")

    existing_admin = get_admin_by_email(db, payload.email)
    if existing_admin is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin email is already registered")

    return create_admin(db, name=payload.name, email=payload.email, password=payload.password)


def login_admin(payload: AdminLoginRequest, db: Database) -> AdminAuthResponse:
    admin = get_admin_by_email(db, payload.email)
    if admin is None or not verify_password(payload.password, admin["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token({"email": admin["email"], "kind": "admin"})
    return AdminAuthResponse(access_token=token, admin=serialize_document(admin))


def get_admin_overview(db: Database) -> AdminOverviewOut:
    return AdminOverviewOut(**get_overview_metrics(db))


def list_admin_pricing(db: Database) -> list[dict]:
    return serialize_many(list(db.pricing.find().sort("feature", 1)))


def update_admin_pricing(feature: str, payload: PricingUpdateRequest, db: Database) -> dict:
    updated = db.pricing.find_one_and_update(
        {"feature": feature},
        {"$set": {"feature": feature, "coin_cost": payload.coin_cost, "updated_at": utcnow()}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return serialize_document(updated)


def list_coin_packages(db: Database) -> list[dict]:
    return serialize_many(list(db.coin_packages.find().sort("coin_amount", -1)))


def upsert_coin_package(payload: CoinPackageUpsertRequest, db: Database) -> dict:
    code = payload.code.strip().lower()
    package_document = {
        "code": code,
        "title": payload.title.strip(),
        "coin_amount": payload.coin_amount,
        "price_label": payload.price_label.strip(),
        "description": payload.description.strip() if payload.description else None,
        "bonus_coins": payload.bonus_coins,
        "is_active": payload.is_active,
        "updated_at": utcnow(),
    }
    existing = db.coin_packages.find_one({"code": code})
    if existing is None:
        package_document["created_at"] = package_document["updated_at"]
        result = db.coin_packages.insert_one(package_document)
        package_document["_id"] = result.inserted_id
        return serialize_document(package_document)

    db.coin_packages.update_one({"code": code}, {"$set": package_document})
    updated = db.coin_packages.find_one({"code": code})
    return serialize_document(updated)


def delete_coin_package(code: str, db: Database) -> dict:
    deleted = db.coin_packages.find_one_and_delete({"code": code.strip().lower()})
    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coin package not found")
    return {"message": "Coin package deleted"}

__all__ = [
    "bootstrap_admin",
    "delete_coin_package",
    "get_admin_overview",
    "list_admin_pricing",
    "list_coin_packages",
    "login_admin",
    "update_admin_pricing",
    "upsert_coin_package",
]
