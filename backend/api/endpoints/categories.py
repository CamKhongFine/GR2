"""
Category Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.schemas import Category, CategoryCreate, CategoryUpdate
from services.category_service import CategoryService

router = APIRouter()


@router.get("", response_model=List[Category])
async def list_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get list of categories"""
    return CategoryService.get_categories(db, skip=skip, limit=limit)


@router.get("/{category_id}", response_model=Category)
async def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    """Get category by id"""
    category = CategoryService.get_category(db, category_id=category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.get("/slug/{slug}", response_model=Category)
async def get_category_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """Get category by slug"""
    category = CategoryService.get_category_by_slug(db, slug=slug)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.get("/{category_id}/children", response_model=List[Category])
async def get_children(
    category_id: int,
    db: Session = Depends(get_db)
):
    """Get child categories"""
    return CategoryService.get_children(db, parent_id=category_id)


@router.post("", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db)
):
    """Create category"""
    return CategoryService.create_category(db, category=payload)


@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db)
):
    """Update category"""
    category = CategoryService.update_category(db, category_id=category_id, update=payload)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    """Delete category"""
    success = CategoryService.delete_category(db, category_id=category_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")


