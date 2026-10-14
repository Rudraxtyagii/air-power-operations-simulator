from datetime import datetime
from sqlalchemy import Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Schedule(Base):
    __tablename__ = "schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    mission_id: Mapped[int] = mapped_column(Integer, ForeignKey("missions.id", ondelete="CASCADE"), nullable=False)
    resource_id: Mapped[int] = mapped_column(Integer, ForeignKey("resources.id", ondelete="CASCADE"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    delay_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    optimization_score: Mapped[float] = mapped_column(Float, nullable=False, default=90.0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="SCHEDULED")  # SCHEDULED / ACTIVE / COMPLETED / CANCELLED
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    mission = relationship("Mission", back_populates="schedules")
    resource = relationship("Resource", back_populates="schedules")
