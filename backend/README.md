# Graduation Research Backend API

FastAPI backend cho dự án Graduation Research.

## Cấu trúc thư mục

```
backend/
├── api/                    # API routes và endpoints
│   ├── endpoints/         # Các endpoint cụ thể
│   │   ├── auth.py       # Authentication endpoints
│   │   └── users.py      # User management endpoints
│   ├── routes.py         # Main API router
│   └── __init__.py
├── config/               # Cấu hình ứng dụng
│   ├── settings.py       # Application settings
│   └── __init__.py
├── database/             # Database configuration
│   ├── connection.py     # Database connection và session
│   └── __init__.py
├── models/               # Database models và schemas
│   ├── user.py          # User model
│   ├── schemas.py       # Pydantic schemas
│   └── __init__.py
├── services/             # Business logic
│   ├── user_service.py  # User service
│   └── __init__.py
├── utils/                # Utility functions
│   ├── helpers.py       # Helper functions
│   └── __init__.py
├── tests/                # Test files
├── main.py              # Main application file
├── requirements.txt     # Python dependencies
└── env.example         # Environment variables example
```

## Cài đặt

1. **Tạo virtual environment:**
```bash
python -m venv venv
```

2. **Kích hoạt virtual environment:**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Cài đặt dependencies:**
```bash
pip install -r requirements.txt
```

4. **Cấu hình environment variables:**
```bash
# Copy file env.example thành .env
cp env.example .env

# Chỉnh sửa các giá trị trong .env theo nhu cầu
```

## Chạy ứng dụng

### Cách 1: Sử dụng python main.py (như yêu cầu)
```bash
python main.py
```

### Cách 2: Sử dụng uvicorn trực tiếp
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Sau khi chạy ứng dụng, bạn có thể truy cập:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **API Root:** http://localhost:8000/
- **Health Check:** http://localhost:8000/health

## API Endpoints

### Authentication
- `POST /api/v1/auth/token` - Login và lấy access token
- `GET /api/v1/auth/me` - Lấy thông tin user hiện tại

### Users
- `GET /api/v1/users/` - Lấy danh sách users
- `GET /api/v1/users/{user_id}` - Lấy thông tin user theo ID
- `POST /api/v1/users/` - Tạo user mới
- `PUT /api/v1/users/{user_id}` - Cập nhật user
- `DELETE /api/v1/users/{user_id}` - Xóa user

## Database

Ứng dụng sử dụng SQLite mặc định. Để chuyển sang PostgreSQL:

1. Cài đặt PostgreSQL
2. Cập nhật `DATABASE_URL` trong file `.env`:
```
DATABASE_URL=postgresql://user:password@localhost/dbname
```

## Development

### Chạy tests
```bash
pytest
```

### Code formatting
```bash
black .
isort .
```

### Linting
```bash
flake8
```

## Tính năng

- ✅ FastAPI framework
- ✅ SQLAlchemy ORM
- ✅ Pydantic validation
- ✅ JWT Authentication
- ✅ Password hashing với bcrypt
- ✅ CORS middleware
- ✅ Database models và schemas
- ✅ Service layer pattern
- ✅ Environment configuration
- ✅ API documentation tự động
- ✅ Health check endpoint

## Mở rộng

Để thêm tính năng mới:

1. Tạo model trong `models/`
2. Tạo schema trong `models/schemas.py`
3. Tạo service trong `services/`
4. Tạo endpoint trong `api/endpoints/`
5. Thêm route vào `api/routes.py`
