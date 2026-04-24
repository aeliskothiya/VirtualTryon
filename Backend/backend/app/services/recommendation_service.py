from pymongo.database import Database


def score_top_for_bottom(top: dict, bottom: dict, occasion: str | None) -> float:
    score = 1.0
    target_occasion = (occasion or bottom.get("occasion") or "").strip().lower()
    top_occasion = (top.get("occasion") or "").strip().lower()

    if target_occasion and top_occasion == target_occasion:
        score += 3.0
    elif not target_occasion and not top_occasion:
        score += 1.0

    if top.get("embedding_done"):
        score += 0.5

    return round(score, 3)


def rank_tops_for_bottom(
    db: Database,
    user_id: str,
    bottom_item: dict,
    occasion: str | None,
    limit: int = 5,
) -> list[tuple[dict, float]]:
    tops = list(
        db.wardrobe_items.find(
            {
                "user_id": user_id,
                "type": "top",
                "_id": {"$ne": bottom_item["_id"]},
            }
        ).sort("created_at", -1)
    )
    ranked = [(top, score_top_for_bottom(top, bottom_item, occasion)) for top in tops]
    ranked.sort(key=lambda item: item[1], reverse=True)
    return ranked[:limit]

__all__ = ["rank_tops_for_bottom", "score_top_for_bottom"]
