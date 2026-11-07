from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)      # Jaise: "Created Case", "Marked False Positive"
    user = Column(String)        # Kisne kiya (Investigator ka naam)
    details = Column(String)     # Kya kiya (Case ID ya Alert ID)
    timestamp = Column(DateTime, default=datetime.utcnow)