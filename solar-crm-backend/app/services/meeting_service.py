from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.meeting_booking import MeetingBooking
from app.models.meeting_slot import MeetingSlot


def create_booking(db: Session, data):

    slot = db.query(MeetingSlot).filter(
        MeetingSlot.id == data.slot_id
    ).first()

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Meeting slot not found"
        )

    booking_count = db.query(MeetingBooking).filter(
        MeetingBooking.slot_id == data.slot_id,
        MeetingBooking.meeting_date == data.meeting_date
    ).count()

    if booking_count >= slot.max_bookings:

        raise HTTPException(
            status_code=400,
            detail="Slot already full"
        )

    booking = MeetingBooking(**data.dict())

    db.add(booking)

    db.commit()

    db.refresh(booking)

    return booking