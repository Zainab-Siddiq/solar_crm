from app.models.quotation import Quotation
from app.models.product import Product
from app.models.quotation_item import QuotationItem
import math
from app.models.product_type import ProductType
from app.models.inverter_upgrade import InverterUpgrade
from fastapi import HTTPException

def calculate_transport(db, quotation):

    rule = db.query(TransportPrice).filter(
        TransportPrice.min_kw <= quotation.system_size_kw,
        TransportPrice.max_kw >= quotation.system_size_kw
    ).first()

    if not rule:
        return 0

    total = rule.price * 1.14 * 1.15  # margin + service GST

    return total

def calculate_installation(db, quotation):

    rule = db.query(InstallationPrice).filter(
        InstallationPrice.system_type == quotation.system_type,
        InstallationPrice.min_kw <= quotation.system_size_kw,
        InstallationPrice.max_kw >= quotation.system_size_kw
    ).first()

    if not rule:
        return 0

    base = quotation.system_size_kw * rule.price_per_kw

    total = base * 1.14 * 1.15

    return total

def calculate_net_metering(db, quotation, inverter_strings):

    rule = db.query(NetMeteringPrice).filter(
        NetMeteringPrice.system_type == quotation.system_type
    ).first()

    if not rule:
        return 0

    total = rule.base_price

    # hybrid logic
    if quotation.system_type == "hybrid":
        total += inverter_strings * rule.per_string_price

    total = total * 1.14 * 1.15

    return total

def calculate_structure(db, quotation, category, height_type):

    rule = db.query(StructurePrice).filter(
        StructurePrice.category == category,
        StructurePrice.height_type == height_type,
        StructurePrice.min_kw <= quotation.system_size_kw,
        StructurePrice.max_kw >= quotation.system_size_kw
    ).first()

    if not rule:
        raise Exception("Structure pricing not found")

    base = quotation.system_size_kw * rule.price_per_kw

    # margin + service GST
    total = base * 1.14 * 1.15

    return total

def calculate_bos(db, quotation, inverter_strings):

    rule = db.query(BOSRule).filter(
        BOSRule.system_kw == quotation.system_size_kw
    ).first()

    if not rule:
        raise Exception("BOS rule not found")

    extra_strings = max(0, inverter_strings - rule.default_strings)

    total = extra_strings * rule.extra_string_price

    # margin + service GST
    total *= 1.14 * 1.15

    return total
def add_quotation_item(db, quotation_id, data):

    product = db.query(Product).filter(
        Product.id == data.product_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    quotation = db.query(Quotation).filter(
        Quotation.id == quotation_id
    ).first()

    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")

    product_type = db.query(ProductType).filter(
        ProductType.id == product.product_type_id
    ).first()

    quantity = data.quantity or 1
    base_price = product.price

    # 🔥 PANEL LOGIC
    if product_type.name.lower() == "solar_panel":

        system_watt = quotation.system_size_kw * 1000
        quantity = math.ceil(system_watt / product.watt)

    # 🔥 INVERTER LOGIC
    if product.kw_capacity:

        selected_strings = data.selected_strings or product.default_strings
        selected_output = (data.output_type or product.output_type).lower()

        # VALIDATIONS
        if selected_strings > product.max_combined_strings:
            raise HTTPException(400, "Strings exceed inverter capacity")

        if quotation.system_size_kw > product.max_pv_kw:
            raise HTTPException(400, "System exceeds inverter PV limit")

        upgrade = db.query(InverterUpgrade).filter(
            InverterUpgrade.inverter_id == product.id
        ).first()

        if not upgrade:
            raise HTTPException(400, "Upgrade pricing not set")

        extra_cost = 0

        # EXTRA STRINGS
        if selected_strings > product.default_strings:
            extra = selected_strings - product.default_strings
            extra_cost += extra * upgrade.extra_string_price

        # OUTPUT UPGRADE
        if product.output_type.lower() == "single" and selected_output == "dual":
            extra_cost += upgrade.dual_output_price

        base_price += extra_cost

    total_price = quantity * base_price

    item = QuotationItem(
        quotation_id=quotation_id,
        product_id=product.id,
        product_type=product_type.name,
        quantity=quantity,
        unit_price=base_price,
        total_price=total_price,
        final_price=total_price
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item

def calculate_quotation(db, quotation_id):

    quotation = db.query(Quotation).filter(
        Quotation.id == quotation_id
    ).first()

    if not quotation:
        raise Exception("Quotation not found")

    items = db.query(QuotationItem).filter(
        QuotationItem.quotation_id == quotation_id
    ).all()

    if not items:
        raise Exception("No items in quotation")

    product_total = 0
    service_total = 0

    inverter_strings = 0  # 🔥 will use for BOS

    for item in items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        product_type = db.query(ProductType).filter(
            ProductType.id == product.product_type_id
        ).first()

        # 🔥 FIXED CATEGORY CHECK
        if product_type.category and product_type.category.lower() == "product":
            product_total += item.total_price
        else:
            service_total += item.total_price

        # 🔥 CAPTURE INVERTER STRINGS
        if product.kw_capacity:
            inverter_strings = product.default_strings  # later improve

    # =====================================
    # 🔥 ADD STRUCTURE COST
    # =====================================

    structure_cost = calculate_structure(
        db,
        quotation,
        category="standard",   # later from request
        height_type="low"
    )

    service_total += structure_cost

    # =====================================
    # 🔥 ADD BOS COST
    # =====================================

    bos_cost = calculate_bos(
        db,
        quotation,
        inverter_strings=inverter_strings
    )

    service_total += bos_cost

    # =====================================
    # TRANSPORT
    # =====================================

    transport_cost = calculate_transport(db, quotation)
    service_total += transport_cost

    # =====================================
    # INSTALLATION
    # =====================================

    installation_cost = calculate_installation(db, quotation)
    service_total += installation_cost

    #=====================================
    # NET METERING
    # =====================================

    net_metering_cost = calculate_net_metering(
    db,
    quotation,
    inverter_strings=inverter_strings
)

    service_total += net_metering_cost
    # =====================================
    # APPLY MARGIN
    # =====================================

    product_total_with_margin = product_total * 1.14
    service_total_with_margin = service_total * 1.14

    # =====================================
    # GST
    # =====================================

    product_gst = product_total_with_margin * 0.18
    service_gst = service_total_with_margin * 0.15

    final_total = (
        product_total_with_margin +
        service_total_with_margin +
        product_gst +
        service_gst
    )

    # SAVE
    quotation.total_amount = final_total   # 🔥 store full calculated total
    quotation.final_amount = final_total

    db.commit()

    return {
    "product_total": product_total,
    "service_total": service_total,
    "structure_cost": structure_cost,
    "bos_cost": bos_cost,
    "transport_cost": transport_cost,
    "installation_cost": installation_cost,
    "net_metering_cost": net_metering_cost,
    "product_gst": product_gst,
    "service_gst": service_gst,
    "final_total": final_total
}

def generate_quotation_number(db):

    count = db.query(Quotation).count() + 1

    return f"ZS-2026-{str(count).zfill(3)}"


def create_quotation(db, data):

    quotation_number = generate_quotation_number(db)

    quotation = Quotation(
        quotation_number=quotation_number,
        lead_id=data.lead_id,
        system_type=data.system_type,
        system_size_kw=data.system_size_kw
    )

    db.add(quotation)

    db.commit()

    db.refresh(quotation)

    return quotation