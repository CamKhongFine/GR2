"""
Product Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.schemas import Product, ProductCreate, ProductUpdate
from services.product_service import ProductService

router = APIRouter()


@router.get("/", response_model=List[Product])
async def list_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get products"""
    return ProductService.get_products(db, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=Product)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get product by ID"""
    product = ProductService.get_product(db, product_id=product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.get("/seller/{seller_id}", response_model=List[Product])
async def get_products_by_seller(
    seller_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get products by seller"""
    return ProductService.get_products_by_seller(db, seller_id=seller_id, skip=skip, limit=limit)


@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db)
):
    """Create product"""
    return ProductService.create_product(db, payload=payload)


@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update product"""
    product = ProductService.update_product(db, product_id=product_id, update=payload)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Delete product"""
    success = ProductService.delete_product(db, product_id=product_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")


