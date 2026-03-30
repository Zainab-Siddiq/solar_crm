from pydantic import BaseModel
from datetime import date


class MeetingSlotCreate(BaseModel):

    slot_name: str

    max_bookings: int


class MeetingBookingCreate(BaseModel):

    lead_id: int

    slot_id: int

    meeting_date: date