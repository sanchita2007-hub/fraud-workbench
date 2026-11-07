from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import transaction, alert, case, user, audit
from app.api import import_routes, graph_routes, alert_routes, case_routes, dashboard_routes, auth_routes, audit_routes
from sqlalchemy import text

# Tables create karein (PostgreSQL mein)
Base.metadata.create_all(bind=engine)

# Database Update Block
with engine.connect() as conn:
    conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;'))
    conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR;'))
    conn.commit()

app = FastAPI(title="Financial Fraud Workbench")

# CORS Error Fix
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes add karein
app.include_router(import_routes.router, prefix="/api/import", tags=["Import"])
app.include_router(graph_routes.router, prefix="/api/graph", tags=["Graph"])
app.include_router(alert_routes.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(case_routes.router, prefix="/api/cases", tags=["Cases"])
app.include_router(dashboard_routes.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Auth"])
app.include_router(audit_routes.router, prefix="/api/audit", tags=["Audit"]) # Naya Route

@app.get("/")
def read_root():
    return {"message": "Fraud Workbench API is running!"}