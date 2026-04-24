from fastapi import APIRouter, Depends, status
from pymongo.database import Database

from app.controllers.admin_controller import bootstrap_admin
from app.database.connection import get_db
from app.schemas import AdminBootstrapRequest, AdminOut


router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/bootstrap", response_model=AdminOut, status_code=status.HTTP_201_CREATED)
def bootstrap_admin_route(payload: AdminBootstrapRequest, db: Database = Depends(get_db)):
    return bootstrap_admin(payload, db)

__all__ = ["router"]
