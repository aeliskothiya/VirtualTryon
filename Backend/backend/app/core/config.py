import os
from pathlib import Path

from dotenv import load_dotenv


def _as_bool(value: str | None, default: bool) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(env_path)


class Settings:
    def __init__(self) -> None:
        self.app_dir = Path(__file__).resolve().parents[1]
        self.backend_root = self.app_dir.parent
        self.project_root = self.backend_root.parent
        self.media_root = self.app_dir / "media"
        self.user_media_root = self.media_root / "users"
        self.wardrobe_media_root = self.media_root / "wardrobe"
        self.tryon_media_root = self.media_root / "tryon"
        self.vton_repo_dir = self.project_root / "TryOn" / "fashn-vton-1.5"
        self.vton_src_dir = self.vton_repo_dir / "src"
        self.vton_weights_dir = Path(os.getenv("VTON_WEIGHTS_DIR", str(self.vton_repo_dir / "weights")))

        self.default_tryon_price = int(os.getenv("DEFAULT_TRYON_PRICE", "5"))
        self.default_recommendation_price = int(os.getenv("DEFAULT_RECOMMENDATION_PRICE", "3"))
        self.default_registration_bonus = int(os.getenv("DEFAULT_REGISTRATION_BONUS", "50"))
        self.admin_creation_secret = os.getenv("ADMIN_CREATION_SECRET", "")

        self.tryon_mock_mode = _as_bool(os.getenv("TRYON_MOCK_MODE"), default=False)
        self.vton_device = os.getenv("VTON_DEVICE", "cuda")
        self.vton_category = os.getenv("VTON_CATEGORY", "tops")
        self.vton_garment_photo_type = os.getenv("VTON_GARMENT_PHOTO_TYPE", "flat-lay")
        self.vton_num_timesteps = int(os.getenv("VTON_NUM_TIMESTEPS", "30"))
        self.vton_guidance_scale = float(os.getenv("VTON_GUIDANCE_SCALE", "2.0"))
        self.vton_seed = int(os.getenv("VTON_SEED", "42"))
        self.vton_segmentation_free = _as_bool(os.getenv("VTON_SEGMENTATION_FREE"), default=False)


settings = Settings()


__all__ = ["Settings", "settings"]
