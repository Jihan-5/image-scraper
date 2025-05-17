from pydantic import BaseModel
from typing import List

class ImageScrapeRequest(BaseModel):
    url: str

class ImageScrapeResult(BaseModel):
    url: str
    image_urls: List[str]
    count: int