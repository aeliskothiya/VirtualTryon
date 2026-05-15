from pydantic import BaseModel, HttpUrl, validator
from app.core.config import settings
from app.utils.validators import validate_supported_domain


class ExtractRequest(BaseModel):
    url: HttpUrl

    @validator("url")
    def check_supported_domain(cls, v):
        if not validate_supported_domain(str(v), settings.SUPPORTED_DOMAINS):
            raise ValueError(f"Unsupported domain. Supported: {settings.SUPPORTED_DOMAINS}")
        return v


class ExtractResponse(BaseModel):
    success: bool
    product_url: HttpUrl
    image_url: str
    local_path: str
    image_file_url: str
    message: str
