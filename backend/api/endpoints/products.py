"""
Product Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from database.connection import get_db
from schemas import Product, ProductCreate, ProductUpdate
from services.product_service import ProductService
from services.minio_service import minio_service
import logging

logger = logging.getLogger(__name__)

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


@router.post("", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db)
):
    """
    Create product with MinIO image integration
    
    If image_object_names is provided, uploads images to MinIO and stores presigned URLs.
    thumbnail_index specifies which image in image_object_names should be used as the main image.
    """
    try:
        # Process images if object names are provided
        image_url = payload.image_url
        image_gallery = payload.image_gallery
        
        if payload.image_object_names and len(payload.image_object_names) > 0:
            # Get presigned URLs for all images
            image_gallery_urls = []
            for object_name in payload.image_object_names:
                try:
                    presigned_url = minio_service.get_presigned_url(object_name)
                    image_gallery_urls.append(presigned_url)
                except Exception as e:
                    logger.warning(f"Failed to get presigned URL for {object_name}: {e}")
                    # Continue with other images even if one fails
                    continue
            
            # Set thumbnail (main image) based on thumbnail_index
            if len(image_gallery_urls) > 0:
                thumbnail_index = payload.thumbnail_index or 0
                if 0 <= thumbnail_index < len(image_gallery_urls):
                    image_url = image_gallery_urls[thumbnail_index]
                else:
                    # Fallback to first image if index is invalid
                    image_url = image_gallery_urls[0]
                
                # Set image gallery
                image_gallery = image_gallery_urls
        
        # Create product payload dict (exclude MinIO-specific fields)
        product_data = payload.dict(exclude={'image_object_names', 'thumbnail_index'})
        product_data['image_url'] = image_url
        product_data['image_gallery'] = image_gallery
        
        # Create ProductCreate instance with updated data
        final_payload = ProductCreate(**product_data)
        
        # Create product
        return ProductService.create_product(db, payload=final_payload)
        
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(e)}"
        )


@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update product"""
    try:
        update_data = payload.dict(exclude_unset=True)
        image_object_names = update_data.pop("image_object_names", None)
        thumbnail_index = update_data.pop("thumbnail_index", None)

        if image_object_names:
            image_gallery_urls = []
            for object_name in image_object_names:
                try:
                    presigned_url = minio_service.get_presigned_url(object_name)
                    image_gallery_urls.append(presigned_url)
                except Exception as e:
                    logger.warning(f"Failed to get presigned URL for {object_name}: {e}")
                    continue

            if image_gallery_urls:
                if thumbnail_index is None or thumbnail_index < 0 or thumbnail_index >= len(image_gallery_urls):
                    thumbnail_index = 0
                update_data["image_gallery"] = image_gallery_urls
                update_data["image_url"] = image_gallery_urls[thumbnail_index]

        product = ProductService.update_product(
            db,
            product_id=product_id,
            update=ProductUpdate(**update_data)
        )
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update product"
        )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Delete product"""
    success = ProductService.delete_product(db, product_id=product_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")


