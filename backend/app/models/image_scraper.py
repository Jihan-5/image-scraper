from sqlalchemy import Column, Integer, String, ForeignKey
from app.models.base import Base

class ScrapedImage(Base):
    __tablename__ = "scraped_images"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    image_url = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))