from fastapi import APIRouter
from app.api.endpoints import sentiment, dashboard, reviews

router = APIRouter()
router.include_router(sentiment.router, prefix="/sentiment", tags=["sentiment"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
