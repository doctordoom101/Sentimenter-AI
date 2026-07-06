from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.core.database import get_db
from app.models.review import Review
from app.services.ml_service import ml_service
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# Schemas
class ReviewBase(BaseModel):
    review_id: str
    user_name: Optional[str]
    user_image: Optional[str]
    content: str
    score: int
    thumbs_up_count: int
    review_created_version: Optional[str]
    at: Optional[datetime]
    reply_content: Optional[str]
    replied_at: Optional[datetime]
    app_version: Optional[str]
    sentiment: str
    confidence: float
    resolved: bool
    flagged: bool

    class Config:
        from_attributes = True

class PaginatedReviews(BaseModel):
    total: int
    page: int
    limit: int
    reviews: List[ReviewBase]

class AIInsightResponse(BaseModel):
    keywords: List[str]
    summary: str
    confidence: int



@router.get("", response_model=PaginatedReviews)
def get_reviews(
    db: Session = Depends(get_db),
    query: Optional[str] = Query(None, description="Search keyword in reviews"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment (positif, netral, negatif)"),
    resolved: Optional[bool] = Query(None, description="Filter by resolution status"),
    flagged: Optional[bool] = Query(None, description="Filter by flagged status"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1)
):
    stmt = db.query(Review)
    
    if query:
        stmt = stmt.filter(Review.content.ilike(f"%{query}%"))
    if sentiment and sentiment != "all":
        stmt = stmt.filter(Review.sentiment == sentiment)
    if resolved is not None:
        stmt = stmt.filter(Review.resolved == resolved)
    if flagged is not None:
        stmt = stmt.filter(Review.flagged == flagged)
        
    total = stmt.count()
    
    # Sort by date descending (reviews without date will be at the bottom)
    reviews = stmt.order_by(desc(Review.at)).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "reviews": reviews
    }

@router.get("/{review_id}", response_model=ReviewBase)
def get_review_detail(review_id: str, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.review_id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

@router.get("/{review_id}/ai-insights", response_model=AIInsightResponse)
def get_review_ai_insights(review_id: str, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.review_id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    detected = ml_service.extract_keywords(review.content, top_n=3)

    if review.sentiment == "negatif":
        summary = "Pengguna menyatakan rasa kecewa atau mengalami kendala teknis/fungsionalitas aplikasi."
    elif review.sentiment == "positif":
        summary = "Pengguna memberikan umpan balik positif terkait pengalaman menggunakan aplikasi."
    else:
        summary = "Pengguna memberikan ulasan dengan nada netral atau sekadar bertanya/memberi saran ringan."
        
    return {
        "keywords": detected,
        "summary": summary,
        "confidence": int(review.confidence * 100) if review.confidence <= 1.0 else int(review.confidence)
    }



@router.post("/{review_id}/resolve", response_model=ReviewBase)
def mark_review_resolved(review_id: str, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.review_id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    review.resolved = True
    db.commit()
    db.refresh(review)
    return review

@router.post("/{review_id}/flag", response_model=ReviewBase)
def flag_review(review_id: str, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.review_id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    review.flagged = True
    db.commit()
    db.refresh(review)
    return review
