"""
User Model
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric
from sqlalchemy.sql import func
from database.connection import Base

class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    keycloak_sub = Column(String(200), unique=True, nullable=False, index=True)
    username = Column(String(100), nullable=True, index=True)
    balance = Column(Numeric(12, 2), default=0)
    rating = Column(Numeric(3, 2), default=0)
    is_banned = Column(Boolean, default=False)
    is_seller_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
