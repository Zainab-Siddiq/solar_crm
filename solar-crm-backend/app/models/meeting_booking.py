from sqlalchemy import Column, Integer, ForeignKey, Date
from app.database import Base


class MeetingBooking(Base):

    __tablename__ = "meeting_bookings"

    id = Column(Integer, primary_key=True)

    lead_id = Column(Integer, ForeignKey("leads.id"))

    slot_id = Column(Integer, ForeignKey("meeting_slots.id"))

    meeting_date = Column(Date)