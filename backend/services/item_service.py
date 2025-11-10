"""
Item Service
"""
from sqlalchemy.orm import Session
from models.item import Item
from models.schemas import ItemCreate, ItemUpdate
from typing import Optional, List

class ItemService:
    """Item service class"""
    
    @staticmethod
    def get_item(db: Session, item_id: int) -> Optional[Item]:
        """Get item by ID"""
        return db.query(Item).filter(Item.id == item_id).first()
    
    @staticmethod
    def get_items(db: Session, skip: int = 0, limit: int = 100) -> List[Item]:
        """Get list of items"""
        return db.query(Item).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_items_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[Item]:
        """Get items by owner ID"""
        return db.query(Item).filter(Item.owner_id == owner_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_item(db: Session, item: ItemCreate) -> Item:
        """Create new item"""
        db_item = Item(
            title=item.title,
            description=item.description,
            image_url=item.image_url,
            starting_price=item.starting_price,
            owner_id=item.owner_id
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def update_item(db: Session, item_id: int, item_update: ItemUpdate) -> Optional[Item]:
        """Update item"""
        db_item = db.query(Item).filter(Item.id == item_id).first()
        if not db_item:
            return None
        
        update_data = item_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        
        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def delete_item(db: Session, item_id: int) -> bool:
        """Delete item"""
        db_item = db.query(Item).filter(Item.id == item_id).first()
        if not db_item:
            return False
        
        db.delete(db_item)
        db.commit()
        return True

