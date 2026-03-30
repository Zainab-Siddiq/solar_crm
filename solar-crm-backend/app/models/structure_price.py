from sqlalchemy import Column, Integer, Float, String
from app.database import Base


class StructurePrice(Base):

    __tablename__ = "structure_prices"

    id = Column(Integer, primary_key=True)

    category = Column(String)  # standard / elevated

    min_kw = Column(Integer)
    max_kw = Column(Integer)

    height_type = Column(String)  # low / high

    price_per_kw = Column(Float)