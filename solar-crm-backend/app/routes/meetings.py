from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.schemas.meeting_schema import MeetingBookingCreate
from app.services.meeting_service import create_booking
from app.models.meeting_slot import MeetingSlot
from app.schemas.meeting_schema import MeetingSlotCreate


router = APIRouter()


def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/meetings/book")
def book_meeting(data: MeetingBookingCreate,
                 db: Session = Depends(get_db)):

    return create_booking(db, data)

@router.get("/meeting-slots")
def get_slots(db: Session = Depends(get_db)):

    return db.query(MeetingSlot).all()

@router.post("/meeting-slots")
def create_slot(data: MeetingSlotCreate,
                db: Session = Depends(get_db)):

    slot = MeetingSlot(**data.dict())

    db.add(slot)

    db.commit()

    db.refresh(slot)

    return slot