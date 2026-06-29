from fastapi import APIRouter
from app.models.sentiment import SentimentRequest, SentimentResponse
from app.services.ml_service import ml_service

router = APIRouter()

@router.post("/predict", response_model=SentimentResponse)
async def predict_sentiment(request: SentimentRequest):
    prediction, confidence = ml_service.predict(request.text)
    return SentimentResponse(
        text=request.text,
        sentiment=prediction,
        confidence=confidence
    )
