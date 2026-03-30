from sqlalchemy.orm import Session
from app.models.campaign import Campaign


def create_campaign(db: Session, campaign_data):
    

    new_campaign = Campaign(
        campaign_name=campaign_data.campaign_name
    )

    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)

    return new_campaign