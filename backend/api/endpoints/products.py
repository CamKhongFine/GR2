"""
Product Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from database.connection import get_db
from schemas import Product, ProductCreate, ProductUpdate
from services.product_service import ProductService
from services.file_service import file_service
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

    try:
        thumbnail = payload.thumbnail
        detail_images = payload.detail_images
        
        if payload.image_object_names and len(payload.image_object_names) > 0:
            image_urls = [file_service.get_file_url(obj_name) for obj_name in payload.image_object_names]
            
            thumbnail_index = payload.thumbnail_index or 0
            if 0 <= thumbnail_index < len(image_urls):
                thumbnail = image_urls[thumbnail_index]
                detail_images = [url for i, url in enumerate(image_urls) if i != thumbnail_index]
            else:
                thumbnail = image_urls[0] if image_urls else None
                detail_images = image_urls[1:] if len(image_urls) > 1 else []
        
        if thumbnail and not thumbnail.startswith('http'):
            thumbnail = file_service.get_file_url(thumbnail)
        
        if detail_images:
            detail_images = [
                file_service.get_file_url(img) if not img.startswith('http') else img
                for img in detail_images
            ]
        
        product_data = payload.dict(exclude={'image_object_names', 'thumbnail_index'})
        product_data['thumbnail'] = thumbnail
        product_data['detail_images'] = detail_images if detail_images else None
        
        final_payload = ProductCreate(**product_data)
        
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
            # Convert object names to full URLs
            image_urls = [file_service.get_file_url(obj_name) for obj_name in image_object_names]
            
            if thumbnail_index is None or thumbnail_index < 0 or thumbnail_index >= len(image_urls):
                thumbnail_index = 0
            
            # Set thumbnail and remove it from detail_images
            update_data["thumbnail"] = image_urls[thumbnail_index]
            update_data["detail_images"] = [url for i, url in enumerate(image_urls) if i != thumbnail_index]
        
        # Convert existing thumbnail/detail_images to URLs if they're object names
        if "thumbnail" in update_data and update_data["thumbnail"] and not update_data["thumbnail"].startswith('http'):
            update_data["thumbnail"] = file_service.get_file_url(update_data["thumbnail"])
        
        if "detail_images" in update_data and update_data["detail_images"]:
            update_data["detail_images"] = [
                file_service.get_file_url(img) if not img.startswith('http') else img
                for img in update_data["detail_images"]
            ]

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
    """Delete product and associated images"""
    # Get product first to extract image URLs
    product = ProductService.get_product(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Collect all image URLs to delete
    image_urls = []
    
    if product.thumbnail:
        image_urls.append(product.thumbnail)
    
    if product.detail_images:
        if isinstance(product.detail_images, list):
            image_urls.extend(product.detail_images)
        elif isinstance(product.detail_images, str):
            image_urls.append(product.detail_images)
    
    # Extract object names from URLs
    object_names = []
    for url in image_urls:
        if url and url.startswith('http'):
            try:
                object_name = file_service.extract_object_name_from_url(url)
                if object_name:
                    object_names.append(object_name)
                else:
                    logger.warning(f"Could not extract object name from URL: {url}")
            except Exception as e:
                logger.error(f"Error extracting object name from URL {url}: {e}")
    
    # Batch delete all images from MinIO
    if object_names:
        result = file_service.delete_files_batch(object_names)
        if result['failed']:
            logger.warning(f"Failed to delete {len(result['failed'])} image files for product {product_id}")
        if result['deleted']:
            logger.info(f"Successfully deleted {len(result['deleted'])} image files for product {product_id}")
    
    # Delete product from database
    success = ProductService.delete_product(db, product_id=product_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")


