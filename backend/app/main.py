from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import router as api_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Academic Decision-Support and Simulation Project for SIH26250 using Synthetic Data.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "project": "AI-Powered Dynamic Air Operations & Resource Optimisation Simulator",
        "problem_statement": "SIH26250",
        "documentation": "/docs",
        "status": "operational",
        "disclaimer": "Academic simulation project using 100% synthetic data."
    }
