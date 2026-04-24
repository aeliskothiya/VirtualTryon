from pymongo import ReturnDocument
from pymongo.database import Database

from app.utils.helpers import utcnow


def log_transaction(
    db: Database,
    user_id: str,
    amount: int,
    transaction_type: str,
    reason: str,
    reference_id: str | None = None,
) -> dict:
    transaction = {
        "user_id": user_id,
        "amount": amount,
        "type": transaction_type,
        "reason": reason,
        "reference_id": reference_id,
        "created_at": utcnow(),
    }
    result = db.coin_transactions.insert_one(transaction)
    transaction["_id"] = result.inserted_id
    return transaction


def credit_user(
    db: Database,
    user: dict,
    amount: int,
    reason: str,
    reference_id: str | None = None,
) -> dict:
    db.users.update_one({"_id": user["_id"]}, {"$inc": {"coin_balance": amount}})
    user["coin_balance"] = user.get("coin_balance", 0) + amount
    return log_transaction(db, str(user["_id"]), amount, "credit", reason, reference_id)


def charge_feature(db: Database, user: dict, feature: str, reference_id: str | None = None) -> int:
    pricing = db.pricing.find_one({"feature": feature})
    if pricing is None:
        raise ValueError(f"Pricing is not configured for feature '{feature}'")

    updated_user = db.users.find_one_and_update(
        {"_id": user["_id"], "coin_balance": {"$gte": pricing["coin_cost"]}},
        {"$inc": {"coin_balance": -pricing["coin_cost"]}},
        return_document=ReturnDocument.AFTER,
    )
    if updated_user is None:
        raise PermissionError(f"Insufficient coins for {feature}")

    user["coin_balance"] = updated_user["coin_balance"]
    log_transaction(
        db=db,
        user_id=str(user["_id"]),
        amount=pricing["coin_cost"],
        transaction_type="debit",
        reason=feature,
        reference_id=reference_id,
    )
    return pricing["coin_cost"]

__all__ = ["charge_feature", "credit_user", "log_transaction"]

