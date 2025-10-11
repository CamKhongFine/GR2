"""
API Routes
"""
from fastapi import APIRouter
from api.endpoints import users

# Tạo main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(users.router, prefix="/users", tags=["users"])
