from sqlalchemy import Column, Integer, String
from app.database import Base

class Campaign(Base):

    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)

    campaign_name = Column(String, nullable=False)