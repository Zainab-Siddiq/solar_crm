from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.campaign_service import create_campaign
from app.database import SessionLocal
from app.models.campaign import Campaign
from app.schemas.campaign_schema import CampaignCreate
router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/campaign/create")
def add_campaign(data:CampaignCreate,
                 db: Session = Depends(get_db)):

    return create_campaign(db, data)

@router.get("/campaigns")
def get_campaigns(db: Session = Depends(get_db)):

    return db.query(Campaign).all()