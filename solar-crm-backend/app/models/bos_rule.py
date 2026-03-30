from sqlalchemy import Column, Integer, Float
from app.database import Base


class BOSRule(Base):

    __tablename__ = "bos_rules"

    id = Column(Integer, primary_key=True)

    system_kw = Column(Integer)

    default_strings = Column(Integer)

    extra_string_price = Column(Float)