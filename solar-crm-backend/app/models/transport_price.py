from sqlalchemy import Column, Integer, Float
from app.database import Base


class TransportPrice(Base):

    __tablename__ = "transport_prices"

    id = Column(Integer, primary_key=True)

    min_kw = Column(Integer)
    max_kw = Column(Integer)

    price = Column(Float)