"""
Application Settings
"""
from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

class Settings(BaseSettings):
    """Application settings"""
    
    # App settings
    APP_NAME: str = "Graduation Research API"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000    
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # File upload settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Keycloak settings
    KEYCLOAK_ISSUER: str = "http://localhost:8080/realms/auction"
    KEYCLOAK_JWKS_URL: str = "http://localhost:8080/realms/auction/protocol/openid-connect/certs"
    KEYCLOAK_CLIENT_ID: str = "account"
    KEYCLOAK_BASE_URL: str = "http://localhost:8080"
    KEYCLOAK_REALM: str = "auction"
    # Keycloak Admin settings (for user registration)
    KEYCLOAK_ADMIN_USERNAME: str = os.getenv("KEYCLOAK_ADMIN_USERNAME", "admin")
    KEYCLOAK_ADMIN_PASSWORD: str = os.getenv("KEYCLOAK_ADMIN_PASSWORD", "admin")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Tạo thư mục uploads nếu chưa tồn tại
def create_upload_dir():
    """Create upload directory if it doesn't exist"""
    upload_path = Path(Settings().UPLOAD_DIR)
    upload_path.mkdir(exist_ok=True)

# Khởi tạo settings
settings = Settings()
create_upload_dir()
