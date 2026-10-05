from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "AI-Powered Dynamic Air Operations & Resource Optimisation Simulator"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "postgresql://airops_user:airops_secure_pass@localhost:5432/airops_db"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
