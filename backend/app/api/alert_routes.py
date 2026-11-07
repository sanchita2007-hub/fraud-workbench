from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.alert import Alert
from app.models.case import Case  # <-- Yeh zaroori hai
from app.services.detection import run_fraud_detection

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_alerts(db: Session = Depends(get_db)):
    # Un alerts ko ignore karein jo "False Positive" mark ho chuke hain
    closed_cases = db.query(Case).filter(Case.decision == "False Positive").all()
    ignored_alert_ids = [c.linked_alert_id for c in closed_cases if c.linked_alert_id]
    
    alerts = db.query(Alert).filter(~Alert.id.in_(ignored_alert_ids)).order_by(Alert.created_at.desc()).all()
    return alerts

@router.post("/run")
def trigger_detection(db: Session = Depends(get_db)):
    result = run_fraud_detection(db)
    return result