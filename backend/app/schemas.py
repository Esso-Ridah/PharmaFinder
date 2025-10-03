from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import datetime, date
from uuid import UUID
from app.models import UserRole, OrderStatus, PaymentMethod, PaymentStatus, DeliveryType, PrescriptionStatus


# Base schemas
class BaseSchema(BaseModel):
    class Config:
        from_attributes = True


# User schemas
class UserBase(BaseSchema):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CLIENT


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseSchema):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


class User(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserInDB(User):
    password_hash: str


# Authentication schemas
class Token(BaseSchema):
    access_token: str
    token_type: str


class TokenData(BaseSchema):
    username: Optional[str] = None


# Pharmacy schemas
class PharmacyBase(BaseSchema):
    name: str
    license_number: str
    address: str
    city: str = "Lomé"
    country: str = "Togo"
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    opening_hours: Optional[Dict[str, str]] = None


class PharmacyCreate(PharmacyBase):
    pass


class PharmacyUpdate(BaseSchema):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    opening_hours: Optional[Dict[str, str]] = None


class Pharmacy(PharmacyBase):
    id: UUID
    owner_id: UUID
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class PharmacyWithDistance(Pharmacy):
    distance_km: Optional[float] = None


# Category schemas
class CategoryBase(BaseSchema):
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[UUID] = None


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: UUID
    is_active: bool
    created_at: datetime


# Product schemas
class ProductBase(BaseSchema):
    name: str
    generic_name: Optional[str] = None
    barcode: Optional[str] = None
    category_id: Optional[UUID] = None
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    dosage: Optional[str] = None
    requires_prescription: bool = False
    active_ingredient: Optional[str] = None
    contraindications: Optional[str] = None
    side_effects: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseSchema):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    dosage: Optional[str] = None
    active_ingredient: Optional[str] = None
    contraindications: Optional[str] = None
    side_effects: Optional[str] = None


class Product(ProductBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    category: Optional[Category] = None


# Inventory schemas
class PharmacyInventoryBase(BaseSchema):
    pharmacy_id: UUID
    product_id: UUID
    quantity: int
    price: Decimal
    expiry_date: Optional[date] = None
    batch_number: Optional[str] = None


class PharmacyInventoryCreate(PharmacyInventoryBase):
    pass


class PharmacyInventoryUpdate(BaseSchema):
    quantity: Optional[int] = None
    price: Optional[Decimal] = None
    expiry_date: Optional[date] = None
    batch_number: Optional[str] = None


class PharmacyInventory(PharmacyInventoryBase):
    id: UUID
    last_updated: datetime
    product: Optional[Product] = None
    pharmacy: Optional[Pharmacy] = None


# Address schemas
class ClientAddressBase(BaseSchema):
    label: str = "Domicile"
    address: str
    city: str = "Lomé"
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    is_default: bool = False

    # Nouveaux champs pour adresse flexible africaine
    address_type: str = "modern"  # 'modern', 'description', 'gps'
    street_address: Optional[str] = None  # Adresse complète moderne
    neighborhood: Optional[str] = None  # Quartier/Zone
    landmark_description: Optional[str] = None  # Description avec points de repère

    # Contact pour livraison
    delivery_phone: Optional[str] = None  # Téléphone spécifique pour livraison
    delivery_instructions: Optional[str] = None  # Instructions pour le livreur


class ClientAddressCreate(ClientAddressBase):
    pass


class ClientAddress(ClientAddressBase):
    id: UUID
    user_id: UUID
    created_at: datetime


# Order schemas
class OrderItemBase(BaseSchema):
    product_id: UUID
    quantity: int


class OrderItemCreate(OrderItemBase):
    pass


class OrderItem(OrderItemBase):
    id: UUID
    order_id: UUID
    unit_price: Decimal
    total_price: Decimal
    created_at: datetime
    product: Optional[Product] = None


class OrderBase(BaseSchema):
    pharmacy_id: UUID
    delivery_address_id: Optional[UUID] = None
    delivery_type: DeliveryType
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]
    prescription_image_url: Optional[str] = None


class OrderUpdate(BaseSchema):
    status: Optional[OrderStatus] = None
    prescription_validated: Optional[bool] = None
    estimated_pickup_time: Optional[datetime] = None
    estimated_delivery_time: Optional[datetime] = None
    notes: Optional[str] = None


class Order(OrderBase):
    id: UUID
    order_number: str
    client_id: UUID
    status: OrderStatus
    total_amount: Decimal
    delivery_fee: Decimal
    pickup_code: Optional[str] = None
    prescription_image_url: Optional[str] = None
    prescription_validated: bool
    estimated_pickup_time: Optional[datetime] = None
    estimated_delivery_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    client: Optional[User] = None
    pharmacy: Optional[Pharmacy] = None
    delivery_address: Optional[ClientAddress] = None
    items: List[OrderItem] = []


# Payment schemas
class PaymentCreate(BaseSchema):
    order_id: UUID
    payment_method: PaymentMethod
    amount: Decimal


class Payment(BaseSchema):
    id: UUID
    order_id: UUID
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    amount: Decimal
    currency: str
    stripe_payment_id: Optional[str] = None
    paypal_payment_id: Optional[str] = None
    transaction_reference: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime


# Search schemas
class ProductSearchQuery(BaseSchema):
    query: Optional[str] = None
    category_id: Optional[UUID] = None
    requires_prescription: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_distance: Optional[float] = None
    pharmacy_id: Optional[UUID] = None
    limit: int = 20
    offset: int = 0


class PharmacySearchQuery(BaseSchema):
    query: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_distance: Optional[float] = None
    is_verified: Optional[bool] = None
    limit: int = 20
    offset: int = 0


# Response schemas
class ProductAvailability(BaseSchema):
    product: Product
    available_pharmacies: List[PharmacyInventory]
    total_pharmacies: int


class SearchResults(BaseSchema):
    results: List[Any]
    total_count: int
    page: int
    per_page: int
    total_pages: int


# Dashboard schemas
class PharmacyDashboard(BaseSchema):
    total_products: int
    total_orders: int
    pending_orders: int
    today_revenue: Decimal
    monthly_revenue: Decimal
    recent_orders: List[Order]


class ClientDashboard(BaseSchema):
    total_orders: int
    pending_orders: int
    recent_orders: List[Order]
    favorite_pharmacies: List[Pharmacy]


# Notification schemas
class NotificationBase(BaseSchema):
    type: str
    title: str
    message: str
    meta_data: Optional[Dict[str, Any]] = None


class NotificationCreate(NotificationBase):
    user_id: UUID


class Notification(NotificationBase):
    id: UUID
    user_id: UUID
    is_read: bool
    created_at: datetime


# Review schemas
class ReviewBase(BaseSchema):
    rating: int
    comment: Optional[str] = None
    is_public: bool = True
    
    @validator('rating')
    def rating_must_be_between_1_and_5(cls, v):
        if not 1 <= v <= 5:
            raise ValueError('Rating must be between 1 and 5')
        return v


class ReviewCreate(ReviewBase):
    order_id: UUID


class Review(ReviewBase):
    id: UUID
    order_id: UUID
    client_id: UUID
    pharmacy_id: UUID
    created_at: datetime
    client: Optional[User] = None


# System config schemas
class SystemConfigUpdate(BaseSchema):
    key: str
    value: Dict[str, Any]
    description: Optional[str] = None


class SystemConfig(BaseSchema):
    id: UUID
    key: str
    value: Dict[str, Any]
    description: Optional[str] = None
    updated_at: datetime


# Prescription schemas
class PrescriptionRequestBase(BaseSchema):
    product_id: UUID
    pharmacy_id: UUID
    quantity_requested: int = 1


class PrescriptionRequestCreate(PrescriptionRequestBase):
    pass


class PrescriptionRequest(PrescriptionRequestBase):
    id: UUID
    user_id: UUID
    prescription_image_url: str
    original_filename: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    status: PrescriptionStatus
    validated_by: Optional[UUID] = None
    validated_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    pharmacist_notes: Optional[str] = None
    expires_at: Optional[datetime] = None
    validation_timeout_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Relationships
    product: Optional[Product] = None
    pharmacy: Optional[Pharmacy] = None


class PrescriptionValidation(BaseSchema):
    prescription_request_id: UUID
    action: str  # 'approve' or 'reject'
    pharmacist_notes: Optional[str] = None
    rejection_reason: Optional[str] = None