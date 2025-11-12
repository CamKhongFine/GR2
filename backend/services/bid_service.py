"""
Bid Service
"""
from sqlalchemy.orm import Session
from models.bid import Bid
from models.schemas import BidCreate, BidUpdate
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
            is_highest=bid.is_highest if bid.is_highest is not None else False,
            status=bid.status or "valid",
        )
        db.add(db_bid)
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
    def delete_bid(db: Session, bid_id: int) -> bool:
        """Delete bid"""
        db_bid = db.query(Bid).filter(Bid.id == bid_id).first()
        if not db_bid:
            return False
        
        db.delete(db_bid)
        db.commit()
        return True

