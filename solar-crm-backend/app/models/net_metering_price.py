from sqlalchemy import Column, Integer, Float, String
from app.database import Base


class NetMeteringPrice(Base):

    __tablename__ = "net_metering_prices"

    id = Column(Integer, primary_key=True)

    system_type = Column(String)

    base_price = Column(Float)

    per_string_price = Column(Float)  # only for hybrid