from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Quotation(Base):

    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True)

    quotation_number = Column(String, unique=True)

    lead_id = Column(Integer, ForeignKey("leads.id"))

    system_type = Column(String)

    system_size_kw = Column(Integer)

    total_amount = Column(Float, default=0)

    discount_percent = Column(Float, default=0)

    discount_amount = Column(Float, default=0)

    final_amount = Column(Float, default=0)

    status = Column(String, default="draft")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())