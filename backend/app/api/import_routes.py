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
    # Render ki temporary directory use karein
    temp_dir = "/tmp"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)
    
    # File ko save karein
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Call service to process CSV
    result = process_csv_and_save(file_path, db, file.filename)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result
