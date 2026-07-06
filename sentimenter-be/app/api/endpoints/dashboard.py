from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, case, desc
from app.core.database import get_db
from app.models.review import Review
from datetime import datetime, timedelta
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
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
    # Fetch recent reviews to prevent performance issues with fitting LDA
    # We take the 2000 most recent reviews containing text
    reviews = db.query(Review).filter(Review.content.isnot(None)).order_by(desc(Review.at)).limit(2000).all()
    
    if not reviews:
        return []
        
    latest_date = reviews[0].at if reviews[0].at else datetime.utcnow()
    period_end = latest_date
    period_mid = latest_date - timedelta(days=7)
    period_start = latest_date - timedelta(days=14)
    
    # Preprocess texts using ml_service
    documents = []
    valid_reviews = []
    for r in reviews:
        cleaned = ml_service.preprocess_text(r.content)
        if cleaned:
            documents.append(cleaned)
            valid_reviews.append(r)
            
    if not documents:
        return []
        
    # Fit CountVectorizer (better for LDA than TF-IDF)
    vectorizer = CountVectorizer(max_features=1500, max_df=0.90, min_df=2)
    tf = vectorizer.fit_transform(documents)
    
    # Run Latent Dirichlet Allocation (LDA) to extract 4 topics
    n_topics = 4
    lda = LatentDirichletAllocation(n_components=n_topics, random_state=42, max_iter=5, n_jobs=-1)
    lda.fit(tf)
    
    # Get topic labels from top words
    feature_names = vectorizer.get_feature_names_out()
    topic_labels = {}
    for topic_idx, topic in enumerate(lda.components_):
        top_words_idx = topic.argsort()[:-4:-1] # top 3 words
        top_words = [feature_names[i] for i in top_words_idx]
        # Capitalize words and format as "Word1 / Word2 / Word3"
        topic_labels[topic_idx] = " / ".join([w.capitalize() for w in top_words])
        
    # Document-topic distribution
    doc_topic_dist = lda.transform(tf)
    
    # Classify reviews by dominant topic
    topic_reviews = {i: [] for i in range(n_topics)}
    for doc_idx, r in enumerate(valid_reviews):
        dominant_topic = doc_topic_dist[doc_idx].argmax()
        topic_reviews[dominant_topic].append(r)
        
    # Build topics summary
    topics_summary = []
    for topic_idx, r_list in topic_reviews.items():
        count = len(r_list)
        if count == 0:
            continue
            
        pos_count = sum(1 for r in r_list if r.sentiment == "positif")
        positive_percentage = int((pos_count / count) * 100)
        
        # Calculate growth rate (current 7 days vs previous 7 days)
        current_count = sum(1 for r in r_list if r.at and period_mid <= r.at <= period_end)
        previous_count = sum(1 for r in r_list if r.at and period_start <= r.at < period_mid)
        
        if previous_count > 0:
            growth = int(((current_count - previous_count) / previous_count) * 100)
        else:
            growth = 100 if current_count > 0 else 0
            
        color = "bg-secondary-container" if positive_percentage >= 50 else "bg-on-tertiary-container"
        
        serialized_reviews = []
        for r in r_list:
            serialized_reviews.append({
                "review_id": r.review_id,
                "user_name": r.user_name,
                "user_image": r.user_image,
                "content": r.content,
                "score": r.score,
                "sentiment": r.sentiment,
                "at": r.at.isoformat() if r.at else None
            })
            
        topics_summary.append({
            "label": topic_labels[topic_idx],
            "value": f"{positive_percentage}%",
            "count": count,
            "growth": growth,
            "color": color,
            "reviews": serialized_reviews
        })
        
    # Sort topics by volume
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
