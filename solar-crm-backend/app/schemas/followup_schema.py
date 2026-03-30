from pydantic import BaseModel
from datetime import date
from typing import Optional

class FollowupCreate(BaseModel):

    lead_id: int

    call_status: str

    meeting_aligned: bool

    remarks: str

    meeting_slot_id: int

    meeting_location: str

    meeting_date: Optional[date] = None

