from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Boolean

class Followup(Base):

    __tablename__ = "followups"

    id = Column(Integer, primary_key=True)

    lead_id = Column(Integer, ForeignKey("leads.id"))

    call_status = Column(String)

    meeting_aligned = Column(Boolean, default=False)

    meeting_slot_id = Column(Integer, ForeignKey("meeting_slots.id"), nullable=True)

    meeting_location = Column(String, nullable=True)

    meeting_date = Column(Date, nullable=True)   # ✅ NEW FIELD

    remarks = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    meeting_slot = relationship("MeetingSlot")