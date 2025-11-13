"""
Payment Service
"""
from sqlalchemy.orm import Session
from models.payment import Payment
from schemas import PaymentCreate, PaymentUpdate
from typing import Optional, List

class PaymentService:
    """Payment service class"""
    
    @staticmethod
    def get_payment(db: Session, payment_id: int) -> Optional[Payment]:
        """Get payment by ID"""
        return db.query(Payment).filter(Payment.id == payment_id).first()
    
    @staticmethod
    def get_payments(db: Session, skip: int = 0, limit: int = 100) -> List[Payment]:
        """Get list of payments"""
        return db.query(Payment).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_payments_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Payment]:
        """Get payments by user ID"""
        return db.query(Payment).filter(Payment.user_id == user_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_payments_by_auction(db: Session, auction_id: int, skip: int = 0, limit: int = 100) -> List[Payment]:
        """Get payments by auction ID"""
        return db.query(Payment).filter(Payment.auction_id == auction_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_payments_by_status(db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Payment]:
        """Get payments by status"""
        return db.query(Payment).filter(Payment.status == status).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_payment(db: Session, payment: PaymentCreate) -> Payment:
        """Create new payment"""
        db_payment = Payment(
            auction_id=payment.auction_id,
            user_id=payment.user_id,
            amount=payment.amount,
            provider=payment.provider
        )
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        return db_payment
    
    @staticmethod
    def update_payment(db: Session, payment_id: int, payment_update: PaymentUpdate) -> Optional[Payment]:
        """Update payment"""
        db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not db_payment:
            return None
        
        update_data = payment_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_payment, field, value)
        
        db.commit()
        db.refresh(db_payment)
        return db_payment
    
    @staticmethod
    def delete_payment(db: Session, payment_id: int) -> bool:
        """Delete payment"""
        db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not db_payment:
            return False
        
        db.delete(db_payment)
        db.commit()
        return True

