"""
Authentication Endpoints
"""
import requests
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from auth import get_current_user
from schemas import User
from schemas import SignUpRequest, UserCreate
from services.user_service import UserService
from config.settings import settings

router = APIRouter()


def get_keycloak_admin_token() -> str:
    """
    Get admin access token from Keycloak for admin operations.
    """
    url = f"{settings.KEYCLOAK_BASE_URL}/realms/master/protocol/openid-connect/token"
    data = {
        "grant_type": "password",
        "client_id": "admin-cli",
        "username": settings.KEYCLOAK_ADMIN_USERNAME,
        "password": settings.KEYCLOAK_ADMIN_PASSWORD,
    }
    
    try:
        response = requests.post(url, data=data, timeout=10)
        response.raise_for_status()
        token_data = response.json()
        return token_data["access_token"]
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to get Keycloak admin token: {str(e)}"
        )


@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Protected endpoint to get current authenticated user information.
    Auto-provisions user if doesn't exist in local DB.
    Returns current user information.
    """
    return {
        "id": current_user.id,
        "sub": current_user.keycloak_sub,
        "username": current_user.username,
        "balance": float(current_user.balance),
        "rating": float(current_user.rating),
        "is_banned": current_user.is_banned,
        "is_seller_verified": current_user.is_seller_verified,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "updated_at": current_user.updated_at.isoformat() if current_user.updated_at else None,
    }


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(signup_data: SignUpRequest, db: Session = Depends(get_db)):
    """
    Create a new user in Keycloak and local DB.
    
    Flow:
    1. Create user in Keycloak using admin API
    2. Set user password
    3. Enable user account
    4. Create user record in local DB with keycloak_sub and username
    """
    admin_token = get_keycloak_admin_token()
    
    # Prepare user data for Keycloak
    user_data = {
        "username": signup_data.username,
        "firstName": signup_data.username,
        "lastName": signup_data.username,
        "enabled": True,
        "emailVerified": False,
    }
    
    if signup_data.email:
        user_data["email"] = signup_data.email
    
    # Create user in Keycloak
    create_user_url = f"{settings.KEYCLOAK_BASE_URL}/admin/realms/{settings.KEYCLOAK_REALM}/users"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json",
    }
    
    try:
        # Create user in Keycloak
        create_response = requests.post(create_user_url, json=user_data, headers=headers, timeout=10)
        
        if create_response.status_code == 409:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists"
            )
        
        create_response.raise_for_status()
        
        # Get user ID (keycloak_sub) from Location header
        location = create_response.headers.get("Location")
        if not location:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get user ID from Keycloak"
            )
        
        # Extract user ID from location (format: .../users/{user-id})
        # This user_id is the keycloak_sub (UUID of user in Keycloak)
        keycloak_sub = location.split("/")[-1]
        
        # Set user password
        set_password_url = f"{settings.KEYCLOAK_BASE_URL}/admin/realms/{settings.KEYCLOAK_REALM}/users/{keycloak_sub}/reset-password"
        password_data = {
            "type": "password",
            "value": signup_data.password,
            "temporary": False,
        }
        
        password_response = requests.put(set_password_url, json=password_data, headers=headers, timeout=10)
        password_response.raise_for_status()
        
        # Get user to retrieve current data
        get_user_url = f"{settings.KEYCLOAK_BASE_URL}/admin/realms/{settings.KEYCLOAK_REALM}/users/{keycloak_sub}"
        get_user_response = requests.get(get_user_url, headers=headers, timeout=10)
        get_user_response.raise_for_status()

        # Create user in local DB
        try:
            user_create = UserCreate(
                keycloak_sub=keycloak_sub,
                username=signup_data.username
            )
            local_user = UserService.create_user(db, user_create)
            
            return {
                "message": "User created successfully",
                "username": signup_data.username,
                "keycloak_sub": keycloak_sub,
                "local_user_id": local_user.id,
            }
        except Exception as db_error:
            # If DB creation fails, user is still created in Keycloak
            # This is acceptable - user can be auto-provisioned on first login
            return {
                "message": "User created in Keycloak successfully",
                "username": signup_data.username,
                "keycloak_sub": keycloak_sub,
                "warning": "Local DB creation failed, user will be auto-provisioned on first login"
            }
        
    except requests.HTTPError as e:
        if e.response.status_code == 409:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user in Keycloak: {str(e)}"
        )
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Keycloak service unavailable: {str(e)}"
        )

