"""
Bid Model
"""
from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base
from sqlalchemy import Enum as SQLEnum
from enum import Enum

class Bid(Base):
    """Bid model"""
    __tablename__ = "bids"
    
    class BidStatus(str, Enum):
        """Bid status enum"""
        VALID = "valid"
        OUTBID = "outbid"
        WITHDRAWN = "withdrawn"
        WON = "won"
        LOST = "lost"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    auction_id = Column(Integer, ForeignKey("auctions.id", ondelete="CASCADE"), nullable=False, index=True)
    bidder_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    bid_amount = Column(Numeric(15, 2), nullable=False)
    bid_time = Column(DateTime(timezone=True), server_default=func.now())
    is_highest = Column(Boolean, nullable=False, default=False)
    status = Column(SQLEnum(BidStatus, name="bid_status"), nullable=False, default=BidStatus.VALID)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    auction = relationship("Auction", back_populates="bids")
    bidder = relationship("User", foreign_keys=[bidder_id], backref="bids")

