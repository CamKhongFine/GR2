"""
Bid Model
"""
from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base

class Bid(Base):
    """Bid model"""
    __tablename__ = "bids"
    
    id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("auctions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bid_amount = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    auction = relationship("Auction", back_populates="bids")
    user = relationship("User", backref="bids")

