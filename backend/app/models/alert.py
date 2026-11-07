from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime
from app.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String, index=True)
    account_id = Column(String, index=True)
    score = Column(Float)
    explanation = Column(String)
    evidence_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)