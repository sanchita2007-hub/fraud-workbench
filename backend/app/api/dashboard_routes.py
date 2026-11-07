from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.models.case import Case

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_txns = db.query(Transaction).count()
    total_alerts = db.query(Alert).count()
    open_cases = db.query(Case).filter(Case.status == "Open").count()
    closed_cases = db.query(Case).filter(Case.status == "Closed").count()
    
    return {
        "transactions": total_txns,
        "alerts": total_alerts,
        "open_cases": open_cases,
        "closed_cases": closed_cases
    }

# NAYA API: Charts ke liye data
@router.get("/charts")
def get_chart_data(db: Session = Depends(get_db)):
    # 1. Alerts by Type (Pie Chart ke liye)
    alerts = db.query(Alert.alert_type).all()
    alert_counts = {}
    for a in alerts:
        alert_counts[a[0]] = alert_counts.get(a[0], 0) + 1
    
    alert_data = [{"name": k, "value": v} for k, v in alert_counts.items()]
    
    # Agar database khali hai, toh ek dummy data dikhayein taaki chart blank na lage
    if not alert_data:
        alert_data = [{"name": "No Alerts Yet", "value": 1}]

    # 2. Recent Activity (Bar Chart ke liye)
    # Abhi ke liye hum dummy data de rahe hain, baad mein isko real transaction dates se jod sakte hain
    return {
        "alerts_by_type": alert_data,
        "recent_activity": [
            {"name": "Mon", "alerts": 4},
            {"name": "Tue", "alerts": 7},
            {"name": "Wed", "alerts": 2},
            {"name": "Thu", "alerts": 8},
            {"name": "Fri", "alerts": 5},
            {"name": "Sat", "alerts": 1},
            {"name": "Sun", "alerts": 0},
        ]
    }