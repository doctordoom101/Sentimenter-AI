from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, case
from app.core.database import get_db
from app.models.review import Review
from datetime import datetime, timedelta
from collections import Counter
import string
import re
from app.services.ml_service import ml_service

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
        func.sum(case((Review.sentiment == 'positif', 1), else_=0)).label('positive'),
        func.sum(case((Review.sentiment == 'negatif', 1), else_=0)).label('negative')
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
    
    # Get latest review date to determine relative periods
    latest_review = db.query(Review.at).filter(Review.at.isnot(None)).order_by(desc(Review.at)).first()
    if latest_review and latest_review[0]:
        latest_date = latest_review[0]
    else:
        latest_date = datetime.utcnow()
        
    period_end = latest_date
    period_mid = latest_date - timedelta(days=7)
    period_start = latest_date - timedelta(days=14)
    
    topics_summary = []
    
    for topic_name, keywords in topics_definitions.items():
        conditions = [Review.content.ilike(f"%{kw}%") for kw in keywords]
        query = db.query(Review).filter(or_(*conditions))
        total_topic_reviews = query.count()
        
        if total_topic_reviews > 0:
            positive_topic_reviews = query.filter(Review.sentiment == "positif").count()
            positive_percentage = int((positive_topic_reviews / total_topic_reviews) * 100)
            
            # Calculate growth rate
            current_count = query.filter(Review.at >= period_mid, Review.at <= period_end).count()
            previous_count = query.filter(Review.at >= period_start, Review.at < period_mid).count()
            
            if previous_count > 0:
                growth = int(((current_count - previous_count) / previous_count) * 100)
            else:
                growth = 100 if current_count > 0 else 0
            
            color = "bg-secondary-container" if positive_percentage >= 50 else "bg-on-tertiary-container"
            
            topics_summary.append({
                "label": topic_name,
                "value": f"{positive_percentage}%",
                "count": total_topic_reviews,
                "growth": growth,
                "color": color
            })
            
    topics_summary = sorted(topics_summary, key=lambda x: x["count"], reverse=True)
    return topics_summary

@router.get("/top-keywords")
def get_top_keywords(db: Session = Depends(get_db)):
    reviews = db.query(Review.content, Review.sentiment).all()
    
    words_all = []
    words_neg = []
    
    stop_words = ml_service.stop_words
    
    for content, sentiment in reviews:
        if not content:
            continue
        # Fast clean (no stemming for speed)
        text = content.lower()
        text = re.sub(f"[{re.escape(string.punctuation)}]", " ", text)
        text = re.sub(r"\d+", "", text)
        
        for word in text.split():
            if word not in stop_words and len(word) > 3:
                words_all.append(word)
                if sentiment == 'negatif':
                    words_neg.append(word)
                    
    most_common_all = Counter(words_all).most_common(6)
    most_common_neg = Counter(words_neg).most_common(2)
    
    styles = [
        "px-lg py-md bg-error-container text-on-error-container font-extrabold rounded-xl text-xl",
        "px-md py-sm bg-tertiary-fixed text-on-tertiary-fixed font-bold rounded-lg text-lg",
        "px-md py-sm bg-secondary-container text-on-secondary-container font-bold rounded-lg text-lg",
        "px-sm py-xs bg-surface-container text-on-surface rounded-lg text-sm",
        "px-sm py-xs bg-surface-container text-on-surface rounded-lg text-sm",
        "px-sm py-xs bg-surface-container text-on-surface rounded-lg text-xs"
    ]
    
    keywords_data = []
    for idx, (word, count) in enumerate(most_common_all):
        style = styles[idx] if idx < len(styles) else "px-sm py-xs bg-surface-container text-on-surface rounded-lg text-xs"
        keywords_data.append({
            "word": word,
            "count": count,
            "style": style
        })
        
    if len(most_common_neg) >= 2:
        neg1 = most_common_neg[0][0]
        neg2 = most_common_neg[1][0]
        insight = f"Keluhan kata kunci '{neg1}' dan '{neg2}' paling sering ditemukan pada ulasan bersentimen negatif."
    elif len(most_common_neg) == 1:
        neg1 = most_common_neg[0][0]
        insight = f"Keluhan kata kunci '{neg1}' paling mendominasi ulasan bersentimen negatif."
    else:
        insight = "Belum ditemukan kata kunci negatif yang signifikan pada ulasan."
        
    return {
        "keywords": keywords_data,
        "insight": insight
    }
