from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from Backend.FashionAI.backend import crud
from Backend.FashionAI.backend import schemas
from Backend.FashionAI.backend.database import get_db
from Backend.FashionAI.backend.deps import get_current_fully_registered_user
from Backend.FashionAI.backend.services.coins import charge_feature
from Backend.FashionAI.backend.services.recommendations import rank_tops_for_bottom


router = APIRouter(prefix="/recommend", tags=["recommendations"])


@router.post("", response_model=schemas.RecommendationResponse, status_code=status.HTTP_201_CREATED)
def recommend_tops(
    payload: schemas.RecommendationRequest,
    current_user: dict = Depends(get_current_fully_registered_user),
    db: Database = Depends(get_db),
):
    bottom_item = crud.get_wardrobe_item_for_user(db, payload.bottom_item_id, str(current_user["_id"]))
    if bottom_item is None:
        raise HTTPException(status_code=404, detail="Bottom item not found")
    if bottom_item["type"] != "bottom":
        raise HTTPException(status_code=400, detail="Recommendations require a bottom item")

    try:
        charge_feature(db, current_user, "recommendation")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Insufficient coins for recommendations")

    ranked = rank_tops_for_bottom(
        db=db,
        user_id=str(current_user["_id"]),
        bottom_item=bottom_item,
        occasion=payload.occasion,
    )
    recommendation = {
        "user_id": str(current_user["_id"]),
        "bottom_item_id": str(bottom_item["_id"]),
        "occasion": payload.occasion,
        "suggested_top_ids": [str(item["_id"]) for item, _ in ranked],
        "created_at": crud.utcnow(),
    }
    result = db.recommendations.insert_one(recommendation)
    recommendation["_id"] = result.inserted_id

    refreshed_user = crud.get_user(db, str(current_user["_id"]))
    return schemas.RecommendationResponse(
        recommendation_id=str(recommendation["_id"]),
        coin_balance=refreshed_user["coin_balance"],
        results=[
            schemas.RecommendationCandidate(
                top_item_id=str(item["_id"]),
                score=score,
                top_item=crud.serialize_document(item),
            )
            for item, score in ranked
        ],
    )


@router.get("/history", response_model=list[schemas.RecommendationHistoryOut])
def recommendation_history(
    current_user: dict = Depends(get_current_fully_registered_user),
    db: Database = Depends(get_db),
):
    history = list(db.recommendations.find({"user_id": str(current_user["_id"])}).sort("created_at", -1))
    return crud.serialize_many(history)
