"""
File Upload Endpoints
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from typing import List, Optional
from services.minio_service import minio_service
from config.settings import settings
from schemas import (
    FileUploadResponse,
    PresignedUrlResponse,
    PresignedUploadUrlRequest,
    PresignedUploadUrlResponse,
    FileExistsResponse,
    FileListResponse
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    folder: Optional[str] = None
):
    """
    Upload a file to MinIO
    
    - **file**: File to upload
    - **folder**: Optional folder path (e.g., 'products', 'avatars')
    """
    try:
        # Validate file size
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE / (1024 * 1024)}MB"
            )
        
        # Validate content type (allow images)
        allowed_types = [
            "image/jpeg", "image/jpg", "image/png", "image/gif", 
            "image/webp", "image/svg+xml"
        ]
        content_type = file.content_type or "application/octet-stream"
        
        if not any(content_type.startswith(t.split("/")[0]) for t in allowed_types):
            if content_type not in allowed_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File type {content_type} not allowed. Allowed types: {', '.join(allowed_types)}"
                )
        
        # Upload file
        object_name = minio_service.upload_file(
            file_data=file_content,
            file_name=file.filename or "unknown",
            content_type=content_type,
            folder=folder
        )
        
        # Get presigned URL
        presigned_url = minio_service.get_presigned_url(object_name)
        
        return FileUploadResponse(
            object_name=object_name,
            presigned_url=presigned_url,
            file_name=file.filename or "unknown"
        )
        
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )


@router.post("/upload/multiple", response_model=List[FileUploadResponse], status_code=status.HTTP_201_CREATED)
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    folder: Optional[str] = None
):
    """
    Upload multiple files to MinIO
    
    - **files**: List of files to upload
    - **folder**: Optional folder path (e.g., 'products', 'avatars')
    """
    try:
        results = []
        
        for file in files:
            # Validate file size
            file_content = await file.read()
            file_size = len(file_content)
            
            if file_size > settings.MAX_FILE_SIZE:
                continue  # Skip oversized files
            
            # Validate content type
            allowed_types = [
                "image/jpeg", "image/jpg", "image/png", "image/gif", 
                "image/webp", "image/svg+xml"
            ]
            content_type = file.content_type or "application/octet-stream"
            
            if content_type not in allowed_types:
                continue  # Skip invalid file types
            
            # Upload file
            object_name = minio_service.upload_file(
                file_data=file_content,
                file_name=file.filename or "unknown",
                content_type=content_type,
                folder=folder
            )
            
            # Get presigned URL
            presigned_url = minio_service.get_presigned_url(object_name)
            
            results.append(FileUploadResponse(
                object_name=object_name,
                presigned_url=presigned_url,
                file_name=file.filename or "unknown"
            ))
        
        return results
        
    except Exception as e:
        logger.error(f"Error uploading files: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload files: {str(e)}"
        )


@router.get("/presigned-url/{object_name:path}", response_model=PresignedUrlResponse)
async def get_presigned_url(
    object_name: str,
    expiry_seconds: Optional[int] = None
):
    """
    Get presigned URL for an existing file
    
    - **object_name**: Object name (path) in MinIO
    - **expiry_seconds**: Optional expiry time in seconds (default from settings)
    """
    try:
        # Check if file exists
        if not minio_service.file_exists(object_name):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        presigned_url = minio_service.get_presigned_url(
            object_name,
            expiry=expiry_seconds
        )
        
        expiry = expiry_seconds or settings.MINIO_PRESIGNED_URL_EXPIRY
        
        return PresignedUrlResponse(
            presigned_url=presigned_url,
            object_name=object_name,
            expiry_seconds=expiry
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting presigned URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get presigned URL: {str(e)}"
        )


@router.post("/presigned-upload-url", response_model=PresignedUploadUrlResponse)
async def get_presigned_upload_url(
    request: PresignedUploadUrlRequest
):
    """
    Get presigned URL for uploading a file (client-side upload)
    
    - **file_name**: Name of the file to upload
    - **content_type**: MIME type of the file
    - **folder**: Optional folder path
    - **expiry_seconds**: Optional expiry time in seconds
    """
    try:
        from pathlib import Path
        import uuid
        
        # Generate unique object name
        file_ext = Path(request.file_name).suffix
        unique_name = f"{uuid.uuid4()}{file_ext}"
        
        if request.folder:
            object_name = f"{request.folder}/{unique_name}"
        else:
            object_name = unique_name
        
        presigned_url = minio_service.get_presigned_upload_url(
            object_name,
            content_type=request.content_type,
            expiry=request.expiry_seconds
        )
        
        expiry = request.expiry_seconds or settings.MINIO_PRESIGNED_URL_EXPIRY
        
        return PresignedUploadUrlResponse(
            presigned_url=presigned_url,
            object_name=object_name,
            expiry_seconds=expiry
        )
        
    except Exception as e:
        logger.error(f"Error getting presigned upload URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get presigned upload URL: {str(e)}"
        )


@router.delete("/{object_name:path}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(object_name: str):
    """
    Delete a file from MinIO
    
    - **object_name**: Object name (path) in MinIO
    """
    try:
        success = minio_service.delete_file(object_name)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found or failed to delete"
            )
        
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content=None)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )


@router.get("/exists/{object_name:path}", response_model=FileExistsResponse)
async def check_file_exists(object_name: str):
    """
    Check if a file exists in MinIO
    
    - **object_name**: Object name (path) in MinIO
    """
    try:
        exists = minio_service.file_exists(object_name)
        return FileExistsResponse(exists=exists, object_name=object_name)
    except Exception as e:
        logger.error(f"Error checking file existence: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check file existence: {str(e)}"
        )


@router.get("/list", response_model=FileListResponse)
async def list_files(
    folder: Optional[str] = None,
    recursive: bool = True
):
    """
    List files in MinIO bucket
    
    - **folder**: Optional folder prefix
    - **recursive**: Whether to list recursively
    """
    try:
        files = minio_service.list_files(folder=folder, recursive=recursive)
        return FileListResponse(
            files=files,
            count=len(files),
            folder=folder
        )
    except Exception as e:
        logger.error(f"Error listing files: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list files: {str(e)}"
        )

