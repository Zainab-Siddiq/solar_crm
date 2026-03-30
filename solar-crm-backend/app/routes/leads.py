from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.lead import Lead
from app.database import SessionLocal
from app.schemas.lead_schema import LeadCreate
from app.services.lead_service import create_lead

router = APIRouter()


def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/leads")
def get_leads(search: str = "", db: Session = Depends(get_db)):

    query = db.query(Lead)

    if search:
        query = query.filter(
            or_(
                Lead.client_name.ilike(f"%{search}%"),
                Lead.contact_number.ilike(f"%{search}%")
            )
        )

    leads = query.order_by(Lead.id.desc()).all()

    return leads

@router.get("/leads/{lead_id}")
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    return db.query(Lead).filter(Lead.id == lead_id).first()

@router.post("/leads")
def create_lead_route(lead: LeadCreate, db: Session = Depends(get_db)):
    return create_lead(db, lead)