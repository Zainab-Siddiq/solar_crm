from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.quotation_service import calculate_quotation
from app.database import SessionLocal
from app.schemas.quotation_schema import QuotationCreate
from app.services.quotation_service import create_quotation
from app.schemas.quotation_schema import QuotationItemCreate
from app.services.quotation_service import add_quotation_item
from app.services.discount_service import apply_discount

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/quotations")
def create_new_quotation(data: QuotationCreate,
                         db: Session = Depends(get_db)):

    return create_quotation(db, data)

@router.post("/quotations/{quotation_id}/apply-discount")
def apply_discount_api(
    quotation_id: int,
    discount_percent: float,
    user_role: str,
    db: Session = Depends(get_db)
):
    return apply_discount(db, quotation_id, user_role, discount_percent)


@router.post("/quotations/{quotation_id}/items")
def add_item(quotation_id: int,
             data: QuotationItemCreate,
             db: Session = Depends(get_db)):

    return add_quotation_item(db, quotation_id, data)




@router.post("/quotations/{quotation_id}/calculate")
def calculate(quotation_id: int,
              db: Session = Depends(get_db)):

    return calculate_quotation(db, quotation_id)