import re
import time
import os


def sanitize_filename(name: str) -> str:
    name = re.sub(r"[^0-9a-zA-Z._-]", "-", name)
    return name


def generate_image_filename(url: str, ext: str = ".jpg") -> str:
    ts = int(time.time() * 1000)
    host = url.split("//")[-1].split("/")[0]
    host = sanitize_filename(host)
    return f"{host}_{ts}{ext}"


def ensure_storage_path(path: str) -> None:
    os.makedirs(path, exist_ok=True)
