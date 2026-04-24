from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from Backend.FashionAI.backend.database import get_db, init_indexes
from Backend.FashionAI.backend.routers import auth, tryon, users, wardrobe
from Backend.FashionAI.backend.routers import recommendations
from Backend.FashionAI.backend.services.coins import seed_default_pricing
from Backend.FashionAI.backend.services.storage import ensure_media_directories


app = FastAPI(title="FashionAI Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from Backend.FashionAI.backend.config import settings

app.mount("/media", StaticFiles(directory=str(settings.media_root)), name="media")

app.include_router(auth.router)
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
        "features": ["auth", "profile", "coins", "wardrobe", "tryon", "recommendations"],
    }
