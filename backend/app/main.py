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
from app.routers.weather import router as weather_router
from app.routers.optimization import router as optimization_router
from app.services.seed_data import seed_database
from app.services.weather_data import seed_weather_data_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables are created if running directly or with SQLite/Postgres
    try:
        Base.metadata.create_all(bind=engine)
        with Session(engine) as session:
            seed_database(session, force=False)
            seed_weather_data_if_empty(session)
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
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
env_origins = os.getenv("CORS_ORIGINS")
if env_origins:
    origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://.*",
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
app.include_router(weather_router, prefix="/api")
app.include_router(optimization_router, prefix="/api")


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
