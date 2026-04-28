from pymongo.database import Database


def get_overview_metrics(db: Database) -> dict:
    total_coin_balance = 0
    for user in db.users.find({}, {"coin_balance": 1}):
        total_coin_balance += int(user.get("coin_balance", 0) or 0)

    return {
        "total_users": db.users.count_documents({}),
        "fully_registered_users": db.users.count_documents({"is_fully_registered": True}),
        "total_admins": db.admins.count_documents({}),
        "total_tryons": db.tryon_jobs.count_documents({}),
        "total_recommendations": db.recommendations.count_documents({}),
        "total_coin_transactions": db.coin_transactions.count_documents({}),
        "total_coin_balance": total_coin_balance,
    }


__all__ = ["get_overview_metrics"]
