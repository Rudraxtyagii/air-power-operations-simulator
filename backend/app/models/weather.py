from datetime import datetime
from sqlalchemy import Integer, String, Float, Boolean, DateTime, func, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class WeatherZone(Base):
    __tablename__ = "weather_zones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    zone_code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)  # ZONE_A to ZONE_I
    zone_name: Mapped[str] = mapped_column(String(100), nullable=False)
    condition: Mapped[str] = mapped_column(String(50), nullable=False, default="Clear")  # Clear, Thunderstorm, Heavy Rain, etc.
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False, default="LOW")  # LOW, MEDIUM, HIGH, NONE
    temperature_c: Mapped[float] = mapped_column(Float, nullable=False, default=24.0)
    wind_speed_kmh: Mapped[float] = mapped_column(Float, nullable=False, default=15.0)
    visibility_km: Mapped[float] = mapped_column(Float, nullable=False, default=10.0)
    radar_status: Mapped[str] = mapped_column(String(100), nullable=False, default="Normal")
    flight_advisory: Mapped[str] = mapped_column(String(255), nullable=False, default="All flights authorized under standard SOP")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class WeatherAlert(Base):
    __tablename__ = "weather_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    alert_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    timestamp_utc: Mapped[str] = mapped_column(String(20), nullable=False)  # e.g., "14:28"
    zone_code: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    condition: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="MEDIUM")  # HIGH, MEDIUM, LOW
    impact: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class WeatherScenario(Base):
    __tablename__ = "weather_scenarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    scenario_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
