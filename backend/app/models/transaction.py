from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True)
    from_account = Column(String, index=True)
    to_account = Column(String, index=True)
    amount = Column(Float)
    timestamp = Column(DateTime)
    device_id = Column(String, nullable=True)
    merchant_id = Column(String, nullable=True)
    import_batch_id = Column(String, index=True)
    source_file = Column(String)
    raw_data = Column(JSON)
    