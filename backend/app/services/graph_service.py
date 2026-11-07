from neo4j import GraphDatabase
import os

class GraphService:
    def __init__(self):
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USER", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "password123")
        try:
            self.driver = GraphDatabase.driver(uri, auth=(user, password))
        except Exception as e:
            print(f"Neo4j Connection Error: {e}")
            self.driver = None

    def close(self):
        if self.driver:
            self.driver.close()

    def create_transaction_graph(self, txn_data):
        if not self.driver:
            return
            
        query = """
        MERGE (from_acc:Account {id: $from_account})
        MERGE (to_acc:Account {id: $to_account})
        CREATE (t:Transaction {id: $transaction_id, amount: $amount, timestamp: $timestamp})
        MERGE (from_acc)-[:SENT]->(t)
        MERGE (t)-[:RECEIVED_BY]->(to_acc)
        """
        if txn_data.get('device_id'):
            query += """
            MERGE (dev:Device {id: $device_id})
            MERGE (from_acc)-[:USED_DEVICE]->(dev)
            """
        try:
            with self.driver.session() as session:
                session.run(query, **txn_data)
        except Exception as e:
            print(f"Error saving to Neo4j: {e}")

    # YEH NAYA FUNCTION ADD KIYA HAI (Yeh error nahi dega)
    def get_account_network(self, account_id):
        if not self.driver:
            return {"nodes": [], "links": []}
            
        query = """
        MATCH (a:Account {id: $account_id})
        OPTIONAL MATCH path = (a)-[*1..2]-(connected)
        RETURN path LIMIT 50
        """
        try:
            with self.driver.session() as session:
                result = session.run(query, account_id=account_id)
                nodes = []
                links = []
                seen_nodes = set()
                
                for record in result:
                    if record["path"]:
                        for node in record["path"].nodes:
                            if node.element_id not in seen_nodes:
                                nodes.append({
                                    "id": node.element_id,
                                    "label": list(node.labels)[0],
                                    "name": node.get("id", "Unknown")
                                })
                                seen_nodes.add(node.element_id)
                        for rel in record["path"].relationships:
                            links.append({
                                "source": rel.start_node.element_id,
                                "target": rel.end_node.element_id,
                                "type": rel.type
                            })
                return {"nodes": nodes, "links": links}
        except Exception as e:
            print(f"Error fetching graph: {e}")
            return {"nodes": [], "links": []}