"""
Bid Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.schemas import Bid, BidCreate
from services.bid_service import BidService

router = APIRouter()

@router.get("/", response_model=List[Bid])
async def get_bids(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get list of bids"""
    bids = BidService.get_bids(db, skip=skip, limit=limit)
    return bids

@router.get("/{bid_id}", response_model=Bid)
async def get_bid(
    bid_id: int,
    db: Session = Depends(get_db)
):
    """Get bid by ID"""
    bid = BidService.get_bid(db, bid_id=bid_id)
    if bid is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )
    return bid

@router.get("/auction/{auction_id}", response_model=List[Bid])
async def get_bids_by_auction(
    auction_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get bids by auction ID"""
    bids = BidService.get_bids_by_auction(db, auction_id=auction_id, skip=skip, limit=limit)
    return bids

@router.get("/user/{user_id}", response_model=List[Bid])
async def get_bids_by_user(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get bids by user ID"""
    bids = BidService.get_bids_by_user(db, user_id=user_id, skip=skip, limit=limit)
    return bids

@router.get("/auction/{auction_id}/highest", response_model=Bid)
async def get_highest_bid(
    auction_id: int,
    db: Session = Depends(get_db)
):
    """Get highest bid for an auction"""
    bid = BidService.get_highest_bid(db, auction_id=auction_id)
    if bid is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No bids found for this auction"
        )
    return bid

@router.post("/", response_model=Bid, status_code=status.HTTP_201_CREATED)
async def create_bid(
    bid: BidCreate,
    db: Session = Depends(get_db)
):
    """Create new bid"""
    return BidService.create_bid(db=db, bid=bid)

@router.delete("/{bid_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bid(
    bid_id: int,
    db: Session = Depends(get_db)
):
    """Delete bid"""
    success = BidService.delete_bid(db, bid_id=bid_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

