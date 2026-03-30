from sqlalchemy import Column, Integer, Float, String
from app.database import Base


class DiscountRule(Base):

    __tablename__ = "discount_rules"

    id = Column(Integer, primary_key=True)

    role = Column(String)  # telesales / sales / head

    max_discount = Column(Float)