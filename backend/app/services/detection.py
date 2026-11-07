from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.models.alert import Alert
import networkx as nx
from datetime import timedelta

def run_fraud_detection(db: Session):
    # 1. Database se saare transactions nikalain
    txns = db.query(Transaction).all()
    
    # Graph banayein NetworkX ka use karke
    G = nx.DiGraph()
    for t in txns:
        G.add_edge(t.from_account, t.to_account, txn_id=t.transaction_id, amount=t.amount, timestamp=t.timestamp)

    alerts_created = 0

    # RULE 1: Circular Transfers (A -> B -> C -> A)
    try:
        cycles = list(nx.simple_cycles(G))
        for cycle in cycles:
            if len(cycle) >= 2: # 2 ya usse zyada accounts ka loop
                path_str = " -> ".join(cycle + [cycle[0]])
                
                # Check karein ki yeh alert pehle se database mein toh nahi hai
                existing = db.query(Alert).filter(Alert.explanation.contains(path_str)).first()
                if not existing:
                    new_alert = Alert(
                        alert_type="Circular Transfer",
                        account_id=cycle[0],
                        score=95.0,
                        explanation=f"Funds were moved in a closed loop: {path_str}",
                        evidence_data={"path": cycle}
                    )
                    db.add(new_alert)
                    alerts_created += 1
    except Exception as e:
        print(f"Error in circular detection: {e}")

    # RULE 2: Rapid Fund Movement (Structuring)
    # Ek account se 1 ghante mein 3 se zyada transactions
    for account in G.nodes():
        out_edges = list(G.out_edges(account, data=True))
        if len(out_edges) >= 3:
            # Check karein ki yeh 3 transactions kam samay mein hue hain ya nahi
            timestamps = sorted([data['timestamp'] for u, v, data in out_edges])
            if len(timestamps) >= 3:
                time_diff = timestamps[-1] - timestamps[0]
                if time_diff <= timedelta(hours=2): # 2 ghante ke andar
                    explanation = f"Account {account} made {len(out_edges)} transactions within {time_diff}."
                    existing = db.query(Alert).filter(Alert.explanation == explanation).first()
                    if not existing:
                        new_alert = Alert(
                            alert_type="Rapid Fund Movement",
                            account_id=account,
                            score=85.0,
                            explanation=explanation,
                            evidence_data={"transaction_count": len(out_edges)}
                        )
                        db.add(new_alert)
                        alerts_created += 1

    db.commit()
    return {"message": f"Detection complete. {alerts_created} new alerts generated."}