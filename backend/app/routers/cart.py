from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, select, func, delete
from typing import List, Optional
import uuid
from datetime import datetime
import math

from ..database import get_db
from ..models import User, Product, Pharmacy, CartItem, PharmacyInventory
from ..auth import get_current_user
from ..email_service import email_service
from pydantic import BaseModel

router = APIRouter(prefix="/cart", tags=["cart"])

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the distance between two points on Earth using the Haversine formula.
    Returns distance in kilometers.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None

    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))

    # Radius of Earth in kilometers
    R = 6371
    distance = R * c

    return round(distance, 2)

# Pydantic models
class CartItemCreate(BaseModel):
    product_id: str
    pharmacy_id: str
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class DeliveryValidationRequest(BaseModel):
    delivery_type: str  # "pickup" or "home_delivery"

class PharmacyGroupInfo(BaseModel):
    pharmacy_id: str
    pharmacy_name: str
    pharmacy_address: str
    items: list
    total_price: float
    delivery_fee: float

class ProductSuggestion(BaseModel):
    original_product_id: str
    original_product_name: str
    suggested_product_id: str
    suggested_product_name: str
    original_pharmacy_id: str
    target_pharmacy_id: str
    price_difference: float

class DeliveryValidationResponse(BaseModel):
    is_valid: bool
    delivery_type: str
    pharmacy_groups: List[PharmacyGroupInfo]
    total_deliveries: int
    total_delivery_fees: float
    warnings: List[str]
    suggestions: List[ProductSuggestion]
    requires_duplication: bool

    class Config:
        from_attributes = True

class CartItemResponse(BaseModel):
    id: str
    product_id: str
    pharmacy_id: str
    quantity: int
    created_at: datetime
    updated_at: datetime
    product: dict
    pharmacy: dict
    price: float

    class Config:
        from_attributes = True

# Helper function to execute raw SQL
def execute_query(db: Session, query: str, params: tuple = ()):
    from sqlalchemy import text
    result = db.execute(text(query), params)
    return result.fetchall()

def execute_query_one(db: Session, query: str, params: tuple = ()):
    from sqlalchemy import text
    result = db.execute(text(query), params)
    return result.fetchone()

@router.get("/items", response_model=List[CartItemResponse])
async def get_cart_items(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all items in user's cart"""
    try:
        # Get cart items with product and pharmacy details using async ORM
        result = await db.execute(
            select(CartItem).where(CartItem.user_id == current_user.id)
            .order_by(CartItem.created_at.desc())
        )
        cart_items = result.scalars().all()

        response_items = []
        for item in cart_items:
            # Get product details
            product_result = await db.execute(
                select(Product).where(Product.id == item.product_id)
            )
            product = product_result.scalar_one_or_none()

            # Get pharmacy details
            pharmacy_result = await db.execute(
                select(Pharmacy).where(Pharmacy.id == item.pharmacy_id)
            )
            pharmacy = pharmacy_result.scalar_one_or_none()

            # Get price from pharmacy inventory
            inventory_result = await db.execute(
                select(PharmacyInventory).where(
                    and_(
                        PharmacyInventory.product_id == item.product_id,
                        PharmacyInventory.pharmacy_id == item.pharmacy_id
                    )
                )
            )
            inventory = inventory_result.scalar_one_or_none()
            price = float(inventory.price) if inventory else 1000.0  # Default fallback

            response_items.append(CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                pharmacy_id=item.pharmacy_id,
                quantity=item.quantity,
                created_at=item.created_at,
                updated_at=item.updated_at,
                product={
                    "id": product.id if product else item.product_id,
                    "name": product.name if product else "Produit inconnu",
                    "generic_name": product.generic_name if product else None,
                    "dosage": product.dosage if product else None,
                    "manufacturer": product.manufacturer if product else None,
                    "requires_prescription": product.requires_prescription if product else False,
                    "description": product.description if product else None
                },
                pharmacy={
                    "id": pharmacy.id if pharmacy else item.pharmacy_id,
                    "name": pharmacy.name if pharmacy else "Pharmacie inconnue",
                    "city": pharmacy.city if pharmacy else None,
                    "address": pharmacy.address if pharmacy else None,
                    "phone": pharmacy.phone if pharmacy else None
                },
                price=price
            ))

        return response_items

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching cart items: {str(e)}"
        )

@router.post("/items", response_model=dict)
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add item to cart or update quantity if already exists"""
    try:
        # Check if product exists
        product_result = await db.execute(
            select(Product).where(Product.id == item_data.product_id)
        )
        product = product_result.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produit non trouvé"
            )

        # Check if pharmacy exists
        pharmacy_result = await db.execute(
            select(Pharmacy).where(Pharmacy.id == item_data.pharmacy_id)
        )
        pharmacy = pharmacy_result.scalar_one_or_none()
        if not pharmacy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pharmacie non trouvée"
            )

        # Check if item already exists in cart
        existing_result = await db.execute(
            select(CartItem).where(
                and_(
                    CartItem.user_id == current_user.id,
                    CartItem.product_id == item_data.product_id,
                    CartItem.pharmacy_id == item_data.pharmacy_id
                )
            )
        )
        existing_item = existing_result.scalar_one_or_none()

        if existing_item:
            # Update quantity
            existing_item.quantity += item_data.quantity
            existing_item.updated_at = datetime.now()
            await db.commit()
            return {"message": "Quantité mise à jour dans le panier", "item_id": existing_item.id}
        else:
            # Add new item
            new_item = CartItem(
                user_id=current_user.id,
                product_id=item_data.product_id,
                pharmacy_id=item_data.pharmacy_id,
                quantity=item_data.quantity
            )
            db.add(new_item)
            await db.commit()
            await db.refresh(new_item)
            return {"message": "Produit ajouté au panier", "item_id": new_item.id}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding to cart: {str(e)}"
        )

@router.put("/items/{item_id}", response_model=dict)
async def update_cart_item(
    item_id: str,
    item_data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update cart item quantity"""
    try:
        # Check if item exists and belongs to user
        result = await db.execute(
            select(CartItem).where(
                and_(
                    CartItem.id == item_id,
                    CartItem.user_id == current_user.id
                )
            )
        )
        existing_item = result.scalar_one_or_none()

        if not existing_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article du panier non trouvé"
            )

        if item_data.quantity <= 0:
            # Remove item if quantity is 0 or negative
            await db.delete(existing_item)
            await db.commit()
            return {"message": "Article retiré du panier"}
        else:
            # Update quantity
            existing_item.quantity = item_data.quantity
            existing_item.updated_at = datetime.now()
            await db.commit()
            return {"message": "Quantité mise à jour"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating cart item: {str(e)}"
        )

@router.delete("/items/{item_id}", response_model=dict)
async def remove_from_cart(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove item from cart"""
    try:
        # Check if item exists and belongs to user
        result = await db.execute(
            select(CartItem).where(
                and_(
                    CartItem.id == item_id,
                    CartItem.user_id == current_user.id
                )
            )
        )
        existing_item = result.scalar_one_or_none()

        if not existing_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article du panier non trouvé"
            )

        # Delete item
        await db.delete(existing_item)
        await db.commit()

        return {"message": "Article retiré du panier"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing from cart: {str(e)}"
        )

@router.delete("/clear", response_model=dict)
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Clear all items from cart"""
    try:
        # Delete all cart items for the user
        result = await db.execute(
            select(CartItem).where(CartItem.user_id == current_user.id)
        )
        items_to_delete = result.scalars().all()

        for item in items_to_delete:
            await db.delete(item)

        await db.commit()

        return {"message": "Panier vidé"}

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing cart: {str(e)}"
        )

@router.get("/count", response_model=dict)
async def get_cart_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get total number of items in cart"""
    try:
        # Get sum of quantities for all cart items
        from sqlalchemy import select, func

        result = await db.execute(
            select(func.sum(CartItem.quantity)).where(CartItem.user_id == current_user.id)
        )
        total_quantity = result.scalar()

        return {"count": int(total_quantity) if total_quantity else 0}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting cart count: {str(e)}"
        )

@router.post("/validate-delivery", response_model=DeliveryValidationResponse)
async def validate_delivery_constraints(
    request: DeliveryValidationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Validate delivery constraints and provide suggestions"""
    try:
        # Get cart items
        result = await db.execute(
            select(CartItem).where(CartItem.user_id == current_user.id)
            .order_by(CartItem.created_at.desc())
        )
        cart_items = result.scalars().all()

        if not cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )

        # Group items by pharmacy
        pharmacy_groups = {}
        total_cart_price = 0

        for item in cart_items:
            # Get product details
            product_result = await db.execute(
                select(Product).where(Product.id == item.product_id)
            )
            product = product_result.scalar_one_or_none()

            # Get pharmacy details
            pharmacy_result = await db.execute(
                select(Pharmacy).where(Pharmacy.id == item.pharmacy_id)
            )
            pharmacy = pharmacy_result.scalar_one_or_none()

            # Get price from pharmacy inventory
            inventory_result = await db.execute(
                select(PharmacyInventory).where(
                    and_(
                        PharmacyInventory.product_id == item.product_id,
                        PharmacyInventory.pharmacy_id == item.pharmacy_id
                    )
                )
            )
            inventory = inventory_result.scalar_one_or_none()
            price = float(inventory.price) if inventory else 1000.0

            if item.pharmacy_id not in pharmacy_groups:
                pharmacy_groups[item.pharmacy_id] = {
                    'pharmacy_id': item.pharmacy_id,
                    'pharmacy_name': pharmacy.name if pharmacy else 'Pharmacie inconnue',
                    'pharmacy_address': pharmacy.address if pharmacy else '',
                    'pharmacy_city': pharmacy.city if pharmacy else '',
                    'pharmacy_latitude': pharmacy.latitude if pharmacy else None,
                    'pharmacy_longitude': pharmacy.longitude if pharmacy else None,
                    'items': [],
                    'total_price': 0,
                    'delivery_fee': 2000.0 if request.delivery_type == "home_delivery" else 0.0
                }

            item_total = price * item.quantity
            total_cart_price += item_total

            pharmacy_groups[item.pharmacy_id]['items'].append({
                'id': item.id,
                'product_name': product.name if product else 'Produit inconnu',
                'quantity': item.quantity,
                'unit_price': price,
                'total_price': item_total
            })
            pharmacy_groups[item.pharmacy_id]['total_price'] += item_total

        # Convert to list format
        pharmacy_list = list(pharmacy_groups.values())
        total_deliveries = len(pharmacy_list)
        total_delivery_fees = sum(group['delivery_fee'] for group in pharmacy_list)

        # Check distance and city proximity between pharmacies
        distance_warnings = []
        if len(pharmacy_list) > 1:
            # Compare each pair of pharmacies
            for i in range(len(pharmacy_list)):
                for j in range(i + 1, len(pharmacy_list)):
                    pharmacy1 = pharmacy_list[i]
                    pharmacy2 = pharmacy_list[j]

                    # Check if they are in the same city
                    city1 = pharmacy1.get('pharmacy_city', '').lower().strip()
                    city2 = pharmacy2.get('pharmacy_city', '').lower().strip()

                    if city1 and city2 and city1 != city2:
                        distance_warnings.append(f"⚠️ Les pharmacies '{pharmacy1['pharmacy_name']}' ({city1.title()}) et '{pharmacy2['pharmacy_name']}' ({city2.title()}) sont dans des villes différentes.")

                    # Calculate distance if coordinates are available
                    lat1 = pharmacy1.get('pharmacy_latitude')
                    lon1 = pharmacy1.get('pharmacy_longitude')
                    lat2 = pharmacy2.get('pharmacy_latitude')
                    lon2 = pharmacy2.get('pharmacy_longitude')

                    if lat1 and lon1 and lat2 and lon2:
                        distance = calculate_distance(lat1, lon1, lat2, lon2)
                        if distance and distance > 5:  # Alert if more than 5km apart
                            distance_warnings.append(f"📍 Distance entre '{pharmacy1['pharmacy_name']}' et '{pharmacy2['pharmacy_name']}': {distance} km")

        # Validate constraints and generate warnings
        warnings = []
        is_valid = True
        requires_duplication = False

        # Add distance warnings first
        warnings.extend(distance_warnings)

        if request.delivery_type == "pickup":
            if total_deliveries > 1:
                is_valid = True  # We'll allow it with duplication
                requires_duplication = True
                warnings.append(
                    f"Votre panier contient des produits de {total_deliveries} pharmacies différentes. "
                    f"Nous créerons {total_deliveries} commandes séparées (une par pharmacie) "
                    f"pour faciliter le retrait. Vous paierez en une seule fois et recevrez "
                    f"{total_deliveries} codes de retrait différents."
                )
        elif request.delivery_type == "home_delivery":
            if total_deliveries > 1:
                warnings.append(
                    f"Votre commande nécessitera {total_deliveries} livraisons séparées "
                    f"(frais de livraison: {total_delivery_fees:,.0f} FCFA au total)."
                )

        # Generate product suggestions to consolidate into fewer pharmacies
        suggestions = await generate_product_suggestions(db, pharmacy_list, request.delivery_type)

        return DeliveryValidationResponse(
            is_valid=is_valid,
            delivery_type=request.delivery_type,
            pharmacy_groups=pharmacy_list,
            total_deliveries=total_deliveries,
            total_delivery_fees=total_delivery_fees,
            warnings=warnings,
            suggestions=suggestions,
            requires_duplication=requires_duplication
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating delivery: {str(e)}"
        )

async def generate_product_suggestions(db: AsyncSession, pharmacy_groups: List[dict], delivery_type: str) -> List[ProductSuggestion]:
    """Generate suggestions to consolidate products into fewer pharmacies"""
    suggestions = []

    if len(pharmacy_groups) <= 1:
        return suggestions

    try:
        # Find the pharmacy with the most items or highest value
        target_pharmacy = max(pharmacy_groups, key=lambda p: p['total_price'])

        for group in pharmacy_groups:
            if group['pharmacy_id'] == target_pharmacy['pharmacy_id']:
                continue

            for item in group['items']:
                # Look for equivalent products in target pharmacy
                # Search by product name similarity
                product_name = item['product_name']

                # Get products from target pharmacy with similar names
                similar_products_result = await db.execute(
                    select(Product, PharmacyInventory).join(
                        PharmacyInventory, Product.id == PharmacyInventory.product_id
                    ).where(
                        and_(
                            PharmacyInventory.pharmacy_id == target_pharmacy['pharmacy_id'],
                            PharmacyInventory.quantity > 0,
                            Product.name.ilike(f"%{product_name.split()[0]}%")  # Match first word
                        )
                    ).limit(3)
                )
                similar_products = similar_products_result.fetchall()

                for product, inventory in similar_products:
                    price_difference = float(inventory.price) - item['unit_price']

                    # Only suggest if price difference is reasonable (within 50% increase)
                    if price_difference <= item['unit_price'] * 0.5:
                        suggestions.append(ProductSuggestion(
                            original_product_id=item['id'],
                            original_product_name=item['product_name'],
                            suggested_product_id=product.id,
                            suggested_product_name=product.name,
                            original_pharmacy_id=group['pharmacy_id'],
                            target_pharmacy_id=target_pharmacy['pharmacy_id'],
                            price_difference=price_difference
                        ))
                        break  # Only suggest one alternative per product

    except Exception as e:
        print(f"Error generating suggestions: {str(e)}")
        # Return empty suggestions if there's an error
        pass

    return suggestions

class MultiOrderCreate(BaseModel):
    delivery_type: str
    payment_method: str  # "card", "mobile_money", "paypal", "cash"
    address_id: Optional[str] = None  # For home delivery
    notes: Optional[str] = None  # Optional notes for the order

class MultiOrderResponse(BaseModel):
    success: bool
    payment_required: bool
    payment_amount: float
    orders: List[dict]
    message: str

    class Config:
        from_attributes = True

@router.post("/create-multi-order", response_model=MultiOrderResponse)
async def create_multi_order(
    request: MultiOrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create multiple orders from cart (one per pharmacy)"""
    try:
        # Get cart items first
        cart_result = await db.execute(
            select(CartItem).where(CartItem.user_id == current_user.id)
            .order_by(CartItem.created_at.desc())
        )
        cart_items = cart_result.scalars().all()

        if not cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )

        # Group items by pharmacy (same logic as validation)
        pharmacy_groups = {}
        for item in cart_items:
            # Get product and pharmacy details
            product_result = await db.execute(
                select(Product).where(Product.id == item.product_id)
            )
            product = product_result.scalar_one_or_none()

            pharmacy_result = await db.execute(
                select(Pharmacy).where(Pharmacy.id == item.pharmacy_id)
            )
            pharmacy = pharmacy_result.scalar_one_or_none()

            # Get price from inventory
            inventory_result = await db.execute(
                select(PharmacyInventory).where(
                    and_(
                        PharmacyInventory.product_id == item.product_id,
                        PharmacyInventory.pharmacy_id == item.pharmacy_id
                    )
                )
            )
            inventory = inventory_result.scalar_one_or_none()
            price = float(inventory.price) if inventory else 1000.0

            if item.pharmacy_id not in pharmacy_groups:
                pharmacy_groups[item.pharmacy_id] = {
                    'pharmacy': pharmacy,
                    'items': [],
                    'total_amount': 0
                }

            item_total = price * item.quantity
            pharmacy_groups[item.pharmacy_id]['items'].append({
                'product': product,
                'quantity': item.quantity,
                'unit_price': price,
                'total_price': item_total
            })
            pharmacy_groups[item.pharmacy_id]['total_amount'] += item_total

        # Validate home delivery address if needed
        if request.delivery_type == "home_delivery":
            if not request.address_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Address is required for home delivery"
                )

        # Create orders for each pharmacy
        created_orders = []
        total_payment_amount = 0

        for pharmacy_id, group in pharmacy_groups.items():
            # Generate unique order number
            import random
            import string
            order_number = f"ORD{random.randint(100000, 999999)}"

            # Add delivery fee if home delivery
            delivery_fee = 2000.0 if request.delivery_type == "home_delivery" else 0.0
            order_total = group['total_amount'] + delivery_fee

            # Create order record
            new_order = {
                'order_number': order_number,
                'pharmacy_id': pharmacy_id,
                'pharmacy_name': group['pharmacy'].name if group['pharmacy'] else 'Pharmacie inconnue',
                'delivery_type': request.delivery_type,
                'payment_method': request.payment_method,
                'items_count': len(group['items']),
                'subtotal': group['total_amount'],
                'delivery_fee': delivery_fee,
                'total_amount': order_total,
                'pickup_code': f"{random.randint(1000, 9999)}" if request.delivery_type == "pickup" else None,
                'status': 'pending_payment' if request.payment_method != 'cash' else 'pending'
            }

            created_orders.append(new_order)
            total_payment_amount += order_total

        # Clear cart after order creation
        delete_query = delete(CartItem).where(CartItem.user_id == current_user.id)
        await db.execute(delete_query)
        await db.commit()

        # Envoyer les emails de confirmation et reçu
        try:
            user_name = f"{current_user.first_name} {current_user.last_name}".strip()
            if not user_name:
                user_name = current_user.email.split('@')[0]

            # Email de confirmation de commande
            email_service.send_order_confirmation_email(
                user_email=current_user.email,
                user_name=user_name,
                orders=created_orders
            )

            # Email de reçu détaillé
            email_service.send_order_receipt_email(
                user_email=current_user.email,
                user_name=user_name,
                orders=created_orders,
                order_items=[]  # Pour la démo, on passe une liste vide
            )

        except Exception as e:
            # L'erreur d'email ne doit pas empêcher la commande
            print(f"⚠️ Erreur lors de l'envoi des emails: {str(e)}")

        # Determine if payment is required now
        payment_required = request.payment_method in ['card', 'mobile_money', 'paypal']

        return MultiOrderResponse(
            success=True,
            payment_required=payment_required,
            payment_amount=total_payment_amount,
            orders=created_orders,
            message=f"✅ {len(created_orders)} commande{'s' if len(created_orders) > 1 else ''} créée{'s' if len(created_orders) > 1 else ''} avec succès!"
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating multi-order: {str(e)}"
        )