import logging
from logging.handlers import RotatingFileHandler
import os


def get_logger(name: str = "ai_wardrobe"):
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    logger.setLevel(logging.INFO)
    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")

    console = logging.StreamHandler()
    console.setFormatter(fmt)
    logger.addHandler(console)

    # file handler
    log_dir = os.path.join("app", "storage")
    os.makedirs(log_dir, exist_ok=True)
    fh = RotatingFileHandler(os.path.join(log_dir, "app.log"), maxBytes=5_000_000, backupCount=2)
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    return logger
