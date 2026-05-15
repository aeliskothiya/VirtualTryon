from urllib.parse import urlparse
from typing import List


def validate_supported_domain(url: str, supported: List[str]) -> bool:
    """Return True if the URL host contains one of the supported domain keywords."""
    try:
        p = urlparse(url)
        host = p.netloc.lower()
        return any(domain in host for domain in supported)
    except Exception:
        return False
