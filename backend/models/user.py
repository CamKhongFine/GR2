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
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    passwords = Column(String, nullable=False)  # Note: should be hashed in practice
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    balance = Column(Numeric(12, 2), default=0)
    rating = Column(Numeric(3, 2), default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
