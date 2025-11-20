"""
Bid Service
"""
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from models.bid import Bid
from models.auction import Auction
from schemas import BidCreate, BidUpdate
from typing import Optional, List

class BidService:
    """Bid service class"""
    
    @staticmethod
    def get_bid(db: Session, bid_id: int) -> Optional[Bid]:
        """Get bid by ID"""
        return db.query(Bid).filter(Bid.id == bid_id).first()
    
    @staticmethod
    def get_bids(db: Session, skip: int = 0, limit: int = 100) -> List[Bid]:
        """Get list of bids"""
        return db.query(Bid).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_bids_by_auction(db: Session, auction_id: int, skip: int = 0, limit: int = 100) -> List[Bid]:
        """Get bids by auction ID"""
        return db.query(Bid).filter(Bid.auction_id == auction_id).order_by(Bid.bid_amount.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_bids_by_bidder(db: Session, bidder_id: int, skip: int = 0, limit: int = 100) -> List[Bid]:
        """Get bids by bidder ID"""
        return db.query(Bid).filter(Bid.bidder_id == bidder_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_highest_bid(db: Session, auction_id: int) -> Optional[Bid]:
        """Get highest bid for an auction"""
        return db.query(Bid).filter(Bid.auction_id == auction_id).order_by(Bid.bid_amount.desc()).first()
    
    @staticmethod
    def create_bid(db: Session, bid: BidCreate) -> Bid:
        """Create new bid"""
        db_bid = Bid(
            auction_id=bid.auction_id,
            bidder_id=bid.bidder_id,
            bid_amount=bid.bid_amount,
            status=bid.status or "valid",
        )
        db.add(db_bid)
        BidService._apply_auction_bid_effects(db, bid.auction_id)
        db.commit()
        db.refresh(db_bid)
        return db_bid

    @staticmethod
    def update_bid(db: Session, bid_id: int, update: BidUpdate) -> Optional[Bid]:
        """Update bid"""
        db_bid = db.query(Bid).filter(Bid.id == bid_id).first()
        if not db_bid:
            return None
        update_data = update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_bid, field, value)
        db.commit()
        db.refresh(db_bid)
        return db_bid

    @staticmethod
    def _apply_auction_bid_effects(db: Session, auction_id: int) -> None:
        """Update auction metadata when a bid is placed"""
        auction = db.query(Auction).filter(Auction.id == auction_id).first()
        if not auction:
            return

        auction.version = (auction.version or 0) + 1

        if auction.end_time:
            end_time = auction.end_time
            if end_time.tzinfo is None:
                end_time = end_time.replace(tzinfo=timezone.utc)

            now = datetime.now(timezone.utc)
            extend_seconds = auction.auto_extend_seconds or 0
            if extend_seconds > 0:
                time_remaining = (end_time - now).total_seconds()
                if time_remaining <= extend_seconds:
                    auction.end_time = end_time + timedelta(seconds=extend_seconds)
    
    @staticmethod
    def delete_bid(db: Session, bid_id: int) -> bool:
        """Delete bid"""
        db_bid = db.query(Bid).filter(Bid.id == bid_id).first()
        if not db_bid:
            return False
        
        db.delete(db_bid)
        db.commit()
        return True

