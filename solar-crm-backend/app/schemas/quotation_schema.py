from typing import Optional
from pydantic import BaseModel


class QuotationItemCreate(BaseModel):

    product_id: int
    quantity: Optional[int] = None

    # 🔥 inverter inputs
    selected_strings: Optional[int] = None
    output_type: Optional[str] = None  # single / dual

class QuotationCreate(BaseModel):

    lead_id: int

    system_type: str

    system_size_kw: int