from pydantic import BaseModel
from typing import Optional


class ProductTypeCreate(BaseModel):

    name: str


class ProductCreate(BaseModel):

    product_type_id: int
    brand: str
    model: str
    price: float

    description: Optional[str] = None

    watt: Optional[int] = None
    kw_capacity: Optional[int] = None
    max_pv_kw: Optional[float] = None
    default_strings: Optional[int] = None
    max_combined_strings: Optional[int] = None
    output_type: Optional[str] = None

class InverterUpgradeCreate(BaseModel):

    inverter_id: int

    extra_string_price: float

    dual_output_price: float