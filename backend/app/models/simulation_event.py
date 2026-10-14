from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class SimulationEvent(Base):
    __tablename__ = "simulation_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    affected_resource_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("resources.id", ondelete="SET NULL"), nullable=True)
    affected_mission_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("missions.id", ondelete="SET NULL"), nullable=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="MEDIUM")  # LOW / MEDIUM / HIGH / CRITICAL
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    resource = relationship("Resource", back_populates="simulation_events")
    mission = relationship("Mission", back_populates="simulation_events")
