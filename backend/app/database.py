import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# .env file se variables load karein
load_dotenv()

# Database URL nikalne ki koshish karein. 
# Agar .env mein na mile, toh backup ke liye direct link use karein (isme psycopg2 driver likha hai)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://admin:admin123@localhost:5432/fraud_db")

# Database engine banayein
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()