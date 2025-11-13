"""
MinIO Service for file storage operations
"""
from minio import Minio
from minio.error import S3Error
from typing import Optional, List
from datetime import timedelta
import uuid
from pathlib import Path
from config.settings import settings
import logging

logger = logging.getLogger(__name__)


class MinioService:
    """Service for MinIO operations"""
    
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
    
    def upload_file(
        self,
        file_data: bytes,
        file_name: str,
        content_type: str = "application/octet-stream",
        folder: Optional[str] = None
    ) -> str:
        """
        Upload file to MinIO
        
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
    
    def get_presigned_upload_url(
        self,
        object_name: str,
        content_type: str = "application/octet-stream",
        expiry: Optional[int] = None
    ) -> str:
        """
        Get presigned URL for uploading
        
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
    
    def list_files(self, folder: Optional[str] = None, recursive: bool = True) -> List[str]:
        """
        List files in bucket
        
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


# Singleton instance
minio_service = MinioService()

