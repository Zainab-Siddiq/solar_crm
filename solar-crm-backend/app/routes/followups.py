from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, Query
from app.database import SessionLocal
from app.models.followup import Followup
from app.schemas.followup_schema import FollowupCreate
from app.services.followup_service import create_followup
from fastapi import HTTPException
from datetime import date
from app.models.meeting_slot import MeetingSlot
router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create followup
@router.post("/followups")
def add_followup(data: FollowupCreate, db: Session = Depends(get_db)):
    return create_followup(db, data)


@router.get("/followups/{lead_id}")
def get_followups(lead_id: int, db: Session = Depends(get_db)):
    return db.query(Followup).filter(
        Followup.lead_id == lead_id
    ).order_by(Followup.id.desc()).all()

@router.get("/meeting-slots/available")
def get_available_slots(date: date = Query(...), db: Session = Depends(get_db)):
    
    print("RAW DATE:", date, type(date))
    
    slots = db.query(MeetingSlot).all()

    available_slots = []

    for slot in slots:

        count = db.query(Followup).filter(
            Followup.meeting_slot_id == slot.id,
            Followup.meeting_date == date,
            Followup.meeting_aligned == True
        ).count()

        remaining = slot.max_bookings - count

        if remaining > 0:
            available_slots.append({
                "id": slot.id,
                "slot_name": slot.slot_name,
                "remaining": remaining
            })
    print("Slot:", slot.id, "Count:", count, "Max:", slot.max_bookings)
    return available_slots