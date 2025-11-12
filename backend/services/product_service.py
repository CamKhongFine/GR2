"""
Product Service
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from models.product import Product
from models.schemas import ProductCreate, ProductUpdate


class ProductService:
    """Product service layer"""

    @staticmethod
    def get_product(db: Session, product_id: int) -> Optional[Product]:
        """Get product by ID"""
        return db.query(Product).filter(Product.id == product_id).first()

    @staticmethod
    def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[Product]:
        """Get list of products"""
        return db.query(Product).offset(skip).limit(limit).all()

    @staticmethod
    def get_products_by_seller(db: Session, seller_id: int, skip: int = 0, limit: int = 100) -> List[Product]:
        """Get products by seller ID"""
        return (
            db.query(Product)
            .filter(Product.seller_id == seller_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create_product(db: Session, payload: ProductCreate) -> Product:
        """Create product"""
        db_product = Product(
            seller_id=payload.seller_id,
            name=payload.name,
            description=payload.description,
            category_id=payload.category_id,
            condition=payload.condition,
            base_price=payload.base_price,
            image_url=payload.image_url,
            image_gallery=payload.image_gallery,
            tags=payload.tags,
            status=payload.status,
        )
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product

    @staticmethod
    def update_product(db: Session, product_id: int, update: ProductUpdate) -> Optional[Product]:
        """Update product"""
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            return None
        update_data = update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        db.commit()
        db.refresh(db_product)
        return db_product

    @staticmethod
    def delete_product(db: Session, product_id: int) -> bool:
        """Soft delete product"""
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            return False
        db.delete(db_product)
        db.commit()
        return True


