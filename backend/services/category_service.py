"""
Category Service
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from models.category import Category
from models.schemas import CategoryCreate, CategoryUpdate


class CategoryService:
    """Category service class"""

    @staticmethod
    def get_category(db: Session, category_id: int) -> Optional[Category]:
        """Get category by ID"""
        return db.query(Category).filter(Category.id == category_id).first()

    @staticmethod
    def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
        """Get list of categories"""
        return db.query(Category).offset(skip).limit(limit).all()

    @staticmethod
    def get_category_by_slug(db: Session, slug: str) -> Optional[Category]:
        """Get category by slug"""
        return db.query(Category).filter(Category.slug == slug).first()

    @staticmethod
    def get_children(db: Session, parent_id: int) -> List[Category]:
        """Get child categories for a given parent"""
        return db.query(Category).filter(Category.parent_id == parent_id).all()

    @staticmethod
    def create_category(db: Session, category: CategoryCreate) -> Category:
        """Create new category"""
        db_category = Category(
            name=category.name,
            slug=category.slug,
            parent_id=category.parent_id,
            description=category.description,
        )
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category

    @staticmethod
    def update_category(db: Session, category_id: int, update: CategoryUpdate) -> Optional[Category]:
        """Update category"""
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if not db_category:
            return None
        update_data = update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_category, field, value)
        db.commit()
        db.refresh(db_category)
        return db_category

    @staticmethod
    def delete_category(db: Session, category_id: int) -> bool:
        """Delete category"""
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if not db_category:
            return False
        db.delete(db_category)
        db.commit()
        return True


