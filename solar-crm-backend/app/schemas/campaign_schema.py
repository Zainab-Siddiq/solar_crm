from pydantic import BaseModel

class CampaignCreate(BaseModel):

    campaign_name : str