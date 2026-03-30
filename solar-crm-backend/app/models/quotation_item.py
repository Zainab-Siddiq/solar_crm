from sqlalchemy import Column, Integer, Float, ForeignKey, String
from app.database import Base


class QuotationItem(Base):

    __tablename__ = "quotation_items"

    id = Column(Integer, primary_key=True)

    quotation_id = Column(Integer, ForeignKey("quotations.id"))

    product_id = Column(Integer, ForeignKey("products.id"))

    product_type = Column(String)

    quantity = Column(Integer)

    unit_price = Column(Float)

    total_price = Column(Float)

    discount_amount = Column(Float, default=0)

    final_price = Column(Float, default=0)