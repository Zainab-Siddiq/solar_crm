from fastapi import FastAPI
from app.database import Base, engine
from app.routes import quotations
from app.models.lead import Lead
from app.models.campaign import Campaign
from app.models.area import Area
from app.models.product import Product
from app.models.product_type import ProductType
from app.models.followup import Followup
from app.models.meeting_booking import MeetingBooking
from app.models.meeting_slot import MeetingSlot
from app.models import inverter_upgrade
from app.models import quotation
from app.models import quotation_item
from app.routes import leads
from app.routes import followups
from app.routes import meetings
from app.routes import products
from app.routes import areas
from app.routes import campaigns
from app.models import structure_price
from app.models import bos_rule
from app.models import transport_price
from app.models import installation_price
from app.models import net_metering_price
from app.models import discount_rule
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads.router)
app.include_router(followups.router)
app.include_router(areas.router)
app.include_router(campaigns.router)
app.include_router(meetings.router)

ENABLE_PHASE_2 = False

if ENABLE_PHASE_2:
    app.include_router(quotations.router)
    app.include_router(products.router)
    