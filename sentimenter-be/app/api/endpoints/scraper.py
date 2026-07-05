from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.review import Review
from app.services.scraper import scrape_reviews_batch
from app.services.ml_service import ml_service
from datetime import datetime

router = APIRouter()

def parse_date(date_str):
    if not isinstance(date_str, str):
        return None
    try:
        if isinstance(date_str, str) and date_str.endswith('Z'):
            date_str = date_str.replace('Z', '+00:00')
        return datetime.fromisoformat(date_str)
    except ValueError:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            return None

@router.post("/run")
def run_scraper(
    count: int = Query(100, ge=-1, le=1000, description="Jumlah ulasan yang ditarik. Gunakan -1 untuk mengambil semua (max 1000)"),
    db: Session = Depends(get_db)
):
    app_id = 'com.bca.mybca.omni.android'
    
    try:
        # Fetch reviews
        if count == -1 or count > 1000:
            # Cap at 1000 to prevent gateway timeouts
            raw_reviews = scrape_reviews_batch(app_id, count=1000)
        else:
            raw_reviews = scrape_reviews_batch(app_id, count=count)
            
        if not raw_reviews:
            return {
                "status": "success",
                "scraped_count": 0,
                "added_count": 0,
                "skipped_count": 0,
                "message": "Tidak ada ulasan baru yang ditemukan di Play Store."
            }
            
        added_count = 0
        skipped_count = 0
        reviews_to_save = []
        
        for r in raw_reviews:
            review_id = str(r['reviewId'])
            # Check duplicate in database
            exists = db.query(Review.review_id).filter(Review.review_id == review_id).first()
            if exists:
                skipped_count += 1
                continue
                
            content = str(r['content'])
            sentiment, confidence = ml_service.predict(content)
            
            review = Review(
                review_id=review_id,
                user_name=str(r['userName']) if r.get('userName') else None,
                user_image=str(r['userImage']) if r.get('userImage') else None,
                content=content,
                score=int(r['score']),
                thumbs_up_count=int(r['thumbsUpCount']) if r.get('thumbsUpCount') else 0,
                review_created_version=str(r['reviewCreatedVersion']) if r.get('reviewCreatedVersion') else None,
                at=parse_date(r['at']),
                reply_content=str(r['replyContent']) if r.get('replyContent') else None,
                replied_at=parse_date(r.get('repliedAt')),
                app_version=str(r['appVersion']) if r.get('appVersion') else None,
                sentiment=sentiment,
                confidence=confidence,
                resolved=False,
                flagged=False
            )
            reviews_to_save.append(review)
            added_count += 1
            
        if reviews_to_save:
            db.bulk_save_objects(reviews_to_save)
            db.commit()
            
        return {
            "status": "success",
            "scraped_count": len(raw_reviews),
            "added_count": added_count,
            "skipped_count": skipped_count,
            "message": f"Berhasil menarik {len(raw_reviews)} ulasan. {added_count} baru disimpan, {skipped_count} dilewati (duplikat)."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan saat scraping: {str(e)}")
