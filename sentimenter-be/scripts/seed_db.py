import sys
import os
import pandas as pd
from datetime import datetime

# Add root folder to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models.review import Review
from app.services.ml_service import ml_service

def parse_date(date_str):
    if not isinstance(date_str, str):
        return None
    try:
        # replace timezone indicator Z with offset or parse with isoformat
        if isinstance(date_str, str) and date_str.endswith('Z'):
            date_str = date_str.replace('Z', '+00:00')
        return datetime.fromisoformat(date_str)
    except ValueError:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            return None

def main():
    print("Mulai proses Seeding Database...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if database already has reviews
    if db.query(Review).count() > 0:
        print("Database sudah terisi data. Seeding dibatalkan.")
        db.close()
        return

    csv_path = 'data/mybca_reviews.csv'
    if not os.path.exists(csv_path):
        print(f"File {csv_path} tidak ditemukan!")
        db.close()
        return

    df = pd.read_csv(csv_path)
    print(f"Membaca {len(df)} baris dari CSV...")

    reviews_to_insert = []
    
    # Drop rows without content
    df = df.dropna(subset=['content'])
    
    total = len(df)
    print("Memulai proses prediksi sentimen untuk seeding database...")
    print("Proses ini membutuhkan waktu beberapa saat karena menggunakan Sastrawi Stemmer...")

    for i, row in df.iterrows():
        content = str(row['content'])
        sentiment, confidence = ml_service.predict(content)
        
        review = Review(
            review_id=str(row['reviewId']),
            user_name=str(row['userName']) if pd.notna(row['userName']) else None,
            user_image=str(row['userImage']) if pd.notna(row['userImage']) else None,
            content=content,
            score=int(row['score']),
            thumbs_up_count=int(row['thumbsUpCount']) if pd.notna(row['thumbsUpCount']) else 0,
            review_created_version=str(row['reviewCreatedVersion']) if pd.notna(row['reviewCreatedVersion']) else None,
            at=parse_date(row['at']),
            reply_content=str(row['replyContent']) if pd.notna(row['replyContent']) else None,
            replied_at=parse_date(row['repliedAt']),
            app_version=str(row['appVersion']) if pd.notna(row['appVersion']) else None,
            sentiment=sentiment,
            confidence=confidence,
            resolved=False,
            flagged=False
        )
        reviews_to_insert.append(review)

        if (i + 1) % 100 == 0:
            print(f"Diproses: {i + 1}/{total} ulasan...")
            
    print("Menyimpan ulasan ke database SQLite...")
    db.bulk_save_objects(reviews_to_insert)
    db.commit()
    db.close()
    print("Seeding Database Selesai!")

if __name__ == "__main__":
    main()
