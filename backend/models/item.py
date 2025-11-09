"""
Item Model
"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.connection import Base

class Item(Base):
    """Item model"""
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    starting_price = Column(Numeric(12, 2), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    owner = relationship("User", backref="items")
    auction = relationship("Auction", back_populates="item", uselist=False)

