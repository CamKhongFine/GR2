"""
Payment Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.connection import get_db
from models.schemas import Payment, PaymentCreate, PaymentUpdate
from services.payment_service import PaymentService

router = APIRouter()

@router.get("/", response_model=List[Payment])
async def get_payments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get list of payments"""
    payments = PaymentService.get_payments(db, skip=skip, limit=limit)
    return payments

@router.get("/{payment_id}", response_model=Payment)
async def get_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    """Get payment by ID"""
    payment = PaymentService.get_payment(db, payment_id=payment_id)
    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    return payment

@router.get("/user/{user_id}", response_model=List[Payment])
async def get_payments_by_user(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get payments by user ID"""
    payments = PaymentService.get_payments_by_user(db, user_id=user_id, skip=skip, limit=limit)
    return payments

@router.get("/auction/{auction_id}", response_model=List[Payment])
async def get_payments_by_auction(
    auction_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get payments by auction ID"""
    payments = PaymentService.get_payments_by_auction(db, auction_id=auction_id, skip=skip, limit=limit)
    return payments

@router.get("/status/{status}", response_model=List[Payment])
async def get_payments_by_status(
    status: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get payments by status"""
    payments = PaymentService.get_payments_by_status(db, status=status, skip=skip, limit=limit)
    return payments

@router.post("/", response_model=Payment, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db)
):
    """Create new payment"""
    return PaymentService.create_payment(db=db, payment=payment)

@router.put("/{payment_id}", response_model=Payment)
async def update_payment(
    payment_id: int,
    payment_update: PaymentUpdate,
    db: Session = Depends(get_db)
):
    """Update payment"""
    payment = PaymentService.update_payment(db, payment_id=payment_id, payment_update=payment_update)
    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    return payment

@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    """Delete payment"""
    success = PaymentService.delete_payment(db, payment_id=payment_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

