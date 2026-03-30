from sqlalchemy import Column, Integer, String
from app.database import Base


class MeetingSlot(Base):

    __tablename__ = "meeting_slots"

    id = Column(Integer, primary_key=True, index=True)

    slot_name = Column(String, nullable=False)  
    # example: 10:00-11:00

    max_bookings = Column(Integer, default=3)