from sqlalchemy import Column, String, Integer, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base

class Bid(Base):
    """Bid model"""
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    auction_id = Column(Integer, ForeignKey("auctions.id", ondelete="CASCADE"), nullable=False, index=True)
    bidder_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    bid_amount = Column(Numeric(15, 2), nullable=False)
    bid_time = Column(DateTime(timezone=True), server_default=func.now())
    status = Column((String(20)), nullable=False, default="VALID")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    auction = relationship("Auction", back_populates="bids")
    bidder = relationship("User", foreign_keys=[bidder_id], backref="bids")

