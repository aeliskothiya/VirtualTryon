from fastapi import HTTPException
from pymongo.database import Database

from app.database.repositories.user_repository import get_user
from app.database.repositories.wardrobe_repository import get_wardrobe_item_for_user
from app.schemas import RecommendationCandidate, RecommendationRequest, RecommendationResponse
from app.services.coin_service import charge_feature
from app.services.recommendation_service import rank_tops_for_bottom
from app.utils.helpers import serialize_document, serialize_many, utcnow


def recommend_tops(payload: RecommendationRequest, current_user: dict, db: Database) -> RecommendationResponse:
    bottom_item = get_wardrobe_item_for_user(db, payload.bottom_item_id, str(current_user["_id"]))
    if bottom_item is None:
        raise HTTPException(status_code=404, detail="Bottom item not found")
    if bottom_item["type"] != "bottom":
        raise HTTPException(status_code=400, detail="Recommendations require a bottom item")

    top_count = db.wardrobe_items.count_documents({"user_id": str(current_user["_id"]), "type": "top"})
    if top_count == 0:
        raise HTTPException(status_code=400, detail="Upload at least one top item before requesting recommendations")

    try:
        charge_feature(db, current_user, "recommendation")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Insufficient coins for recommendations")

    ranked = rank_tops_for_bottom(
        db=db,
        user_id=str(current_user["_id"]),
        bottom_item=bottom_item,
        occasion=payload.occasion,
        limit=payload.suggestion_count,
    )
    recommendation = {
        "user_id": str(current_user["_id"]),
        "bottom_item_id": str(bottom_item["_id"]),
        "occasion": payload.occasion,
        "suggested_top_ids": [str(item["_id"]) for item, _ in ranked],
        "created_at": utcnow(),
    }
    result = db.recommendations.insert_one(recommendation)
    recommendation["_id"] = result.inserted_id

    refreshed_user = get_user(db, str(current_user["_id"]))
    return RecommendationResponse(
        recommendation_id=str(recommendation["_id"]),
        coin_balance=refreshed_user["coin_balance"],
        results=[
            RecommendationCandidate(
                top_item_id=str(item["_id"]),
                score=score,
                top_item=serialize_document(item),
            )
            for item, score in ranked
        ],
    )


def recommendation_history(current_user: dict, db: Database) -> list[dict]:
    history = list(db.recommendations.find({"user_id": str(current_user["_id"])}).sort("created_at", -1))
    return serialize_many(history)

__all__ = ["recommend_tops", "recommendation_history"]
