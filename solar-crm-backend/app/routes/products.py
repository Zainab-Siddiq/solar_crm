from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from sqlalchemy import or_, String
from app.schemas.product_schema import ProductCreate, ProductTypeCreate

from app.services.product_service import create_product, create_product_type

from app.models.product import Product
from app.models.product_type import ProductType
from app.schemas.product_schema import InverterUpgradeCreate
from app.services.product_service import create_inverter_upgrade
from app.models.inverter_upgrade import InverterUpgrade


router = APIRouter()


def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

@router.post("/product-types")
def add_product_type(data: ProductTypeCreate,
                     db: Session = Depends(get_db)):

    return create_product_type(db, data)

@router.get("/product-types")
def get_product_types(db: Session = Depends(get_db)):

    return db.query(ProductType).all()


@router.post("/products")
def add_product(data: ProductCreate,
                db: Session = Depends(get_db)):

    return create_product(db, data)


@router.get("/products")
def get_products(db: Session = Depends(get_db)):

    return db.query(Product).all()


@router.get("/products/search")
def search_products(q: str,
                    db: Session = Depends(get_db)):

    return db.query(Product).filter(
        or_(
            Product.brand.ilike(f"%{q}%"),
            Product.model.ilike(f"%{q}%"),
            Product.watt.cast(String).ilike(f"%{q}%")
        )
    ).all()

@router.post("/inverter-upgrades")
def add_inverter_upgrade(data: InverterUpgradeCreate,
                         db: Session = Depends(get_db)):

    return create_inverter_upgrade(db, data)