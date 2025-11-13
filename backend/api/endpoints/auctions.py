"""
Auction Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.connection import get_db
from schemas import Auction, AuctionCreate, AuctionUpdate
from services.auction_service import AuctionService

router = APIRouter()

@router.get("/", response_model=List[Auction])
async def get_auctions(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of auctions"""
    if status_filter:
        auctions = AuctionService.get_auctions_by_status(db, status=status_filter, skip=skip, limit=limit)
    else:
        auctions = AuctionService.get_auctions(db, skip=skip, limit=limit)
    return auctions

@router.get("/active", response_model=List[Auction])
async def get_active_auctions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get active auctions"""
    auctions = AuctionService.get_active_auctions(db, skip=skip, limit=limit)
    return auctions

@router.get("/{auction_id}", response_model=Auction)
async def get_auction(
    auction_id: int,
    db: Session = Depends(get_db)
):
    """Get auction by ID"""
    auction = AuctionService.get_auction(db, auction_id=auction_id)
    if auction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    return auction

@router.get("/product/{product_id}", response_model=Auction)
async def get_auction_by_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get auction by product ID"""
    auction = AuctionService.get_auction_by_product(db, product_id=product_id)
    if auction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found for this product"
        )
    return auction

@router.post("/", response_model=Auction, status_code=status.HTTP_201_CREATED)
async def create_auction(
    auction: AuctionCreate,
    db: Session = Depends(get_db)
):
    """Create new auction"""
    return AuctionService.create_auction(db=db, auction=auction)

@router.put("/{auction_id}", response_model=Auction)
async def update_auction(
    auction_id: int,
    auction_update: AuctionUpdate,
    db: Session = Depends(get_db)
):
    """Update auction"""
    auction = AuctionService.update_auction(db, auction_id=auction_id, auction_update=auction_update)
    if auction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    return auction

@router.delete("/{auction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_auction(
    auction_id: int,
    db: Session = Depends(get_db)
):
    """Delete auction"""
    success = AuctionService.delete_auction(db, auction_id=auction_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )

