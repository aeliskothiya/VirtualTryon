from fastapi import HTTPException, status
from pymongo.database import Database

from app.core.config import settings
from app.database.repositories.admin_repository import get_admin_by_email
from app.schemas import AdminBootstrapRequest
from app.services.admin_service import create_admin


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

__all__ = ["bootstrap_admin"]
