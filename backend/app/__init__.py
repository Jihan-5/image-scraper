# This makes Python treat the directory as a package
from app.core.config import settings
from app.models.base import Base

__all__ = ["settings", "Base"]