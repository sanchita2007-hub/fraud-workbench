from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from app.database import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    status = Column(String, default="Open") # Open, Under Investigation, Closed
    decision = Column(String, nullable=True) # "Confirmed Fraud", "False Positive"
    linked_alert_id = Column(Integer, nullable=True) # Kis alert se bana hai
    created_at = Column(DateTime, default=datetime.utcnow)
    evidence = Column(JSON, nullable=True) # Alert ki details save karne ke liye