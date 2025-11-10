"""
Auction Service
"""
from sqlalchemy.orm import Session
from models.auction import Auction
from models.schemas import AuctionCreate, AuctionUpdate
from typing import Optional, List

class AuctionService:
    """Auction service class"""
    
    @staticmethod
    def get_auction(db: Session, auction_id: int) -> Optional[Auction]:
        """Get auction by ID"""
        return db.query(Auction).filter(Auction.id == auction_id).first()
    
    @staticmethod
    def get_auctions(db: Session, skip: int = 0, limit: int = 100) -> List[Auction]:
        """Get list of auctions"""
        return db.query(Auction).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_auctions_by_status(db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Auction]:
        """Get auctions by status"""
        return db.query(Auction).filter(Auction.status == status).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_auctions_by_item(db: Session, item_id: int) -> Optional[Auction]:
        """Get auction by item ID"""
        return db.query(Auction).filter(Auction.item_id == item_id).first()
    
    @staticmethod
    def get_active_auctions(db: Session, skip: int = 0, limit: int = 100) -> List[Auction]:
        """Get active auctions"""
        return db.query(Auction).filter(Auction.status == "active").offset(skip).limit(limit).all()
    
    @staticmethod
    def create_auction(db: Session, auction: AuctionCreate) -> Auction:
        """Create new auction"""
        db_auction = Auction(
            item_id=auction.item_id,
            end_time=auction.end_time,
            status=auction.status
        )
        db.add(db_auction)
        db.commit()
        db.refresh(db_auction)
        return db_auction
    
    @staticmethod
    def update_auction(db: Session, auction_id: int, auction_update: AuctionUpdate) -> Optional[Auction]:
        """Update auction"""
        db_auction = db.query(Auction).filter(Auction.id == auction_id).first()
        if not db_auction:
            return None
        
        update_data = auction_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_auction, field, value)
        
        db.commit()
        db.refresh(db_auction)
        return db_auction
    
    @staticmethod
    def delete_auction(db: Session, auction_id: int) -> bool:
        """Delete auction"""
        db_auction = db.query(Auction).filter(Auction.id == auction_id).first()
        if not db_auction:
            return False
        
        db.delete(db_auction)
        db.commit()
        return True

