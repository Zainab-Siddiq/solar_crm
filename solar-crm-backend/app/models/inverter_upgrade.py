from sqlalchemy import Column, Integer, Float, ForeignKey
from app.database import Base


class InverterUpgrade(Base):

    __tablename__ = "inverter_upgrades"

    id = Column(Integer, primary_key=True)

    inverter_id = Column(Integer, ForeignKey("products.id"))

    extra_string_price = Column(Float)

    dual_output_price = Column(Float)