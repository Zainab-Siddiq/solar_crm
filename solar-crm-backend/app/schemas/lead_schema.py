from pydantic import BaseModel, Field
from typing import Optional

class LeadCreate(BaseModel):

    client_name: str

    contact_number: str = Field(..., min_length=11, max_length=11)

    lead_source: str

    campaign_id: Optional[int]

    system_type: str

    system_size_kw: int

    city: str

    area_id: Optional[int]

    sub_area: Optional[str]

    call_status: str

    meeting_aligned: bool

    meeting_slot_id: Optional[int]

    meeting_location: Optional[str]

    financing_method: str

    telesales_agent: str

    remarks: Optional[str]