from sqlalchemy import Column, Integer, String
from app.database import Base


class ProductType(Base):

    __tablename__ = "product_types"

    id = Column(Integer, primary_key=True)

    name = Column(String, nullable=False)

    category = Column(String)  # product or service