from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Enum, Date, JSON, Numeric
# For SQLite compatibility, we'll use String(36) instead of UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

Base = declarative_base()


class UserRole(str, enum.Enum):
    CLIENT = "client"
    PHARMACIST = "pharmacist"
    ADMIN = "admin"
    DELIVERY = "delivery"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    IN_DELIVERY = "in_delivery"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PaymentMethod(str, enum.Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    CASH = "cash"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class DeliveryType(str, enum.Enum):
    PICKUP = "pickup"
    HOME_DELIVERY = "home_delivery"
    DELIVERY = "delivery"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CLIENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    pharmacies = relationship("Pharmacy", back_populates="owner")
    orders = relationship("Order", back_populates="client")
    addresses = relationship("ClientAddress", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    reviews = relationship("Review", back_populates="client")
    cart_items = relationship("CartItem", back_populates="user")


class Pharmacy(Base):
    __tablename__ = "pharmacies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    license_number = Column(String(50), unique=True, nullable=False)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False, default="Lomé")
    country = Column(String(100), nullable=False, default="Togo")
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    phone = Column(String(20))
    email = Column(String(255))
    opening_hours = Column(JSON)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="pharmacies")
    inventory = relationship("PharmacyInventory", back_populates="pharmacy")
    orders = relationship("Order", back_populates="pharmacy")
    reviews = relationship("Review", back_populates="pharmacy")


class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    parent_id = Column(String(36), ForeignKey("categories.id", ondelete="CASCADE"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    products = relationship("Product", back_populates="category")
    parent = relationship("Category", remote_side=[id])


class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False, index=True)
    generic_name = Column(String(200))
    barcode = Column(String(50))
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"))
    description = Column(Text)
    manufacturer = Column(String(200))
    dosage = Column(String(100))
    requires_prescription = Column(Boolean, default=False, index=True)
    active_ingredient = Column(Text)
    contraindications = Column(Text)
    side_effects = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    category = relationship("Category", back_populates="products")
    inventory = relationship("PharmacyInventory", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")


class PharmacyInventory(Base):
    __tablename__ = "pharmacy_inventory"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pharmacy_id = Column(String(36), ForeignKey("pharmacies.id", ondelete="CASCADE"), index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), index=True)
    quantity = Column(Integer, nullable=False, default=0)
    price = Column(Numeric(10, 2), nullable=False)
    expiry_date = Column(Date)
    batch_number = Column(String(50))
    is_sponsored = Column(Boolean, default=False, index=True)
    sponsor_rank = Column(Integer, default=0)
    sponsor_expires_at = Column(DateTime(timezone=True))
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    pharmacy = relationship("Pharmacy", back_populates="inventory")
    product = relationship("Product", back_populates="inventory")


class ClientAddress(Base):
    __tablename__ = "client_addresses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    label = Column(String(50), default="Domicile")

    # Champ d'adresse principal (compatible avec l'ancien système)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False, default="Lomé")
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))

    # Nouveaux champs pour adresse flexible africaine
    address_type = Column(String(20), default="modern")  # 'modern', 'description', 'gps'
    street_address = Column(Text)  # Adresse complète moderne
    neighborhood = Column(String(100))  # Quartier/Zone
    landmark_description = Column(Text)  # Description avec points de repère

    # Contact pour livraison
    delivery_phone = Column(String(20))  # Téléphone spécifique pour livraison
    delivery_instructions = Column(Text)  # Instructions pour le livreur

    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="addresses")
    orders = relationship("Order", back_populates="delivery_address")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(20), unique=True, nullable=False, index=True)
    client_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    pharmacy_id = Column(String(36), ForeignKey("pharmacies.id", ondelete="SET NULL"))
    delivery_address_id = Column(String(36), ForeignKey("client_addresses.id", ondelete="SET NULL"))
    delivery_type = Column(Enum(DeliveryType), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, index=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    delivery_fee = Column(Numeric(10, 2), default=0)
    pickup_code = Column(String(6))
    prescription_image_url = Column(Text)
    prescription_validated = Column(Boolean, default=False)
    notes = Column(Text)
    estimated_pickup_time = Column(DateTime(timezone=True))
    estimated_delivery_time = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    client = relationship("User", back_populates="orders")
    pharmacy = relationship("Pharmacy", back_populates="orders")
    delivery_address = relationship("ClientAddress", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    payments = relationship("Payment", back_populates="order")
    deliveries = relationship("Delivery", back_populates="order")
    reviews = relationship("Review", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"))
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"))
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="XOF")
    stripe_payment_id = Column(String(100))
    paypal_payment_id = Column(String(100))
    transaction_reference = Column(String(100))
    paid_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="payments")


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"))
    delivery_partner = Column(String(100))
    delivery_tracking_id = Column(String(100))
    delivery_person_name = Column(String(100))
    delivery_person_phone = Column(String(20))
    pickup_time = Column(DateTime(timezone=True))
    delivery_time = Column(DateTime(timezone=True))
    delivery_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="deliveries")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"))
    client_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    pharmacy_id = Column(String(36), ForeignKey("pharmacies.id", ondelete="CASCADE"))
    rating = Column(Integer, nullable=False)  # 1-5 stars
    comment = Column(Text)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="reviews")
    client = relationship("User", back_populates="reviews")
    pharmacy = relationship("Pharmacy", back_populates="reviews")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    meta_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")


class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    key = Column(String(100), unique=True, nullable=False)
    value = Column(JSON, nullable=False)
    description = Column(Text)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PrescriptionStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class PrescriptionRequest(Base):
    __tablename__ = "prescription_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    pharmacy_id = Column(String(36), ForeignKey("pharmacies.id", ondelete="CASCADE"), nullable=False)
    prescription_image_url = Column(String(500), nullable=False)
    original_filename = Column(String(255))
    file_size = Column(Integer)
    mime_type = Column(String(100))
    status = Column(Enum(PrescriptionStatus), default=PrescriptionStatus.PENDING)
    quantity_requested = Column(Integer, nullable=False, default=1)

    # Validation fields
    validated_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"))
    validated_at = Column(DateTime(timezone=True))
    rejection_reason = Column(Text)
    pharmacist_notes = Column(Text)

    # Expiry
    expires_at = Column(DateTime(timezone=True))  # Prescription expiry (30 days)
    validation_timeout_at = Column(DateTime(timezone=True))  # Pharmacy validation timeout (15 minutes)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    product = relationship("Product")
    pharmacy = relationship("Pharmacy")
    validator = relationship("User", foreign_keys=[validated_by])


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    pharmacy_id = Column(String(36), ForeignKey("pharmacies.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    # Prescription validation
    prescription_request_id = Column(String(36), ForeignKey("prescription_requests.id", ondelete="SET NULL"))
    requires_prescription_validation = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")
    pharmacy = relationship("Pharmacy")
    prescription_request = relationship("PrescriptionRequest")