"""
File Upload Endpoints
"""
from fastapi import APIRouter, UploadFile, File, Depends, status
from fastapi.responses import JSONResponse
from typing import List, Optional
from services.file_service import file_service
from auth import get_current_user
from schemas import (
    User,
    FileUploadResponse,
    PresignedUrlResponse,
    PresignedUploadUrlRequest,
    PresignedUploadUrlResponse,
    FileExistsResponse,
    FileListResponse
)

router = APIRouter()


@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a file to MinIO
    
    - **file**: File to upload
    """
    return await file_service.upload_file_with_validation(
        file=file,
        user_id=current_user.id
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
    return await file_service.upload_multiple_files(
        files=files,
        folder=folder
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
    return file_service.get_presigned_url_with_validation(
        object_name=object_name,
        expiry_seconds=expiry_seconds
    )


@router.post("/presigned-upload-url", response_model=PresignedUploadUrlResponse)
async def get_presigned_upload_url(
    request: PresignedUploadUrlRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get presigned URL for uploading a file (client-side upload)
    
    - **file_name**: Name of the file to upload
    - **content_type**: MIME type of the file
    - **folder**: Optional folder path (ignored for this template)
    - **expiry_seconds**: Optional expiry time in seconds
    """
    return file_service.get_presigned_upload_url_with_validation(
        request=request,
        user_id=current_user.id
    )


@router.delete("/{object_name:path}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(object_name: str):
    """
    Delete a file from MinIO
    
    - **object_name**: Object name (path) in MinIO
    """
    file_service.delete_file_with_validation(object_name)
    return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content=None)


@router.get("/exists/{object_name:path}", response_model=FileExistsResponse)
async def check_file_exists(object_name: str):
    """
    Check if a file exists in MinIO
    
    - **object_name**: Object name (path) in MinIO
    """
    return file_service.check_file_exists_with_validation(object_name)


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
    return file_service.list_files_with_validation(
        folder=folder,
        recursive=recursive
    )
