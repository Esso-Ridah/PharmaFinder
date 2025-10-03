from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from typing import Dict, Any, List
import calendar

from app.database import get_db
from app.models import Order, OrderItem, Product, Pharmacy, User, OrderStatus, Payment, PaymentStatus
from app.auth import get_current_user

router = APIRouter(prefix="/partner/analytics", tags=["partner-analytics"])


@router.get("/dashboard-stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Get dashboard statistics for the current pharmacist"""
    
    if current_user.role.lower() != "pharmacist":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get user's pharmacy first
    pharmacy_result = await db.execute(
        select(Pharmacy).where(Pharmacy.owner_id == current_user.id)
    )
    user_pharmacy = pharmacy_result.scalar_one_or_none()
    
    if not user_pharmacy:
        # Return zero stats if no pharmacy configured
        return {
            "monthly_revenue": {"value": "0 FCFA", "change": "0%", "change_type": "neutral"},
            "monthly_orders": {"value": "0", "change": "0%", "change_type": "neutral"},
            "unique_customers": {"value": "0", "change": "0%", "change_type": "neutral"},
            "products_sold": {"value": "0", "change": "0%", "change_type": "neutral"},
            "has_pharmacy": False
        }
    
    # FOR DEMO: Use simulated data from demo pharmacy but show as user's own data
    # In production, this would use: pharmacy_id = user_pharmacy.id
    demo_pharmacy_id = '90beaf0f-d45a-460f-9540-2d41ab596990'
    pharmacy = user_pharmacy  # Use user's pharmacy object for display purposes
    
    # Calculate current month and previous month dates
    today = datetime.now()
    current_month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Previous month
    if current_month_start.month == 1:
        prev_month_start = current_month_start.replace(year=current_month_start.year - 1, month=12)
        prev_month_end = current_month_start - timedelta(days=1)
    else:
        prev_month_start = current_month_start.replace(month=current_month_start.month - 1)
        # Last day of previous month
        prev_month_end = current_month_start - timedelta(days=1)
    
    # Get current month stats
    current_month_orders = await db.execute(
        select(Order, Payment)
        .join(Payment, Order.id == Payment.order_id, isouter=True)
        .where(
            and_(
                Order.pharmacy_id == demo_pharmacy_id,
                Order.created_at >= current_month_start,
                Order.status.in_([OrderStatus.DELIVERED, OrderStatus.CONFIRMED, OrderStatus.READY, OrderStatus.COMPLETED])
            )
        )
    )
    current_orders = current_month_orders.all()
    
    # Get previous month stats
    prev_month_orders = await db.execute(
        select(Order, Payment)
        .join(Payment, Order.id == Payment.order_id, isouter=True)
        .where(
            and_(
                Order.pharmacy_id == demo_pharmacy_id,
                Order.created_at >= prev_month_start,
                Order.created_at <= prev_month_end,
                Order.status.in_([OrderStatus.DELIVERED, OrderStatus.CONFIRMED, OrderStatus.READY, OrderStatus.COMPLETED])
            )
        )
    )
    prev_orders = prev_month_orders.all()
    
    # Calculate current month metrics
    current_revenue = sum(float(order.total_amount or 0) for order, payment in current_orders)
    current_order_count = len(current_orders)
    current_customers = len(set(order.client_id for order, payment in current_orders))
    
    # Calculate previous month metrics
    prev_revenue = sum(float(order.total_amount or 0) for order, payment in prev_orders)
    prev_order_count = len(prev_orders)
    prev_customers = len(set(order.client_id for order, payment in prev_orders))
    
    # Get products sold this month
    current_products_sold = await db.execute(
        select(func.sum(OrderItem.quantity))
        .join(Order, OrderItem.order_id == Order.id)
        .where(
            and_(
                Order.pharmacy_id == demo_pharmacy_id,
                Order.created_at >= current_month_start,
                Order.status.in_([OrderStatus.DELIVERED, OrderStatus.CONFIRMED, OrderStatus.READY, OrderStatus.COMPLETED])
            )
        )
    )
    products_sold_current = current_products_sold.scalar() or 0
    
    prev_products_sold = await db.execute(
        select(func.sum(OrderItem.quantity))
        .join(Order, OrderItem.order_id == Order.id)
        .where(
            and_(
                Order.pharmacy_id == demo_pharmacy_id,
                Order.created_at >= prev_month_start,
                Order.created_at <= prev_month_end,
                Order.status.in_([OrderStatus.DELIVERED, OrderStatus.CONFIRMED, OrderStatus.READY, OrderStatus.COMPLETED])
            )
        )
    )
    products_sold_prev = prev_products_sold.scalar() or 0
    
    # Calculate percentage changes
    def calculate_change(current, previous):
        if previous == 0:
            return "+100%" if current > 0 else "0%", "increase" if current > 0 else "neutral"
        
        change_percent = ((current - previous) / previous) * 100
        if change_percent > 0:
            return f"+{change_percent:.0f}%", "increase"
        elif change_percent < 0:
            return f"{change_percent:.0f}%", "decrease"
        else:
            return "0%", "neutral"
    
    revenue_change, revenue_type = calculate_change(current_revenue, prev_revenue)
    orders_change, orders_type = calculate_change(current_order_count, prev_order_count)
    customers_change, customers_type = calculate_change(current_customers, prev_customers)
    products_change, products_type = calculate_change(products_sold_current, products_sold_prev)
    
    return {
        "monthly_revenue": {
            "value": f"{current_revenue:,.0f} FCFA",
            "change": revenue_change,
            "change_type": revenue_type
        },
        "monthly_orders": {
            "value": str(current_order_count),
            "change": orders_change,
            "change_type": orders_type
        },
        "unique_customers": {
            "value": str(current_customers),
            "change": customers_change,
            "change_type": customers_type
        },
        "products_sold": {
            "value": str(int(products_sold_current)),
            "change": products_change,
            "change_type": products_type
        },
        "has_pharmacy": True
    }


@router.get("/top-products")
async def get_top_products(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 10
) -> List[Dict[str, Any]]:
    """Get top selling products for the current pharmacist"""
    
    if current_user.role.lower() != "pharmacist":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get user's pharmacy first
    pharmacy_result = await db.execute(
        select(Pharmacy).where(Pharmacy.owner_id == current_user.id)
    )
    user_pharmacy = pharmacy_result.scalar_one_or_none()
    
    if not user_pharmacy:
        return []
    
    # FOR DEMO: Use simulated data from demo pharmacy but show as user's own data
    # In production, this would use: pharmacy_id = user_pharmacy.id
    demo_pharmacy_id = '90beaf0f-d45a-460f-9540-2d41ab596990'
    
    # Get current month date range
    today = datetime.now()
    current_month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Get top products by quantity sold
    top_products = await db.execute(
        select(
            Product.name,
            func.sum(OrderItem.quantity).label('total_quantity'),
            func.sum(OrderItem.total_price).label('total_revenue')
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .join(Order, OrderItem.order_id == Order.id)
        .where(
            and_(
                Order.pharmacy_id == demo_pharmacy_id,
                Order.created_at >= current_month_start,
                Order.status.in_([OrderStatus.DELIVERED, OrderStatus.CONFIRMED, OrderStatus.READY, OrderStatus.COMPLETED])
            )
        )
        .group_by(Product.id, Product.name)
        .order_by(desc('total_quantity'))
        .limit(limit)
    )
    
    result = []
    for product_name, quantity, revenue in top_products.all():
        result.append({
            "name": product_name,
            "sales": int(quantity),
            "revenue": f"{float(revenue):,.0f} FCFA"
        })
    
    return result