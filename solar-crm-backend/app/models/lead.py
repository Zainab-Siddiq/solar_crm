from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship


class Lead(Base):

    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)

    client_name = Column(String, nullable=False)

    contact_number = Column(String(11), index=True)

    lead_source = Column(String)

    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True)

    system_type = Column(String)

    system_size_kw = Column(Integer)

    city = Column(String)

    area_id = Column(Integer, ForeignKey("areas.id"), nullable=True)

    sub_area = Column(String)

    call_status = Column(String)

    meeting_aligned = Column(Boolean, default=False)

    meeting_slot_id = Column(Integer, ForeignKey("meeting_slots.id"), nullable=True)

    meeting_location = Column(String)

    financing_method = Column(String)

    quotation_id = Column(Integer)

    followup_count = Column(Integer, default=0)

    remarks = Column(String)

    telesales_agent = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    meeting_slot = relationship("MeetingSlot")