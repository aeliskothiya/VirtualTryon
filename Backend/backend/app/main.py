from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.connection import get_db, init_indexes
from app.database.seed.pricing_seed import seed_default_pricing
from app.routes import admin, auth, recommendations, tryon, users, wardrobe
from app.services.storage_service import ensure_media_directories


app = FastAPI(title="FashionAI Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media", StaticFiles(directory=str(settings.media_root)), name="media")

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(wardrobe.router)
app.include_router(tryon.router)
app.include_router(recommendations.router)


@app.on_event("startup")
def startup_event():
    ensure_media_directories()
    init_indexes()
    seed_default_pricing(get_db())


@app.get("/")
def root():
    return {
        "message": "FashionAI Virtual Try-On Backend",
        "database": "mongodb",
        "features": ["auth", "admin", "profile", "coins", "wardrobe", "tryon", "recommendations"],
    }
