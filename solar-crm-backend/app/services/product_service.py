from app.models.product import Product
from app.models.product_type import ProductType
from app.models.inverter_upgrade import InverterUpgrade
def create_product(db, data):

    product = Product(**data.dict())

    db.add(product)

    db.commit()

    db.refresh(product)

    return product

def create_product_type(db, data):

    product_type = ProductType(**data.dict())

    db.add(product_type)

    db.commit()

    db.refresh(product_type)

    return product_type




def create_inverter_upgrade(db, data):

    upgrade = InverterUpgrade(**data.dict())

    db.add(upgrade)

    db.commit()

    db.refresh(upgrade)

    return upgrade