from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime
from app.core.database import Base
from datetime import datetime

class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(String, primary_key=True, index=True)
    user_name = Column(String, nullable=True)
    user_image = Column(String, nullable=True)
    content = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    thumbs_up_count = Column(Integer, default=0)
    review_created_version = Column(String, nullable=True)
    at = Column(DateTime, nullable=True)
    reply_content = Column(String, nullable=True)
    replied_at = Column(DateTime, nullable=True)
    app_version = Column(String, nullable=True)
    
    # ML Fields
    sentiment = Column(String, nullable=False) # positif, netral, negatif
    confidence = Column(Float, default=0.0)
    
    # Operational Fields
    resolved = Column(Boolean, default=False)
    flagged = Column(Boolean, default=False)
