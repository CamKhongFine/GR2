"""
Pydantic Schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from decimal import Decimal

# User Schemas
class UserBase(BaseModel):
    """Base user schema"""
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    """Schema for creating user"""
    passwords: str

class UserUpdate(BaseModel):
    """Schema for updating user"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    passwords: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    balance: Optional[Decimal] = None
    rating: Optional[Decimal] = None
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    """User schema in database"""
    id: int
    balance: Decimal
    rating: Decimal
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class User(UserInDB):
    """User schema for response"""
    pass


# Item Schemas
class ItemBase(BaseModel):
    """Base item schema"""
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    starting_price: Decimal

class ItemCreate(ItemBase):
    """Schema for creating item"""
    owner_id: int

class ItemUpdate(BaseModel):
    """Schema for updating item"""
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    starting_price: Optional[Decimal] = None

class ItemInDB(ItemBase):
    """Item schema in database"""
    id: int
    owner_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Item(ItemInDB):
    """Item schema for response"""
    pass


# Auction Schemas
class AuctionBase(BaseModel):
    """Base auction schema"""
    item_id: int
    end_time: datetime
    status: Optional[str] = "active"

class AuctionCreate(AuctionBase):
    """Schema for creating auction"""
    pass

class AuctionUpdate(BaseModel):
    """Schema for updating auction"""
    status: Optional[str] = None
    current_price: Optional[Decimal] = None
    winner_id: Optional[int] = None

class AuctionInDB(AuctionBase):
    """Auction schema in database"""
    id: int
    start_time: datetime
    current_price: Decimal
    winner_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class Auction(AuctionInDB):
    """Auction schema for response"""
    pass


# Bid Schemas
class BidBase(BaseModel):
    """Base bid schema"""
    auction_id: int
    bid_amount: Decimal

class BidCreate(BidBase):
    """Schema for creating bid"""
    user_id: int

class BidInDB(BidBase):
    """Bid schema in database"""
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Bid(BidInDB):
    """Bid schema for response"""
    pass


# Payment Schemas
class PaymentBase(BaseModel):
    """Base payment schema"""
    auction_id: int
    user_id: int
    amount: Decimal
    provider: Optional[str] = None

class PaymentCreate(PaymentBase):
    """Schema for creating payment"""
    pass

class PaymentUpdate(BaseModel):
    """Schema for updating payment"""
    status: Optional[str] = None
    transaction_id: Optional[str] = None

class PaymentInDB(PaymentBase):
    """Payment schema in database"""
    id: int
    status: str
    transaction_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class Payment(PaymentInDB):
    """Payment schema for response"""
    pass


# Notification Schemas
class NotificationBase(BaseModel):
    """Base notification schema"""
    message: str

class NotificationCreate(NotificationBase):
    """Schema for creating notification"""
    user_id: int

class NotificationUpdate(BaseModel):
    """Schema for updating notification"""
    is_read: Optional[bool] = None

class NotificationInDB(NotificationBase):
    """Notification schema in database"""
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Notification(NotificationInDB):
    """Notification schema for response"""
    pass


# Generic Response Schemas
class Message(BaseModel):
    """Generic message response"""
    message: str

class HealthCheck(BaseModel):
    """Health check response"""
    status: str
    message: str
