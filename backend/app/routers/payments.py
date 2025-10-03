from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from decimal import Decimal

from app.config import settings
from app.auth import get_current_active_user
from app.models import User

router = APIRouter(prefix="/payments", tags=["payments"])


def get_stripe():
    """
    Lazy import and initialize Stripe to avoid module-level initialization issues.
    Returns configured stripe module or raises HTTPException if not configured.
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe payment service is not configured"
        )

    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


class CreatePaymentIntentRequest(BaseModel):
    amount: Decimal  # Amount in FCFA
    currency: str = "xof"  # West African CFA franc
    order_ids: list[str] = []
    metadata: dict = {}


class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: int
    currency: str


@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(
    request: CreatePaymentIntentRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a Stripe PaymentIntent for processing payment

    This endpoint creates a payment intent that will be used by the frontend
    to collect payment information and process the transaction.
    """
    try:
        # Get configured Stripe module
        stripe = get_stripe()

        print(f"🔵 Creating payment intent for user {current_user.email}")
        print(f"🔵 Amount: {request.amount}, Currency: {request.currency}")
        print(f"🔵 Stripe API Key configured: {bool(stripe.api_key)}")

        # Convert Decimal amount to int (Stripe expects amounts in smallest currency unit)
        # For XOF (CFA Franc), no decimal places, so we just convert to int
        amount_in_cents = int(request.amount)

        # Ensure minimum amount (Stripe XOF minimum is 100 XOF)
        if amount_in_cents < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amount must be at least 100 XOF"
            )

        # Create metadata
        metadata = {
            "user_id": str(current_user.id),
            "user_email": current_user.email,
            **request.metadata
        }

        # Add order IDs to metadata if provided
        if request.order_ids:
            metadata["order_ids"] = ",".join(request.order_ids)

        # Create PaymentIntent
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency=request.currency.lower(),
            metadata=metadata,
            automatic_payment_methods={
                "enabled": True,
            },
            description=f"PharmaFinder Order for {current_user.email}"
        )

        return PaymentIntentResponse(
            client_secret=payment_intent.client_secret,
            payment_intent_id=payment_intent.id,
            amount=payment_intent.amount,
            currency=payment_intent.currency
        )

    except HTTPException:
        raise
    except Exception as e:
        # Import stripe here to catch StripeError
        import stripe as stripe_module
        if isinstance(e, stripe_module.error.StripeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe error: {str(e)}"
            )

        print(f"❌ Error creating payment intent: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment intent: {str(e)}"
        )


class ConfirmPaymentRequest(BaseModel):
    payment_intent_id: str
    order_ids: list[str] = []


@router.post("/confirm-payment")
async def confirm_payment(
    request: ConfirmPaymentRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Confirm that a payment was successful and update order status

    This endpoint should be called after the payment is confirmed on the client side.
    """
    try:
        # Get configured Stripe module
        stripe = get_stripe()

        # Retrieve the PaymentIntent to verify its status
        payment_intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)

        # Verify that the payment was successful
        if payment_intent.status != "succeeded":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment not completed. Status: {payment_intent.status}"
            )

        # Verify that the payment belongs to the current user
        if payment_intent.metadata.get("user_id") != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Payment does not belong to current user"
            )

        return {
            "success": True,
            "payment_intent_id": payment_intent.id,
            "amount": payment_intent.amount,
            "status": payment_intent.status,
            "message": "Payment confirmed successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        # Import stripe here to catch StripeError
        import stripe as stripe_module
        if isinstance(e, stripe_module.error.StripeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe error: {str(e)}"
            )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to confirm payment: {str(e)}"
        )


@router.get("/config")
async def get_stripe_config():
    """Get Stripe publishable key for frontend"""
    return {
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY
    }
