from datetime import datetime
from sqlalchemy import Integer, String, Float, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    resource_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    resource_type: Mapped[str] = mapped_column(String(20), nullable=False, default="TYPE_A")  # TYPE_A / TYPE_B / TYPE_C
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    availability_status: Mapped[str] = mapped_column(String(20), nullable=False, default="AVAILABLE")  # AVAILABLE / IN_MISSION / UNAVAILABLE / MAINTENANCE
    fuel_level: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    maintenance_status: Mapped[str] = mapped_column(String(20), nullable=False, default="NORMAL")  # NORMAL / ATTENTION / MAINTENANCE
    operating_hours: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    current_zone: Mapped[str] = mapped_column(String(20), nullable=False, default="ZONE_A")  # ZONE_A / ZONE_B / ZONE_C / ZONE_D
    home_base: Mapped[str] = mapped_column(String(20), nullable=False, default="BASE_1")  # BASE_1 / BASE_2 / BASE_3 / BASE_4
    predicted_availability: Mapped[int] = mapped_column(Integer, nullable=False, default=90)  # 0-100%
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    schedules = relationship("Schedule", back_populates="resource", cascade="all, delete-orphan")
    simulation_events = relationship("SimulationEvent", back_populates="resource")
