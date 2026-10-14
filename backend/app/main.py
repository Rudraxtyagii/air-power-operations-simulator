import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import engine, get_db, Base
from app.routers.missions import router as missions_router
from app.routers.resources import router as resources_router
from app.routers.schedules import router as schedules_router
from app.routers.simulation import router as simulation_router
from app.services.seed_data import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables are created if running directly or with SQLite/Postgres
    try:
        Base.metadata.create_all(bind=engine)
        with Session(engine) as session:
            seed_database(session, force=False)
    except Exception as e:
        print(f"[Warning] Auto table creation/seeding: {e}")
    yield


app = FastAPI(
    title="AI-Powered Dynamic Air Operations & Resource Optimisation Simulator",
    description="Academic decision-support backend using synthetic data for SIH26250.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in origins else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/api/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    return {
        "status": "healthy",
        "service": "AI-Powered Dynamic Air Operations Backend",
        "database": db_status,
        "mode": "synthetic_simulation"
    }


# Include Routers
app.include_router(missions_router, prefix="/api")
app.include_router(resources_router, prefix="/api")
app.include_router(schedules_router, prefix="/api")
app.include_router(simulation_router, prefix="/api")


@app.post("/api/seed", tags=["Seed"])
def trigger_seed(force: bool = False, db: Session = Depends(get_db)):
    result = seed_database(db, force=force)
    return result


@app.get("/")
def root():
    return {
        "project": "AI-Powered Dynamic Air Operations & Resource Optimisation Simulator",
        "problem_statement": "SIH26250",
        "documentation": "/docs",
        "status": "operational",
        "disclaimer": "Academic simulation project using 100% synthetic data."
    }
