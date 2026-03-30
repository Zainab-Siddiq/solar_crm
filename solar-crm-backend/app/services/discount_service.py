from fastapi import HTTPException
from app.models.discount_rule import DiscountRule
from app.models.quotation import Quotation
from app.models.quotation_item import QuotationItem


def apply_discount(db, quotation_id, user_role, discount_percent):

    quotation = db.query(Quotation).filter(
        Quotation.id == quotation_id
    ).first()

    if not quotation:
        raise HTTPException(404, "Quotation not found")

    rule = db.query(DiscountRule).filter(
        DiscountRule.role == user_role
    ).first()

    if not rule:
        raise HTTPException(400, "Discount rule not set")

    if discount_percent > rule.max_discount:
        raise HTTPException(
            400,
            f"Max allowed discount is {rule.max_discount}%"
        )

    items = db.query(QuotationItem).filter(
        QuotationItem.quotation_id == quotation_id
    ).all()

    total = quotation.total_amount   # 🔥 correct base

    discount_amount = total * (discount_percent / 100)

    # DISTRIBUTE
    for item in items:

        ratio = item.total_price / sum(i.total_price for i in items)

        item_discount = discount_amount * ratio

        item.discount_amount = item_discount
        item.final_price = item.total_price - item_discount

    quotation.discount_percent = discount_percent
    quotation.discount_amount = discount_amount
    quotation.final_amount = total - discount_amount

    db.commit()

    return {
        "discount_percent": discount_percent,
        "discount_amount": discount_amount,
        "final_total": quotation.final_amount
    }