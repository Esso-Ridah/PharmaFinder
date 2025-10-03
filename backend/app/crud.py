from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, text, Integer
from sqlalchemy.orm import selectinload
from uuid import UUID, uuid4
from datetime import datetime, date
import random
import string
import unicodedata

from app.models import (
    User, Pharmacy, Product, Category, PharmacyInventory, 
    Order, OrderItem, ClientAddress, Payment, Review, 
    Notification, SystemConfig, UserRole, OrderStatus
)
from app.schemas import (
    UserCreate, PharmacyCreate, ProductCreate, PharmacyInventoryCreate,
    OrderCreate, ClientAddressCreate, PaymentCreate, ReviewCreate
)
from app.auth import get_password_hash


def normalize_search_query(query: str) -> str:
    """Normalize search query by removing accents and converting to lowercase"""
    if not query:
        return ""
    # Remove accents and normalize unicode
    normalized = unicodedata.normalize('NFD', query)
    ascii_text = normalized.encode('ascii', 'ignore').decode('ascii')
    return ascii_text.lower().strip()


# User CRUD operations
async def create_user(db: AsyncSession, user: UserCreate) -> User:
    """Create a new user"""
    password_hash = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        password_hash=password_hash,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        role=user.role
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def get_user(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """Get user by ID"""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email"""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


# Pharmacy CRUD operations
async def create_pharmacy(db: AsyncSession, pharmacy: PharmacyCreate, owner_id: UUID) -> Pharmacy:
    """Create a new pharmacy"""
    db_pharmacy = Pharmacy(
        **pharmacy.dict(),
        owner_id=owner_id
    )
    db.add(db_pharmacy)
    await db.commit()
    await db.refresh(db_pharmacy)
    return db_pharmacy


async def get_pharmacy(db: AsyncSession, pharmacy_id: UUID) -> Optional[Pharmacy]:
    """Get pharmacy by ID"""
    try:
        result = await db.execute(
            select(Pharmacy)
            .where(Pharmacy.id == pharmacy_id)
        )
        return result.scalar_one_or_none()
    except Exception as e:
        print(f"Error in get_pharmacy: {str(e)}")
        return None


async def get_pharmacies(db: AsyncSession, skip: int = 0, limit: int = 100, verified_only: bool = False) -> List[Pharmacy]:
    """Get list of pharmacies"""
    query = select(Pharmacy).options(selectinload(Pharmacy.owner))
    if verified_only:
        query = query.where(Pharmacy.is_verified == True)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def search_pharmacies_by_location(
    db: AsyncSession, 
    latitude: float, 
    longitude: float, 
    max_distance: float = 10.0,
    limit: int = 20
) -> List[Pharmacy]:
    """Search pharmacies by geographic location using Haversine formula"""
    # Haversine formula in SQL
    distance_query = text(f"""
        SELECT *, (
            6371 * acos(
                cos(radians({latitude})) * 
                cos(radians(latitude)) * 
                cos(radians(longitude) - radians({longitude})) + 
                sin(radians({latitude})) * 
                sin(radians(latitude))
            )
        ) AS distance
        FROM pharmacies 
        WHERE is_active = true AND is_verified = true
        AND latitude IS NOT NULL AND longitude IS NOT NULL
        HAVING distance < {max_distance}
        ORDER BY distance
        LIMIT {limit}
    """)
    
    result = await db.execute(distance_query)
    return result.fetchall()


# Product CRUD operations
async def create_product(db: AsyncSession, product: ProductCreate) -> Product:
    """Create a new product"""
    db_product = Product(**product.dict())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


async def get_product(db: AsyncSession, product_id: UUID) -> Optional[Product]:
    """Get product by ID"""
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.id == product_id)
    )
    return result.scalar_one_or_none()


async def search_products(
    db: AsyncSession,
    query: Optional[str] = None,
    category_id: Optional[UUID] = None,
    requires_prescription: Optional[bool] = None,
    skip: int = 0,
    limit: int = 20
) -> List[Product]:
    """Search products with filters and sponsored priority"""
    from sqlalchemy.orm import joinedload
    from sqlalchemy.sql import func, case

    # Join with PharmacyInventory to get sponsored info
    db_query = (
        select(Product)
        .options(selectinload(Product.category))
        .outerjoin(PharmacyInventory, Product.id == PharmacyInventory.product_id)
        .where(Product.is_active == True)
    )

    if query:
        # Normalize the search query to handle accents
        normalized_query = normalize_search_query(query)
        search_filter = or_(
            # Original query search (exact match including accents)
            Product.name.ilike(f"%{query}%"),
            Product.generic_name.ilike(f"%{query}%"),
            Product.active_ingredient.ilike(f"%{query}%"),
            # Normalized query search (accent-insensitive)
            func.lower(func.replace(func.replace(func.replace(
                Product.name, 'é', 'e'), 'è', 'e'), 'à', 'a')).like(f"%{normalized_query}%"),
            func.lower(func.replace(func.replace(func.replace(
                Product.generic_name, 'é', 'e'), 'è', 'e'), 'à', 'a')).like(f"%{normalized_query}%"),
            func.lower(func.replace(func.replace(func.replace(
                Product.active_ingredient, 'é', 'e'), 'è', 'e'), 'à', 'a')).like(f"%{normalized_query}%")
        )
        db_query = db_query.where(search_filter)
    
    if category_id:
        db_query = db_query.where(Product.category_id == category_id)
    
    if requires_prescription is not None:
        db_query = db_query.where(Product.requires_prescription == requires_prescription)
    
    # Group by product to avoid duplicates and order by sponsoring status
    db_query = (
        db_query
        .group_by(Product.id)
        .order_by(
            # Sponsored products first, ordered by sponsor_rank descending
            func.max(
                case(
                    (PharmacyInventory.is_sponsored == True, PharmacyInventory.sponsor_rank),
                    else_=0
                )
            ).desc(),
            # Then by creation date (newest first)
            Product.created_at.desc()
        )
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(db_query)
    return result.scalars().all()


async def search_products_with_pharmacy_info(
    db: AsyncSession,
    query: Optional[str] = None,
    category_id: Optional[UUID] = None,
    requires_prescription: Optional[bool] = None,
    skip: int = 0,
    limit: int = 20
) -> List[dict]:
    """Search products with pharmacy and sponsoring information"""
    from sqlalchemy.orm import joinedload
    from sqlalchemy.sql import func
    
    # Select products with their best pharmacy offers (lowest price, highest sponsoring)
    # Also get the pharmacy info for sponsored products
    subquery = (
        select(
            PharmacyInventory.product_id,
            func.min(PharmacyInventory.price).label('min_price'),
            func.max(PharmacyInventory.sponsor_rank).label('max_sponsor_rank'),
            func.max(PharmacyInventory.is_sponsored.cast(Integer)).label('has_sponsored')
        )
        .where(PharmacyInventory.quantity > 0)
        .group_by(PharmacyInventory.product_id)
        .subquery()
    )

    # Get the pharmacy for sponsored products
    sponsored_pharmacy_subquery = (
        select(
            PharmacyInventory.product_id,
            PharmacyInventory.pharmacy_id,
            Pharmacy.name.label('pharmacy_name')
        )
        .join(Pharmacy, PharmacyInventory.pharmacy_id == Pharmacy.id)
        .where(
            and_(
                PharmacyInventory.quantity > 0,
                PharmacyInventory.is_sponsored == True
            )
        )
        .order_by(PharmacyInventory.sponsor_rank.desc())
        .subquery()
    )
    
    db_query = (
        select(
            Product,
            subquery.c.min_price,
            subquery.c.max_sponsor_rank,
            subquery.c.has_sponsored,
            sponsored_pharmacy_subquery.c.pharmacy_id,
            sponsored_pharmacy_subquery.c.pharmacy_name
        )
        .options(selectinload(Product.category))
        .outerjoin(subquery, Product.id == subquery.c.product_id)
        .outerjoin(sponsored_pharmacy_subquery, Product.id == sponsored_pharmacy_subquery.c.product_id)
        .where(Product.is_active == True)
    )
    
    if query:
        # Normalize the search query to handle accents
        normalized_query = normalize_search_query(query)
        search_filter = or_(
            # Original query search (exact match including accents)
            Product.name.ilike(f"%{query}%"),
            Product.generic_name.ilike(f"%{query}%"),
            Product.active_ingredient.ilike(f"%{query}%"),
            # Normalized query search (accent-insensitive)
            func.lower(func.replace(func.replace(func.replace(
                Product.name, 'é', 'e'), 'è', 'e'), 'à', 'a')).like(f"%{normalized_query}%"),
            func.lower(func.replace(func.replace(func.replace(
                Product.generic_name, 'é', 'e'), 'è', 'e'), 'à', 'a')).like(f"%{normalized_query}%"),
            func.lower(func.replace(func.replace(func.replace(
                Product.active_ingredient, 'é', 'e'), 'è', 'e'), 'à', 'a')).like(f"%{normalized_query}%")
        )
        db_query = db_query.where(search_filter)

    if category_id:
        db_query = db_query.where(Product.category_id == category_id)

    if requires_prescription is not None:
        db_query = db_query.where(Product.requires_prescription == requires_prescription)
    
    # Order by sponsored status first, then by price
    db_query = (
        db_query
        .order_by(
            subquery.c.has_sponsored.desc().nullslast(),
            subquery.c.max_sponsor_rank.desc().nullslast(),
            subquery.c.min_price.asc().nullslast(),
            Product.created_at.desc()
        )
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(db_query)
    rows = result.all()
    
    # Format results with sponsoring info
    products_with_info = []
    for row in rows:
        product, min_price, max_sponsor_rank, has_sponsored, pharmacy_id, pharmacy_name = row
        product_dict = {
            "id": str(product.id),
            "name": product.name,
            "generic_name": product.generic_name,
            "manufacturer": product.manufacturer,
            "dosage": product.dosage,
            "requires_prescription": product.requires_prescription,
            "active_ingredient": product.active_ingredient,
            "contraindications": product.contraindications,
            "side_effects": product.side_effects,
            "category": {
                "id": str(product.category.id),
                "name": product.category.name,
                "slug": product.category.slug
            } if product.category else None,
            "min_price": float(min_price) if min_price else None,
            "is_sponsored": bool(has_sponsored) if has_sponsored else False,
            "sponsor_rank": int(max_sponsor_rank) if max_sponsor_rank else 0,
            "sponsored_pharmacy": {
                "id": str(pharmacy_id),
                "name": pharmacy_name
            } if pharmacy_id and pharmacy_name else None,
            "created_at": product.created_at.isoformat() if product.created_at else None
        }
        products_with_info.append(product_dict)
    
    return products_with_info


# Inventory CRUD operations
async def create_inventory(db: AsyncSession, inventory: PharmacyInventoryCreate) -> PharmacyInventory:
    """Create or update inventory item"""
    # Check if inventory item already exists
    result = await db.execute(
        select(PharmacyInventory).where(
            and_(
                PharmacyInventory.pharmacy_id == inventory.pharmacy_id,
                PharmacyInventory.product_id == inventory.product_id
            )
        )
    )
    existing_inventory = result.scalar_one_or_none()
    
    if existing_inventory:
        # Update existing inventory
        existing_inventory.quantity = inventory.quantity
        existing_inventory.price = inventory.price
        existing_inventory.expiry_date = inventory.expiry_date
        existing_inventory.batch_number = inventory.batch_number
        existing_inventory.last_updated = datetime.utcnow()
        await db.commit()
        await db.refresh(existing_inventory)
        return existing_inventory
    else:
        # Create new inventory item
        db_inventory = PharmacyInventory(**inventory.dict())
        db.add(db_inventory)
        await db.commit()
        await db.refresh(db_inventory)
        return db_inventory


async def get_product_availability(
    db: AsyncSession,
    product_id: UUID,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    max_distance: Optional[float] = None
) -> List[PharmacyInventory]:
    """Get product availability across pharmacies"""
    query = (
        select(PharmacyInventory)
        .options(
            selectinload(PharmacyInventory.pharmacy),
            selectinload(PharmacyInventory.product)
        )
        .join(Pharmacy)
        .where(
            and_(
                PharmacyInventory.product_id == product_id,
                PharmacyInventory.quantity > 0,
                Pharmacy.is_active == True,
                Pharmacy.is_verified == True
            )
        )
    )
    
    result = await db.execute(query)
    return result.scalars().all()


# Order CRUD operations
def generate_order_number() -> str:
    """Generate unique order number"""
    today = datetime.now().strftime('%Y%m%d')
    random_part = ''.join(random.choices(string.digits, k=3))
    return f"PF{today}{random_part}"


def generate_pickup_code() -> str:
    """Generate 6-digit pickup code"""
    return ''.join(random.choices(string.digits, k=6))


async def create_order(db: AsyncSession, order: OrderCreate, client_id: UUID) -> Order:
    """Create a new order"""
    # Calculate total amount
    total_amount = 0
    order_items = []
    
    for item in order.items:
        # Get product and current price from inventory
        inventory_result = await db.execute(
            select(PharmacyInventory)
            .where(
                and_(
                    PharmacyInventory.pharmacy_id == order.pharmacy_id,
                    PharmacyInventory.product_id == item.product_id,
                    PharmacyInventory.quantity >= item.quantity
                )
            )
        )
        inventory = inventory_result.scalar_one_or_none()
        
        if not inventory:
            raise ValueError(f"Product not available in sufficient quantity")
        
        item_total = inventory.price * item.quantity
        total_amount += item_total
        
        order_items.append(OrderItem(
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=inventory.price,
            total_price=item_total
        ))
    
    # Create order
    pickup_code = generate_pickup_code() if order.delivery_type == "pickup" else None
    
    db_order = Order(
        order_number=generate_order_number(),
        client_id=client_id,
        pharmacy_id=order.pharmacy_id,
        delivery_address_id=order.delivery_address_id,
        delivery_type=order.delivery_type,
        total_amount=total_amount,
        pickup_code=pickup_code,
        prescription_image_url=order.prescription_image_url,
        notes=order.notes
    )
    
    db.add(db_order)
    await db.flush()  # Get order ID
    
    # Add order items
    for item in order_items:
        item.order_id = db_order.id
        db.add(item)
    
    await db.commit()
    await db.refresh(db_order)
    return db_order


async def get_order(db: AsyncSession, order_id: UUID) -> Optional[Order]:
    """Get order by ID"""
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.client),
            selectinload(Order.pharmacy),
            selectinload(Order.delivery_address),
            selectinload(Order.items).selectinload(OrderItem.product)
        )
        .where(Order.id == order_id)
    )
    return result.scalar_one_or_none()


async def get_user_orders(db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 20) -> List[Order]:
    """Get orders for a specific user"""
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.pharmacy),
            selectinload(Order.items).selectinload(OrderItem.product)
        )
        .where(Order.client_id == user_id)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_pharmacy_orders(db: AsyncSession, pharmacy_id: UUID, status: Optional[OrderStatus] = None, skip: int = 0, limit: int = 20) -> List[Order]:
    """Get orders for a specific pharmacy"""
    query = (
        select(Order)
        .options(
            selectinload(Order.client),
            selectinload(Order.delivery_address),
            selectinload(Order.items).selectinload(OrderItem.product)
        )
        .where(Order.pharmacy_id == pharmacy_id)
    )
    
    if status:
        query = query.where(Order.status == status)
    
    query = query.order_by(Order.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def update_order_status(db: AsyncSession, order_id: UUID, status: OrderStatus) -> Optional[Order]:
    """Update order status"""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    
    if order:
        order.status = status
        order.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(order)
    
    return order


# Address CRUD operations
async def create_client_address(db: AsyncSession, address: ClientAddressCreate, user_id: UUID) -> ClientAddress:
    """Create a new client address"""
    # If this is set as default, unset other defaults
    if address.is_default:
        await db.execute(
            select(ClientAddress)
            .where(
                and_(
                    ClientAddress.user_id == user_id,
                    ClientAddress.is_default == True
                )
            )
        )
        # Update existing defaults
        result = await db.execute(
            select(ClientAddress).where(
                and_(
                    ClientAddress.user_id == user_id,
                    ClientAddress.is_default == True
                )
            )
        )
        existing_defaults = result.scalars().all()
        for addr in existing_defaults:
            addr.is_default = False
    
    db_address = ClientAddress(**address.dict(), user_id=user_id)
    db.add(db_address)
    await db.commit()
    await db.refresh(db_address)
    return db_address


async def get_user_addresses(db: AsyncSession, user_id: UUID) -> List[ClientAddress]:
    """Get all addresses for a user"""
    result = await db.execute(
        select(ClientAddress)
        .where(ClientAddress.user_id == user_id)
        .order_by(ClientAddress.is_default.desc(), ClientAddress.created_at.desc())
    )
    return result.scalars().all()


# Category CRUD operations
async def get_categories(db: AsyncSession) -> List[Category]:
    """Get all active categories"""
    result = await db.execute(
        select(Category)
        .where(Category.is_active == True)
        .order_by(Category.name)
    )
    return result.scalars().all()


# System config operations
async def get_system_config(db: AsyncSession, key: str) -> Optional[SystemConfig]:
    """Get system configuration by key"""
    result = await db.execute(select(SystemConfig).where(SystemConfig.key == key))
    return result.scalar_one_or_none()


async def update_system_config(db: AsyncSession, key: str, value: dict, description: Optional[str] = None) -> SystemConfig:
    """Update or create system configuration"""
    result = await db.execute(select(SystemConfig).where(SystemConfig.key == key))
    config = result.scalar_one_or_none()
    
    if config:
        config.value = value
        config.description = description
        config.updated_at = datetime.utcnow()
    else:
        config = SystemConfig(key=key, value=value, description=description)
        db.add(config)
    
    await db.commit()
    await db.refresh(config)
    return config