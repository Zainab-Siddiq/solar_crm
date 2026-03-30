from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base


class Product(Base):

    __tablename__ = "products"

    id = Column(Integer, primary_key=True)

    product_type_id = Column(Integer, ForeignKey("product_types.id"))

    brand = Column(String)

    model = Column(String)

    watt = Column(Integer, nullable=True)

    price = Column(Float)

    description = Column(String)

    # inverter specific fields
    kw_capacity = Column(Integer, nullable=True)

    max_pv_kw = Column(Float, nullable=True)

    default_strings = Column(Integer, nullable=True)

    max_combined_strings = Column(Integer, nullable=True)

    output_type = Column(String, nullable=True)  # single or dual