from fastapi import HTTPException
from app.models.followup import Followup
from app.models.lead import Lead
from app.models.meeting_slot import MeetingSlot


def create_followup(db, data):

    lead = db.query(Lead).filter(Lead.id == data.lead_id).first()

    if not lead:
        raise HTTPException(404, "Lead not found")

    # 🔥 MEETING VALIDATION
    if data.meeting_aligned:

        if not data.meeting_slot_id:
            raise HTTPException(400, "Meeting slot required")

        if not data.meeting_date:
            raise HTTPException(400, "Meeting date required")

        slot = db.query(MeetingSlot).filter(
            MeetingSlot.id == data.meeting_slot_id
        ).first()

        if not slot:
            raise HTTPException(400, "Invalid meeting slot")

        # 🔥 COUNT BOOKINGS FOR SAME SLOT + SAME DATE
        existing_count = db.query(Followup).filter(
            Followup.meeting_slot_id == data.meeting_slot_id,
            Followup.meeting_date == data.meeting_date,
            Followup.meeting_aligned == True
        ).count()

        # 🔥 CHECK LIMIT
        if existing_count >= slot.max_bookings:
            raise HTTPException(
                400,
                f"Slot already full ({slot.max_bookings} bookings)"
            )

    # 🔥 CREATE FOLLOWUP
    followup = Followup(
        lead_id=data.lead_id,
        call_status=data.call_status,
        meeting_aligned=data.meeting_aligned,
        meeting_slot_id=data.meeting_slot_id,
        meeting_location=data.meeting_location,
        meeting_date=data.meeting_date
    )

    db.add(followup)

    # 🔥 UPDATE LEAD
    lead.followup_count += 1
    lead.call_status = data.call_status
    lead.meeting_aligned = data.meeting_aligned

    db.commit()
    db.refresh(followup)

    return followup