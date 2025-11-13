# MinIO Setup Guide

## Overview
This project uses MinIO for object storage. MinIO is an S3-compatible object storage service that can be used for storing files like images, documents, etc.

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install and run MinIO server (using Docker):
```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

Or download MinIO binary from https://min.io/download

## Configuration

Add the following environment variables to your `.env` file:

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_SECURE=false
MINIO_BUCKET_NAME=auction-images
MINIO_PRESIGNED_URL_EXPIRY=3600
```

### Environment Variables

- `MINIO_ENDPOINT`: MinIO server endpoint (default: `localhost:9000`)
- `MINIO_ACCESS_KEY`: Access key for MinIO (default: `minioadmin`)
- `MINIO_SECRET_KEY`: Secret key for MinIO (default: `minioadmin`)
- `MINIO_SECURE`: Use HTTPS (default: `false`)
- `MINIO_BUCKET_NAME`: Bucket name for storing files (default: `auction-images`)
- `MINIO_PRESIGNED_URL_EXPIRY`: Presigned URL expiry time in seconds (default: `3600` = 1 hour)

## API Endpoints

### Upload File
```http
POST /api/v1/files/upload
Content-Type: multipart/form-data

file: [binary]
folder: products (optional)
```

Response:
```json
{
  "object_name": "products/uuid.jpg",
  "presigned_url": "http://localhost:9000/...",
  "file_name": "image.jpg"
}
```

### Upload Multiple Files
```http
POST /api/v1/files/upload/multiple
Content-Type: multipart/form-data

files: [binary, binary, ...]
folder: products (optional)
```

### Get Presigned URL
```http
GET /api/v1/files/presigned-url/{object_name}?expiry_seconds=3600
```

Response:
```json
{
  "presigned_url": "http://localhost:9000/...",
  "object_name": "products/uuid.jpg",
  "expiry_seconds": 3600
}
```

### Get Presigned Upload URL (Client-side upload)
```http
POST /api/v1/files/presigned-upload-url
Content-Type: application/json

{
  "file_name": "image.jpg",
  "content_type": "image/jpeg",
  "folder": "products",
  "expiry_seconds": 3600
}
```

Response:
```json
{
  "presigned_url": "http://localhost:9000/...",
  "object_name": "products/uuid.jpg",
  "expiry_seconds": 3600
}
```

### Delete File
```http
DELETE /api/v1/files/{object_name}
```

### Check File Exists
```http
GET /api/v1/files/exists/{object_name}
```

Response:
```json
{
  "exists": true,
  "object_name": "products/uuid.jpg"
}
```

### List Files
```http
GET /api/v1/files/list?folder=products&recursive=true
```

Response:
```json
{
  "files": ["products/uuid1.jpg", "products/uuid2.jpg"],
  "count": 2,
  "folder": "products"
}
```

## Usage Examples

### Python (Backend)
```python
from services.minio_service import minio_service

# Upload file
with open("image.jpg", "rb") as f:
    file_data = f.read()
    object_name = minio_service.upload_file(
        file_data=file_data,
        file_name="image.jpg",
        content_type="image/jpeg",
        folder="products"
    )

# Get presigned URL
presigned_url = minio_service.get_presigned_url(object_name)

# Delete file
minio_service.delete_file(object_name)
```

### JavaScript/TypeScript (Frontend)
```typescript
// Upload file
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'products');

const response = await fetch('/api/v1/files/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.presigned_url);

// Or use presigned URL for direct upload
const uploadResponse = await fetch('/api/v1/files/presigned-upload-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    file_name: file.name,
    content_type: file.type,
    folder: 'products'
  })
});

const { presigned_url, object_name } = await uploadResponse.json();

// Upload directly to MinIO
await fetch(presigned_url, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
});
```

## Notes

- The bucket will be created automatically if it doesn't exist
- File names are automatically generated using UUID to prevent conflicts
- Presigned URLs expire after the configured time (default: 1 hour)
- Maximum file size is controlled by `MAX_FILE_SIZE` in settings (default: 10MB)
- Only image types are allowed by default (can be modified in `files.py`)

