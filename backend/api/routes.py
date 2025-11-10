"""
API Routes
"""
from fastapi import APIRouter
from api.endpoints import users, items, auctions, bids, payments, notifications

# Tạo main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(auctions.router, prefix="/auctions", tags=["auctions"])
api_router.include_router(bids.router, prefix="/bids", tags=["bids"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
