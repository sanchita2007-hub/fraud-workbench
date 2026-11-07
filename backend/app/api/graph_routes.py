from fastapi import APIRouter
from app.services.graph_service import GraphService

router = APIRouter()

@router.get("/{account_id}")
def get_graph_for_account(account_id: str):
    service = GraphService()
    data = service.get_account_network(account_id)
    service.close()
    return data