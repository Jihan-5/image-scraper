import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from app.core.config import settings
from app.utils.scraper import clean_image_url

async def scrape_images(url: str) -> list[str]:
    async with httpx.AsyncClient() as client:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
        try:
            response = await client.get(
                url,
                headers=headers,
                timeout=settings.scrape_timeout
            )
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            images = []
            
            for img in soup.find_all('img'):
                src = img.get('src')
                if src:
                    absolute_url = urljoin(url, src)
                    cleaned_url = clean_image_url(absolute_url)
                    images.append(cleaned_url)
            
            return list(set(images))  # Remove duplicates
        except Exception as e:
            raise Exception(f"Scraping failed: {str(e)}")