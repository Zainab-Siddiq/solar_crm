from sqlalchemy.orm import Session
from app.models.area import Area


def create_area(db: Session, area_data):
    

    new_area = Area(
        city=area_data.city,
        area_name=area_data.area_name
    )

    db.add(new_area)
    db.commit()
    db.refresh(new_area)

    return new_area