from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.area_service import create_area
from app.database import SessionLocal
from app.models.area import Area
from app.schemas.area_schema import AreaCreate
router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/area/create")
def add_area(data:AreaCreate,
                 db: Session = Depends(get_db)):

    return create_area(db, data)

@router.get("/areas")
def get_areas(db: Session = Depends(get_db)):

    return db.query(Area).all()