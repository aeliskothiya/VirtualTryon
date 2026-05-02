from pymongo.database import Database


def get_overview_metrics(db: Database) -> dict:
    return {
        "total_users": db.users.count_documents({}),
        "fully_registered_users": db.users.count_documents({"is_fully_registered": True}),
        "total_admins": db.admins.count_documents({}),
        "total_tryons": db.tryon_jobs.count_documents({}),
        "total_recommendations": db.recommendations.count_documents({}),
        "total_saved_tryons": db.tryon_jobs.count_documents({"is_saved": True}),
    }


__all__ = ["get_overview_metrics"]
