from backend.database import ping_database


def test_mongodb() -> None:
    try:
        result = ping_database()
        print(f"MongoDB connection successful: {result}")
    except Exception as exc:
        print(f"MongoDB connection failed: {exc}")


if __name__ == "__main__":
    test_mongodb()
