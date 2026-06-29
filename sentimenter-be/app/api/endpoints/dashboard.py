from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.core.database import get_db
from app.models.review import Review
from datetime import datetime

router = APIRouter()

@router.get("/kpi")
def get_kpi_stats(db: Session = Depends(get_db)):
    total = db.query(Review).count()
    if total == 0:
        return {"total_reviews": "0", "average_rating": "0.0", "overall_sentiment_score": "0%"}
    
    avg_rating = db.query(func.avg(Review.score)).scalar() or 0.0
    positive_count = db.query(Review).filter(Review.sentiment == "positif").count()
    overall_sentiment = (positive_count / total) * 100
    
    return {
        "total_reviews": f"{total / 1000:.1f}k" if total >= 1000 else str(total),
        "average_rating": f"{avg_rating:.1f}",
        "overall_sentiment_score": f"{int(overall_sentiment)}%",
        "total_raw": total,
        "positive_percentage": int(overall_sentiment)
    }

@router.get("/sentiment-breakdown")
def get_sentiment_breakdown(db: Session = Depends(get_db)):
    total = db.query(Review).count()
    if total == 0:
        return {"positive": 0, "negative": 0, "neutral": 0}
        
    positive = db.query(Review).filter(Review.sentiment == "positif").count()
    negative = db.query(Review).filter(Review.sentiment == "negatif").count()
    neutral = db.query(Review).filter(Review.sentiment == "netral").count()
    
    return {
        "positive": int((positive / total) * 100),
        "negative": int((negative / total) * 100),
        "neutral": int((neutral / total) * 100)
    }

@router.get("/trends")
def get_sentiment_trends(db: Session = Depends(get_db)):
    # Group by date
    results = db.query(
        func.strftime('%Y-%m-%d', Review.at).label('date'),
        func.sum(func.case((Review.sentiment == 'positif', 1), else_=0)).label('positive'),
        func.sum(func.case((Review.sentiment == 'negatif', 1), else_=0)).label('negative')
    ).filter(Review.at.isnot(None))\
     .group_by(func.strftime('%Y-%m-%d', Review.at))\
     .order_by('date')\
     .all()
     
    trends = []
    for r in results:
        if r.date:
            try:
                dt = datetime.strptime(r.date, "%Y-%m-%d")
                formatted_date = dt.strftime("%d %b")
            except ValueError:
                formatted_date = r.date
                
            trends.append({
                "date": formatted_date,
                "positive": int(r.positive or 0),
                "negative": int(r.negative or 0)
            })
    return trends

@router.get("/top-topics")
def get_top_topics(db: Session = Depends(get_db)):
    topics_definitions = {
        "Fast Loading": ["cepat", "kencang", "lancar", "loading", "buka", "speed", "fast"],
        "UI Feedback": ["tampilan", "ui", "desain", "warna", "menu", "layout", "tema", "bagus", "cantik"],
        "Login Issue": ["login", "masuk", "gagal masuk", "otp", "verifikasi", "password", "sandi", "error login"],
        "App Crash": ["crash", "keluar sendiri", "force close", "fc", "mati", "error", "macet", "bug", "keluar"]
    }
    
    topics_summary = []
    
    for topic_name, keywords in topics_definitions.items():
        conditions = [Review.content.ilike(f"%{kw}%") for kw in keywords]
        query = db.query(Review).filter(or_(*conditions))
        total_topic_reviews = query.count()
        
        if total_topic_reviews > 0:
            positive_topic_reviews = query.filter(Review.sentiment == "positif").count()
            positive_percentage = int((positive_topic_reviews / total_topic_reviews) * 100)
            
            color = "bg-secondary-container" if positive_percentage >= 50 else "bg-on-tertiary-container"
            
            topics_summary.append({
                "label": topic_name,
                "value": f"{positive_percentage}%",
                "count": total_topic_reviews,
                "color": color
            })
            
    topics_summary = sorted(topics_summary, key=lambda x: x["count"], reverse=True)
    return topics_summary
