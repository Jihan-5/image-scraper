from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    app_name: str = "Image Scraper API"
    debug: bool = False
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    allowed_origins: List[str] = ["http://localhost:3000"]
    scrape_timeout: int = 10

    class Config:
        env_file = ".env"

settings = Settings()