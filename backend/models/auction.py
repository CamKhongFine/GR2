"""
Auction Model
"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base
from sqlalchemy import Enum as SQLEnum
from enum import Enum

class Auction(Base):
    """Auction model"""
    __tablename__ = "auctions"
    
    class AuctionStatus(str, Enum):
        DRAFT = "draft"
        ACTIVE = "active"
        ENDED = "ended"
        CANCELLED = "cancelled"
        SOLD = "sold"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    start_price = Column(Numeric(15, 2), nullable=False)
    current_price = Column(Numeric(15, 2), nullable=False, default=0)
    buy_now_price = Column(Numeric(15, 2), nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(SQLEnum(AuctionStatus, name="auction_status"), nullable=False, default=AuctionStatus.ACTIVE)
    title = Column(String(255), nullable=True)
    thumbnail = Column(String(500), nullable=True)
    category = Column(String(255), nullable=True)
    version = Column(Integer, nullable=False, default=0)
    auto_extend_seconds = Column(Integer, nullable=False, default=10)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    product = relationship("Product", backref="auctions")
    seller = relationship("User", foreign_keys=[seller_id], backref="auctions")
    winner = relationship("User", foreign_keys=[winner_id], backref="won_auctions")
    bids = relationship("Bid", back_populates="auction", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="auction")

