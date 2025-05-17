import re

def clean_image_url(url: str) -> str:
    """Clean and normalize image URLs"""
    # Remove query parameters
    url = re.sub(r'\?.*$', '', url)
    # Remove fragments
    url = re.sub(r'#.*$', '', url)
    # Ensure HTTPS if available
    if url.startswith('http://'):
        https_url = url.replace('http://', 'https://', 1)
        # Only use HTTPS if it resolves (you might want to add actual checking)
        return https_url
    return url