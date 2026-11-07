import pandas as pd
import uuid
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.services.graph_service import GraphService

def process_csv_and_save(file_path: str, db: Session, source_filename: str):
    try:
        df = pd.read_csv(file_path)
        df.columns = df.columns.str.strip()
    except Exception as e:
        return {"error": f"Could not read file: {str(e)}"}

    required_cols = ['transaction_id', 'from_account', 'to_account', 'amount', 'timestamp']
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        return {"error": f"Missing columns in CSV: {missing_cols}"}

    df['timestamp'] = pd.to_datetime(df['timestamp'], format='mixed', errors='coerce')
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
    df = df.dropna(subset=['from_account', 'to_account', 'amount', 'timestamp'])

    batch_id = str(uuid.uuid4())
    success_count = 0
    
    # 1. Purana data saaf karein (Database reset)
    # Agar aap chahte hain ki purana data na delete ho, toh in 2 lines ko hata dein
    db.query(Transaction).delete()
    db.commit()

    graph_service = GraphService()

    for index, row in df.iterrows():
        try:
            # 2. Naya Transaction ID banayein (Duplicate na ho isliye)
            new_txn_id = f"{row['transaction_id']}_{str(uuid.uuid4())[:4]}"
            
            safe_raw_data = {str(k): str(v) for k, v in row.to_dict().items()}
            
            # 3. Save to PostgreSQL
            new_txn = Transaction(
                transaction_id=str(new_txn_id),
                from_account=str(row['from_account']).lower().strip(),
                to_account=str(row['to_account']).lower().strip(),
                amount=float(row['amount']),
                timestamp=row['timestamp'],
                device_id=str(row['device_id']).lower().strip() if pd.notna(row.get('device_id')) else None,
                merchant_id=str(row['merchant_id']).lower().strip() if pd.notna(row.get('merchant_id')) else None,
                import_batch_id=batch_id,
                source_file=source_filename,
                raw_data=safe_raw_data
            )
            db.add(new_txn)
            db.commit()
            success_count += 1

            # 4. Save to Neo4j
            txn_data = {
                "transaction_id": new_txn.transaction_id,
                "from_account": new_txn.from_account,
                "to_account": new_txn.to_account,
                "amount": new_txn.amount,
                "timestamp": str(new_txn.timestamp),
                "device_id": new_txn.device_id
            }
            graph_service.create_transaction_graph(txn_data)
            
        except Exception as e:
            db.rollback()
            print(f"--> [ERROR] Error at row {index}: {str(e)}")
            continue
    
    graph_service.close()
    
    return {
        "message": "Import complete",
        "batch_id": batch_id,
        "inserted_rows": success_count
    }