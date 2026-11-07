from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.audit import AuditLog
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class LogCreate(BaseModel):
    action: str
    user: str
    details: str

@router.get("/")
def get_logs(db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()

@router.post("/")
def create_log(log: LogCreate, db: Session = Depends(get_db)):
    new_log = AuditLog(
        action=log.action,
        user=log.user,
        details=log.details
    )
    db.add(new_log)
    db.commit()
    return {"message": "Log saved"}
    