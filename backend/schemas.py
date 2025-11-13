"""
Pydantic Schemas
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# Category Schemas
class CategoryBase(BaseModel):
    """Base category schema"""
    name: str
    slug: Optional[str] = None
    parent_id: Optional[int] = None
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    """Schema for creating category"""
    pass

class CategoryUpdate(BaseModel):
    """Schema for updating category"""
    name: Optional[str] = None
    slug: Optional[str] = None
    parent_id: Optional[int] = None
    description: Optional[str] = None

class CategoryInDB(CategoryBase):
    """Category schema in database"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Category(CategoryInDB):
    """Category schema for response"""
    pass


# Product Schemas
class ProductBase(BaseModel):
    """Base product schema"""
    name: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    condition: Optional[str] = "used"
    base_price: Decimal
    image_url: Optional[str] = None
    image_gallery: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = "draft"


class ProductCreate(ProductBase):
    """Schema for creating product"""
    seller_id: int
    # For MinIO integration - can accept either presigned URLs or object names
    image_object_names: Optional[List[str]] = None  # MinIO object names
    thumbnail_index: Optional[int] = 0  # Index of thumbnail in image_object_names


class ProductUpdate(BaseModel):
    """Schema for updating product"""
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    condition: Optional[str] = None
    base_price: Optional[Decimal] = None
    image_url: Optional[str] = None
    image_gallery: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    deleted_at: Optional[datetime] = None
    image_object_names: Optional[List[str]] = None
    thumbnail_index: Optional[int] = None


class ProductInDB(ProductBase):
    """Product schema in database"""
    id: int
    seller_id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Product(ProductInDB):
    """Product schema for response"""
    pass


# User Schemas
class UserBase(BaseModel):
    """Base user schema"""
    keycloak_sub: str
    username: Optional[str] = None

class UserCreate(UserBase):
    """Schema for creating user"""
    pass

class SignUpRequest(BaseModel):
    """Schema for user signup"""
    username: str
    password: str
    email: Optional[str] = None

class UserUpdate(BaseModel):
    """Schema for updating user"""
    balance: Optional[Decimal] = None
    rating: Optional[Decimal] = None
    is_banned: Optional[bool] = None
    is_seller_verified: Optional[bool] = None

class UserInDB(UserBase):
    """User schema in database"""
    id: int
    balance: Decimal
    rating: Decimal
    is_banned: bool
    is_seller_verified: bool
    created_at: datetime
    updated_at: datetime
    
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
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Item(ItemInDB):
    """Item schema for response"""
    pass


# Auction Schemas
class AuctionBase(BaseModel):
    """Base auction schema"""
    product_id: int
    seller_id: int
    start_price: Decimal
    current_price: Optional[Decimal] = None
    buy_now_price: Optional[Decimal] = None
    start_time: datetime
    end_time: datetime
    winner_id: Optional[int] = None
    status: Optional[str] = "available"

class AuctionCreate(AuctionBase):
    """Schema for creating auction"""
    pass

class AuctionUpdate(BaseModel):
    """Schema for updating auction"""
    start_price: Optional[Decimal] = None
    current_price: Optional[Decimal] = None
    buy_now_price: Optional[Decimal] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    winner_id: Optional[int] = None
    status: Optional[str] = None

class AuctionInDB(AuctionBase):
    """Auction schema in database"""
    id: int
    created_at: datetime
    updated_at: datetime

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
    bidder_id: int
    is_highest: Optional[bool] = False
    status: Optional[str] = "valid"

class BidCreate(BidBase):
    """Schema for creating bid"""
    pass


class BidUpdate(BaseModel):
    """Schema for updating bid"""
    bid_amount: Optional[Decimal] = None
    is_highest: Optional[bool] = None
    status: Optional[str] = None


class BidInDB(BidBase):
    """Bid schema in database"""
    id: int
    bid_time: datetime
    created_at: datetime
    updated_at: datetime
    
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
    updated_at: datetime
    
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
    updated_at: datetime
    
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


# File Upload Schemas
class FileUploadResponse(BaseModel):
    """Response model for file upload"""
    object_name: str
    presigned_url: str
    file_name: str


class PresignedUrlResponse(BaseModel):
    """Response model for presigned URL"""
    presigned_url: str
    object_name: str
    expiry_seconds: int


class PresignedUploadUrlRequest(BaseModel):
    """Request model for presigned upload URL"""
    file_name: str
    content_type: Optional[str] = "image/jpeg"
    folder: Optional[str] = None
    expiry_seconds: Optional[int] = None


class PresignedUploadUrlResponse(BaseModel):
    """Response model for presigned upload URL"""
    presigned_url: str
    object_name: str
    expiry_seconds: int


class FileExistsResponse(BaseModel):
    """Response model for file existence check"""
    exists: bool
    object_name: str


class FileListResponse(BaseModel):
    """Response model for file list"""
    files: List[str]
    count: int
    folder: Optional[str] = None