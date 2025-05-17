from fastapi import APIRouter, Depends, HTTPException
from app.services.image_service import scrape_images
from app.schemas.image import ImageScrapeRequest, ImageScrapeResult
from app.utils.validators import validate_url

router = APIRouter()

@router.post("/scrape", response_model=ImageScrapeResult)
async def scrape_images_endpoint(request: ImageScrapeRequest):
    try:
        validate_url(request.url)
        image_urls = await scrape_images(request.url)
        return {
            "url": request.url,
            "image_urls": image_urls,
            "count": len(image_urls)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))