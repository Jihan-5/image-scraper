from urllib.parse import urlparse
import re

def validate_url(url: str) -> None:
    """Validate URL format and security"""
    result = urlparse(url)
    
    if not all([result.scheme, result.netloc]):
        raise ValueError("Invalid URL format")
    
    if result.scheme not in ('http', 'https'):
        raise ValueError("URL must use HTTP or HTTPS")
    
    # Basic security checks
    if '@' in result.netloc:
        raise ValueError("Invalid URL - contains credentials")
    
    # Check for common injection patterns
    if re.search(r'[<>"\']', url):
        raise ValueError("URL contains potentially dangerous characters")