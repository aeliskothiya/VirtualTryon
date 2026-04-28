from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.controllers.admin_controller import (
    bootstrap_admin,
    delete_coin_package,
    get_admin_overview,
    list_admin_pricing,
    list_coin_packages,
    login_admin,
    update_admin_pricing,
    upsert_coin_package,
)
from app.core.deps import get_current_admin
from app.database.connection import get_db
from app.schemas import (
    AdminAuthResponse,
    AdminBootstrapRequest,
    AdminLoginRequest,
    AdminOut,
    AdminOverviewOut,
    CoinPackageOut,
    CoinPackageUpsertRequest,
    PricingOut,
    PricingUpdateRequest,
)


router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/bootstrap", response_model=AdminOut, status_code=status.HTTP_201_CREATED)
def bootstrap_admin_route(payload: AdminBootstrapRequest, db: Database = Depends(get_db)):
    return bootstrap_admin(payload, db)


@router.post("/login", response_model=AdminAuthResponse)
def login_admin_route(payload: AdminLoginRequest, db: Database = Depends(get_db)):
    return login_admin(payload, db)


@router.get("/overview", response_model=AdminOverviewOut)
def admin_overview_route(current_admin: dict = Depends(get_current_admin), db: Database = Depends(get_db)):
    return get_admin_overview(db)


@router.get("/pricing", response_model=list[PricingOut])
def admin_pricing_route(current_admin: dict = Depends(get_current_admin), db: Database = Depends(get_db)):
    return list_admin_pricing(db)


@router.patch("/pricing/{feature}", response_model=PricingOut)
def update_admin_pricing_route(
    feature: str,
    payload: PricingUpdateRequest,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db),
):
    return update_admin_pricing(feature, payload, db)


@router.get("/packages", response_model=list[CoinPackageOut])
def list_coin_packages_route(current_admin: dict = Depends(get_current_admin), db: Database = Depends(get_db)):
    return list_coin_packages(db)


@router.post("/packages", response_model=CoinPackageOut, status_code=status.HTTP_201_CREATED)
def upsert_coin_package_route(
    payload: CoinPackageUpsertRequest,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db),
):
    return upsert_coin_package(payload, db)


@router.patch("/packages/{code}", response_model=CoinPackageOut)
def update_coin_package_route(
    code: str,
    payload: CoinPackageUpsertRequest,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db),
):
    if code.strip().lower() != payload.code.strip().lower():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Package code cannot be changed")
    return upsert_coin_package(payload, db)


@router.delete("/packages/{code}")
def delete_coin_package_route(code: str, current_admin: dict = Depends(get_current_admin), db: Database = Depends(get_db)):
    return delete_coin_package(code, db)

__all__ = ["router"]
