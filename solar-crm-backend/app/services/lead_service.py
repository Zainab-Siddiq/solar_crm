from sqlalchemy.orm import Session
from app.models.lead import Lead


def create_lead(db: Session, lead_data):
    

    new_lead = Lead(
        client_name=lead_data.client_name,
        contact_number=lead_data.contact_number,
        lead_source=lead_data.lead_source,
        campaign_id=lead_data.campaign_id,
        system_type=lead_data.system_type,
        system_size_kw=lead_data.system_size_kw,
        city=lead_data.city,
        area_id=lead_data.area_id,
        sub_area=lead_data.sub_area,
        call_status=lead_data.call_status,
        meeting_aligned=lead_data.meeting_aligned,
        meeting_slot_id=lead_data.meeting_slot_id,
        meeting_location=lead_data.meeting_location,
        financing_method=lead_data.financing_method,
        telesales_agent=lead_data.telesales_agent,
        remarks=lead_data.remarks
    )

    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)

    return new_lead