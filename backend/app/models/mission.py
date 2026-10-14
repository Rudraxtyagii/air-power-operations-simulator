from datetime import datetime
from sqlalchemy import Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Mission(Base):
    __tablename__ = "missions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    mission_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="MEDIUM")  # HIGH / MEDIUM / LOW
    zone: Mapped[str] = mapped_column(String(20), nullable=False, default="ZONE_A")  # ZONE_A / ZONE_B / ZONE_C / ZONE_D
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=120)
    start_window: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_window: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    required_resource_type: Mapped[str] = mapped_column(String(20), nullable=False, default="TYPE_A")  # TYPE_A / TYPE_B / TYPE_C
    required_resource_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING")  # PENDING / SCHEDULED / ACTIVE / COMPLETED / DELAYED
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    schedules = relationship("Schedule", back_populates="mission", cascade="all, delete-orphan")
    simulation_events = relationship("SimulationEvent", back_populates="mission")
