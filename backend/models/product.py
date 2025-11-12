"""
Product Model
"""
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Numeric,
    ForeignKey,
    DateTime,
    JSON,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base
from sqlalchemy import Enum as SQLEnum
from enum import Enum


class ProductCondition(str, Enum):
    """Product condition enum."""
    NEW = "new"
    USED = "used"
    REFURBISHED = "refurbished"


class ProductStatus(str, Enum):
    """Product status enum."""
    DRAFT = "draft"
    AVAILABLE = "available"
    IN_AUCTION = "in_auction"
    SOLD = "sold"
    UNSOLD = "unsold"
    ARCHIVED = "archived"


class Product(Base):
    """Product model"""

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    condition = Column(
        SQLEnum(ProductCondition, name="product_condition"),
        nullable=False,
        default=ProductCondition.USED,
    )
    base_price = Column(Numeric(15, 2), nullable=False)
    image_url = Column(String(500), nullable=True)
    image_gallery = Column(JSON, nullable=True)
    tags = Column(JSON, nullable=True)
    status = Column(
        SQLEnum(ProductStatus, name="product_status"),
        nullable=False,
        default=ProductStatus.DRAFT,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    seller = relationship("User", backref="products")
    category = relationship("Category", backref="products")


