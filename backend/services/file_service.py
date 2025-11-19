"""
File Service for file storage operations
Handles MinIO operations and business logic
"""
from minio import Minio
from minio.error import S3Error
from minio.deleteobjects import DeleteObject
from typing import Optional, List
from datetime import timedelta
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
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


class FileService:
    """Service for file storage operations"""
    
    def __init__(self):
        """Initialize MinIO client"""
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created bucket: {self.bucket_name}")
        except S3Error as e:
            logger.error(f"Error ensuring bucket exists: {e}")
            raise
    
    def _validate_file_size(self, file_size: int) -> None:
        """Validate file size"""
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE / (1024 * 1024)}MB"
            )
    
    def _validate_content_type(self, content_type: str) -> None:
        """Validate content type"""
        allowed_types = [
            "image/jpeg", "image/jpg", "image/png", "image/gif", 
            "image/webp", "image/svg+xml"
        ]
        
        if not any(content_type.startswith(t.split("/")[0]) for t in allowed_types):
            if content_type not in allowed_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File type {content_type} not allowed. Allowed types: {', '.join(allowed_types)}"
                )
    
    def upload_file(
        self,
        file_data: bytes,
        file_name: str,
        content_type: str = "application/octet-stream",
        folder: Optional[str] = None
    ) -> str:
        """
        Upload file to MinIO (low-level method)
        
        Args:
            file_data: File content as bytes
            file_name: Original file name
            content_type: MIME type of the file
            folder: Optional folder path (e.g., 'products', 'avatars')
        
        Returns:
            Object name (path) in MinIO
        """
        try:
            # Generate unique file name
            file_ext = Path(file_name).suffix
            unique_name = f"{uuid.uuid4()}{file_ext}"
            
            # Construct object path
            if folder:
                object_name = f"{folder}/{unique_name}"
            else:
                object_name = unique_name
            
            # Upload file
            from io import BytesIO
            file_stream = BytesIO(file_data)
            file_size = len(file_data)
            
            self.client.put_object(
                self.bucket_name,
                object_name,
                file_stream,
                file_size,
                content_type=content_type
            )
            
            logger.info(f"Uploaded file: {object_name}")
            return object_name
            
        except S3Error as e:
            logger.error(f"Error uploading file: {e}")
            raise
    
    async def upload_file_with_validation(
        self,
        file: UploadFile,
        user_id: Optional[int] = None,
        folder: Optional[str] = None
    ) -> FileUploadResponse:
        """
        Upload a file with validation (business logic)
        
        Args:
            file: UploadFile from FastAPI
            user_id: Optional user ID for folder structure
            folder: Optional folder path
        
        Returns:
            FileUploadResponse with object name and URL
        """
        try:
            # Read file content
            file_content = await file.read()
            file_size = len(file_content)
            
            # Validate file size
            self._validate_file_size(file_size)
            
            # Validate content type
            content_type = file.content_type or "application/octet-stream"
            self._validate_content_type(content_type)
            
            # Determine folder structure
            if user_id and not folder:
                folder = f"images/{user_id}"
            elif not folder:
                folder = "images"
            
            # Upload file
            object_name = self.upload_file(
                file_data=file_content,
                file_name=file.filename or "unknown",
                content_type=content_type,
                folder=folder
            )
            
            # Generate full URL
            full_url = f"{settings.MINIO_PROTOCOL}://{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET_NAME}/{object_name}"
            
            return FileUploadResponse(
                object_name=object_name,
                presigned_url=full_url,
                file_name=file.filename or "unknown"
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file: {str(e)}"
            )
    
    async def upload_multiple_files(
        self,
        files: List[UploadFile],
        folder: Optional[str] = None
    ) -> List[FileUploadResponse]:
        """
        Upload multiple files with validation
        
        Args:
            files: List of UploadFile from FastAPI
            folder: Optional folder path
        
        Returns:
            List of FileUploadResponse
        """
        try:
            results = []
            
            for file in files:
                try:
                    # Read file content
                    file_content = await file.read()
                    file_size = len(file_content)
                    
                    # Skip oversized files
                    if file_size > settings.MAX_FILE_SIZE:
                        continue
                    
                    # Validate content type
                    allowed_types = [
                        "image/jpeg", "image/jpg", "image/png", "image/gif", 
                        "image/webp", "image/svg+xml"
                    ]
                    content_type = file.content_type or "application/octet-stream"
                    
                    if content_type not in allowed_types:
                        continue  # Skip invalid file types
                    
                    # Upload file
                    object_name = self.upload_file(
                        file_data=file_content,
                        file_name=file.filename or "unknown",
                        content_type=content_type,
                        folder=folder
                    )
                    
                    # Get presigned URL
                    presigned_url = self.get_presigned_url(object_name)
                    
                    results.append(FileUploadResponse(
                        object_name=object_name,
                        presigned_url=presigned_url,
                        file_name=file.filename or "unknown"
                    ))
                except Exception as e:
                    logger.error(f"Error uploading file {file.filename}: {e}")
                    continue  # Skip failed files
            
            return results
            
        except Exception as e:
            logger.error(f"Error uploading files: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload files: {str(e)}"
            )
    
    def get_presigned_url(
        self,
        object_name: str,
        expiry: Optional[int] = None
    ) -> str:
        """
        Get presigned URL for object
        
        Args:
            object_name: Object name (path) in MinIO
            expiry: Expiry time in seconds (default from settings)
        
        Returns:
            Presigned URL
        """
        try:
            if expiry is None:
                expiry = settings.MINIO_PRESIGNED_URL_EXPIRY
            
            url = self.client.presigned_get_object(
                self.bucket_name,
                object_name,
                expires=timedelta(seconds=expiry)
            )
            
            return url
            
        except S3Error as e:
            logger.error(f"Error generating presigned URL: {e}")
            raise
    
    def get_presigned_url_with_validation(
        self,
        object_name: str,
        expiry_seconds: Optional[int] = None
    ) -> PresignedUrlResponse:
        """
        Get presigned URL with validation (business logic)
        
        Args:
            object_name: Object name (path) in MinIO
            expiry_seconds: Optional expiry time in seconds
        
        Returns:
            PresignedUrlResponse
        """
        try:
            # Check if file exists
            if not self.file_exists(object_name):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="File not found"
                )
            
            presigned_url = self.get_presigned_url(
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
    
    def get_presigned_upload_url(
        self,
        object_name: str,
        content_type: str = "application/octet-stream",
        expiry: Optional[int] = None
    ) -> str:
        """
        Get presigned URL for uploading (low-level method)
        
        Args:
            object_name: Object name (path) in MinIO
            content_type: MIME type of the file
            expiry: Expiry time in seconds (default from settings)
        
        Returns:
            Presigned upload URL
        """
        try:
            if expiry is None:
                expiry = settings.MINIO_PRESIGNED_URL_EXPIRY
            
            url = self.client.presigned_put_object(
                self.bucket_name,
                object_name,
                expires=timedelta(seconds=expiry)
            )
            
            return url
            
        except S3Error as e:
            logger.error(f"Error generating presigned upload URL: {e}")
            raise
    
    def get_presigned_upload_url_with_validation(
        self,
        request: PresignedUploadUrlRequest,
        user_id: Optional[int] = None
    ) -> PresignedUploadUrlResponse:
        """
        Get presigned URL for uploading with validation (business logic)
        
        Args:
            request: PresignedUploadUrlRequest with file details
            user_id: Optional user ID for folder structure
        
        Returns:
            PresignedUploadUrlResponse
        """
        try:
            from pathlib import Path
            
            file_ext = Path(request.file_name).suffix
            unique_name = f"{uuid.uuid4()}{file_ext}"
            
            # Determine folder structure
            if user_id:
                object_name = f"images/{user_id}/{unique_name}"
            else:
                object_name = f"images/{unique_name}"
            
            presigned_url = self.get_presigned_upload_url(
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
    
    def delete_file(self, object_name: str) -> bool:
        """
        Delete file from MinIO
        
        Args:
            object_name: Object name (path) in MinIO
        
        Returns:
            True if successful, False otherwise
        """
        try:
            self.client.remove_object(self.bucket_name, object_name)
            logger.info(f"Deleted file: {object_name}")
            return True
        except S3Error as e:
            logger.error(f"Error deleting file: {e}")
            return False
    
    def delete_file_with_validation(self, object_name: str) -> None:
        """
        Delete file with validation (business logic)
        
        Args:
            object_name: Object name (path) in MinIO
        
        Raises:
            HTTPException if file not found or deletion fails
        """
        try:
            success = self.delete_file(object_name)
            
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="File not found or failed to delete"
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete file: {str(e)}"
            )
    
    def delete_files_batch(self, object_names: List[str]) -> dict:
        """
        Delete multiple files from MinIO in batch
        
        Args:
            object_names: List of object names (paths) in MinIO
        
        Returns:
            Dictionary with 'deleted' (list of successfully deleted) and 'failed' (list of failed)
        """
        if not object_names:
            logger.debug("Batch delete called with empty object_names list")
            return {'deleted': [], 'failed': []}
        
        if not isinstance(object_names, list):
            logger.error(f"Invalid object_names type: {type(object_names)}, expected list")
            return {'deleted': [], 'failed': []}
        
        deleted = []
        failed = {}
        
        try:
            delete_objects = [DeleteObject(obj_name) for obj_name in object_names if obj_name]
            
            if not delete_objects:
                invalid_names = [name for name in object_names if not name or not isinstance(name, str)]
                logger.warning(f"No valid object names to delete after filtering. Invalid: {len(invalid_names)}")
                return {'deleted': [], 'failed': invalid_names}
            
            errors_iter = self.client.remove_objects(self.bucket_name, delete_objects)
            
            for result in errors_iter:
                error = result.get() if hasattr(result, 'get') else result
                if error:
                    object_name = getattr(error, 'object_name', None)
                    error_code = getattr(error, 'error_code', 'Unknown')
                    error_message = getattr(error, 'error_message', 'No message')
                    
                    if object_name:
                        failed[object_name] = {
                            'code': error_code,
                            'message': error_message
                        }
                        logger.warning(
                            f"Failed to delete file '{object_name}': "
                            f"code={error_code}, message={error_message}"
                        )
                    else:
                        logger.error(f"Delete error missing object_name: {error}")
            
            invalid_names = []
            for obj_name in object_names:
                if not obj_name or not isinstance(obj_name, str):
                    invalid_names.append(obj_name if obj_name else '')
                    continue
                    
                if obj_name not in failed:
                    deleted.append(obj_name)
                    logger.debug(f"Successfully deleted file: {obj_name}")
            
            failed_list = list(failed.keys()) + invalid_names
            
            if deleted:
                logger.info(f"Batch delete completed: {len(deleted)} deleted, {len(failed_list)} failed")
            if failed_list:
                logger.warning(f"Batch delete had {len(failed_list)} failures out of {len(object_names)} total")
            
            return {'deleted': deleted, 'failed': failed_list}
            
        except S3Error as e:
            logger.error(f"S3Error in batch delete operation: {e}", exc_info=True)
            return {'deleted': [], 'failed': [name for name in object_names if name]}
        except Exception as e:
            logger.error(f"Unexpected error in batch delete: {type(e).__name__}: {e}", exc_info=True)
            return {'deleted': [], 'failed': [name for name in object_names if name]}
    
    def file_exists(self, object_name: str) -> bool:
        """
        Check if file exists in MinIO
        
        Args:
            object_name: Object name (path) in MinIO
        
        Returns:
            True if file exists, False otherwise
        """
        try:
            self.client.stat_object(self.bucket_name, object_name)
            return True
        except S3Error:
            return False
    
    def check_file_exists_with_validation(self, object_name: str) -> FileExistsResponse:
        """
        Check if file exists with validation (business logic)
        
        Args:
            object_name: Object name (path) in MinIO
        
        Returns:
            FileExistsResponse
        """
        try:
            exists = self.file_exists(object_name)
            return FileExistsResponse(exists=exists, object_name=object_name)
        except Exception as e:
            logger.error(f"Error checking file existence: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to check file existence: {str(e)}"
            )
    
    def list_files(self, folder: Optional[str] = None, recursive: bool = True) -> List[str]:
        """
        List files in bucket (low-level method)
        
        Args:
            folder: Optional folder prefix
            recursive: Whether to list recursively
        
        Returns:
            List of object names
        """
        try:
            objects = self.client.list_objects(
                self.bucket_name,
                prefix=folder if folder else "",
                recursive=recursive
            )
            return [obj.object_name for obj in objects]
        except S3Error as e:
            logger.error(f"Error listing files: {e}")
            return []
    
    def list_files_with_validation(
        self,
        folder: Optional[str] = None,
        recursive: bool = True
    ) -> FileListResponse:
        """
        List files with validation (business logic)
        
        Args:
            folder: Optional folder prefix
            recursive: Whether to list recursively
        
        Returns:
            FileListResponse
        """
        try:
            files = self.list_files(folder=folder, recursive=recursive)
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
    
    def get_file_url(self, object_name: str) -> str:
        protocol = settings.MINIO_PROTOCOL
        endpoint = settings.MINIO_ENDPOINT
        bucket = self.bucket_name
        
        if endpoint.startswith('http://') or endpoint.startswith('https://'):
            from urllib.parse import urlparse
            parsed = urlparse(endpoint)
            endpoint = parsed.netloc or parsed.path
        
        return f"{protocol}://{endpoint}/{bucket}/{object_name}"
    
    def extract_object_name_from_url(self, url: str) -> Optional[str]:
        """
        Extract object name from full URL
        
        Args:
            url: Full URL like http://<MINIO_ENDPOINT>/<BUCKET_NAME>/<object_name>
        
        Returns:
            Object name (path) in MinIO, or None if URL format is invalid
        """
        try:
            from urllib.parse import urlparse
            
            parsed = urlparse(url)
            path = parsed.path
            
            # Remove leading slash
            if path.startswith('/'):
                path = path[1:]
            
            # Remove bucket name from path
            # Format: <bucket>/<object_name>
            if path.startswith(f"{self.bucket_name}/"):
                object_name = path[len(f"{self.bucket_name}/"):]
                return object_name
            
            # If path doesn't start with bucket name, assume it's just the object name
            # (for backward compatibility)
            return path if path else None
            
        except Exception as e:
            logger.error(f"Error extracting object name from URL {url}: {e}")
            return None


# Singleton instance
file_service = FileService()

