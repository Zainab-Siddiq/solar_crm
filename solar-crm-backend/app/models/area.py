from sqlalchemy import Column, Integer, String
from app.database import Base


class Area(Base):

    __tablename__ = "areas"

    id = Column(Integer, primary_key=True, index=True)

    city = Column(String, nullable=False)

    area_name = Column(String, nullable=False)