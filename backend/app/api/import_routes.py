from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import shutil
import os
from app.database import SessionLocal
from sqlalchemy.orm import Session
from app.services.ingestion import process_csv_and_save

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    os.makedirs("data/raw", exist_ok=True)
    file_path = f"data/raw/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Call service
    result = process_csv_and_save(file_path, db, file.filename)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result