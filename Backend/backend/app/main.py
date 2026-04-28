import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.connection import get_db, init_indexes
from app.database.seed.coin_package_seed import seed_default_coin_packages
from app.database.seed.pricing_seed import seed_default_pricing
from app.routes import admin, auth, recommendations, tryon, users, wardrobe
from app.services.storage_service import ensure_media_directories


logger = logging.getLogger("uvicorn.error")


app = FastAPI(title="FashionAI Backend API", version="1.0.0")

import time
from fastapi import Request

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def global_logging_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(
        f"{request.client.host if request.client else 'unknown'} - "
        f"\"{request.method} {request.url.path}\" {response.status_code} "
        f"completed in {process_time:.3f}s"
    )
    return response

app.mount("/media", StaticFiles(directory=str(settings.media_root)), name="media")

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(wardrobe.router)
app.include_router(tryon.router)
app.include_router(recommendations.router)


@app.on_event("startup")
def startup_event():
    tryon_routes = [
        {
            "path": route.path,
            "methods": sorted(list(route.methods or [])),
            "endpoint": getattr(route.endpoint, "__name__", str(route.endpoint)),
        }
        for route in app.routes
        if route.path.startswith("/tryon")
    ]
    logger.info(
        "Startup config: project_root=%s vton_repo_dir=%s vton_src_dir=%s vton_weights_dir=%s clothing_model=%s user_embeddings_root=%s",
        settings.project_root,
        settings.vton_repo_dir,
        settings.vton_src_dir,
        settings.vton_weights_dir,
        settings.clothing_model_path,
        settings.user_wardrobe_embeddings_root,
    )
    logger.info("Registered tryon routes: %s", tryon_routes)
    ensure_media_directories()
    init_indexes()
    seed_default_pricing(get_db())
    seed_default_coin_packages(get_db())


@app.get("/")
def root():
    return {
        "message": "FashionAI Virtual Try-On Backend",
        "database": "mongodb",
        "features": ["auth", "admin", "profile", "coins", "wardrobe", "tryon", "recommendations"],
    }
