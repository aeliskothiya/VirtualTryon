import os

from fastapi import APIRouter, HTTPException, Request, status
from app.models.request_models import ExtractRequest, ExtractResponse
from app.services.scraper_service import scrape_image
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger()


@router.post("/extract-image")
async def extract_image(payload: ExtractRequest, request: Request):
    """Endpoint to extract main product image from a product page URL."""
    url = str(payload.url)
    try:
        result = await scrape_image(url)
    except HTTPException as e:
        # re-raise FastAPI HTTPExceptions
        raise e
    except Exception as exc:  # unexpected
        logger.exception("Unexpected scraping error for %s: %s", url, exc)
        raise HTTPException(status_code=500, detail="Failed to extract image")

    if not result.get("image_url"):
        raise HTTPException(status_code=404, detail="Image not found on the page")

    local_path = result.get("local_path") or ""
    image_name = os.path.basename(local_path) if local_path else ""
    image_file_url = str(request.url_for("images", path=image_name)) if image_name else ""

    return ExtractResponse(
        success=True,
        product_url=payload.url,
        image_url=result.get("image_url"),
        local_path=local_path,
        image_file_url=image_file_url,
        message="Image extracted successfully",
    )
