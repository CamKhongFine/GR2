"""
Auction Service
"""
from sqlalchemy.orm import Session, joinedload
from models.auction import Auction
from models.product import Product
from models.category import Category
from schemas import AuctionCreate, AuctionUpdate
from typing import Optional, List

class AuctionService:
    """Auction service class"""
    
    @staticmethod
    def get_auction(db: Session, auction_id: int) -> Optional[Auction]:
        """Get auction by ID with product"""
        return db.query(Auction).options(joinedload(Auction.product)).filter(Auction.id == auction_id).first()
    
    @staticmethod
    def get_auctions(db: Session, skip: int = 0, limit: int = 100) -> List[Auction]:
        """Get list of auctions with products"""
        return db.query(Auction).options(joinedload(Auction.product)).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_auctions_by_status(db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Auction]:
        """Get auctions by status with products"""
        return db.query(Auction).options(joinedload(Auction.product)).filter(Auction.status == status).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_auction_by_product(db: Session, product_id: int) -> Optional[Auction]:
        """Get auction by product ID with product"""
        return db.query(Auction).options(joinedload(Auction.product)).filter(Auction.product_id == product_id).first()
    
    @staticmethod
    def get_active_auctions(db: Session, skip: int = 0, limit: int = 100) -> List[Auction]:
        """Get active auctions with products"""
        return db.query(Auction).options(joinedload(Auction.product)).filter(Auction.status == "active").offset(skip).limit(limit).all()
    
    @staticmethod
    def create_auction(db: Session, auction: AuctionCreate) -> Auction:
        """Create new auction with title, thumbnail, and category from product"""
        product = db.query(Product).filter(Product.id == auction.product_id).first()
        if not product:
            raise ValueError(f"Product with id {auction.product_id} not found")
        
        title = product.name
        thumbnail = product.thumbnail
        
        category_name = None
        if product.category_id:
            category = db.query(Category).filter(Category.id == product.category_id).first()
            if category:
                category_name = category.name
        
        db_auction = Auction(
            product_id=auction.product_id,
            seller_id=auction.seller_id,
            start_price=auction.start_price,
            current_price=auction.current_price or auction.start_price,
            buy_now_price=auction.buy_now_price,
            start_time=auction.start_time,
            end_time=auction.end_time,
            winner_id=auction.winner_id,
            status=auction.status or "active",
            title=title,
            thumbnail=thumbnail,
            category=category_name,
            version=auction.version or 0,
            auto_extend_seconds=auction.auto_extend_seconds or 10,
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

