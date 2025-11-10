"""
Auction Model
"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base

class Auction(Base):
    """Auction model"""
    __tablename__ = "auctions"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(20), default="active")  # active | finished | canceled
    current_price = Column(Numeric(12, 2), default=0)
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    item = relationship("Item", back_populates="auction")
    winner = relationship("User", foreign_keys=[winner_id], backref="won_auctions")
    bids = relationship("Bid", back_populates="auction", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="auction")

