from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.case import Case
from app.models.alert import Alert
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class CaseCreate(BaseModel):
    title: str
    linked_alert_id: Optional[int] = None

class DecisionUpdate(BaseModel):
    decision: str

@router.get("/")
def get_all_cases(db: Session = Depends(get_db)):
    return db.query(Case).order_by(Case.created_at.desc()).all()

@router.post("/")
def create_case(case_data: CaseCreate, db: Session = Depends(get_db)):
    try:
        new_case = Case(
            title=case_data.title, 
            linked_alert_id=case_data.linked_alert_id,
            status="Open"
        )
        
        if case_data.linked_alert_id:
            alert = db.query(Alert).filter(Alert.id == case_data.linked_alert_id).first()
            if alert:
                new_case.evidence = {
                    "alert_type": alert.alert_type,
                    "account_id": alert.account_id,
                    "explanation": alert.explanation
                }
        
        db.add(new_case)
        db.commit()
        db.refresh(new_case)
        return new_case
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{case_id}/decision")
def update_decision(case_id: int, decision_data: DecisionUpdate, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    case.decision = decision_data.decision
    case.status = "Closed" if decision_data.decision in ["Confirmed Fraud", "False Positive"] else "Under Investigation"
    db.commit()
    return case

@router.get("/{case_id}/export")
def export_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    return {
        "case_id": case.id,
        "title": case.title,
        "status": case.status,
        "decision": case.decision,
        "evidence": case.evidence
    }

@router.delete("/{case_id}")
def delete_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    db.delete(case)
    db.commit()
    return {"message": "Case deleted successfully"}