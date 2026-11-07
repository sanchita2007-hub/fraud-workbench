from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from pydantic import BaseModel
import hashlib
from jose import jwt
from datetime import datetime, timedelta

router = APIRouter()

SECRET_KEY = "super_secret_fraud_ai_key_2026"
ALGORITHM = "HS256"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserSignup(BaseModel):
    name: str
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

def get_password_hash(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/signup")
def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user_data.password)
    
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_pw,
        role=user_data.role,
        is_verified=True, # Direct verify, no OTP
        otp=None
    )
    db.add(new_user)
    db.commit()
    return {"message": "Account created successfully"}

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if get_password_hash(user_data.password) != user.password_hash:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token_data = {
        "sub": user.email,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "user": {"name": user.name, "role": user.role}
    }