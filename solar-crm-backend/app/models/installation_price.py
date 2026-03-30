from sqlalchemy import Column, Integer, Float, String
from app.database import Base


class InstallationPrice(Base):

    __tablename__ = "installation_prices"

    id = Column(Integer, primary_key=True)

    system_type = Column(String)  # ongrid / hybrid

    min_kw = Column(Integer)
    max_kw = Column(Integer)

    price_per_kw = Column(Float)