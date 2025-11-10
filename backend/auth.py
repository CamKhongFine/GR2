"""
Keycloak JWT Authentication
"""
import jwt
import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
import json
import base64

from database.connection import get_db
from models.user import User
from services.user_service import UserService
from config.settings import settings

# Security scheme
security = HTTPBearer()

# Cache for JWKS
_jwks_cache: Optional[dict] = None


def get_jwks() -> dict:
    """
    Fetch JWKS from Keycloak and cache in memory.
    Returns the JWKS keys dictionary.
    """
    global _jwks_cache
    
    if _jwks_cache is not None:
        return _jwks_cache
    
    try:
        response = requests.get(settings.KEYCLOAK_JWKS_URL, timeout=10)
        response.raise_for_status()
        _jwks_cache = response.json()
        return _jwks_cache
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch JWKS from Keycloak: {str(e)}"
        )


def jwk_to_pem(jwk_dict: dict) -> str:
    """
    Convert JWK (JSON Web Key) to PEM format for PyJWT.
    """
    from cryptography.hazmat.primitives.asymmetric import rsa
    
    def decode_base64url(value: str) -> bytes:
        """Decode base64url string to bytes"""
        # Add padding if needed
        padding = 4 - len(value) % 4
        if padding != 4:
            value += '=' * padding
        return base64.urlsafe_b64decode(value)
    
    # Extract key components
    n_bytes = decode_base64url(jwk_dict['n'])
    e_bytes = decode_base64url(jwk_dict['e'])
    
    n = int.from_bytes(n_bytes, 'big')
    e = int.from_bytes(e_bytes, 'big')
    
    # Create RSA public key
    public_key = rsa.RSAPublicNumbers(e, n).public_key(default_backend())
    
    # Serialize to PEM
    pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    return pem.decode('utf-8')


def get_signing_key(token: str) -> str:
    """
    Get the signing key from JWKS based on the token's kid (key ID).
    Returns the public key in PEM format.
    """
    jwks = get_jwks()
    
    try:
        # Decode token header without verification to get kid
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing key ID (kid)"
            )
        
        # Find the key with matching kid
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                # Convert JWK to PEM
                return jwk_to_pem(key)
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unable to find signing key with kid: {kid}"
        )
    except jwt.DecodeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format"
        )


def verify_token(token: str) -> dict:
    """
    Verify JWT token signature, issuer, and audience.
    Returns the decoded payload.
    """
    try:
        # Get signing key in PEM format
        public_key_pem = get_signing_key(token)
        
        # Verify and decode token
        payload = jwt.decode(
            token,
            public_key_pem,
            algorithms=["RS256"],
            issuer=settings.KEYCLOAK_ISSUER,
            audience=settings.KEYCLOAK_CLIENT_ID,
            options={
                "verify_signature": True,
                "verify_iss": True,
                "verify_aud": True,
                "verify_exp": True,
            }
        )
        
        return payload
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidIssuerError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer"
        )
    except jwt.InvalidAudienceError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token audience"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


def get_or_create_user(db: Session, keycloak_sub: str, username: str = None) -> User:
    """
    Get user by keycloak_sub, or create if doesn't exist (auto-provision).
    """
    user = UserService.get_user_by_keycloak_sub(db, keycloak_sub=keycloak_sub)
    
    if user is None:
        # Auto-provision: create new user
        from models.schemas import UserCreate
        user_create = UserCreate(keycloak_sub=keycloak_sub, username=username)
        user = UserService.create_user(db, user_create)
    
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user from Keycloak JWT token.
    
    Steps:
    1. Extract Bearer token from Authorization header
    2. Verify JWT signature using Keycloak JWKS
    3. Verify issuer and audience
    4. Extract 'sub' from payload
    5. Get or create user in local DB
    6. Return User model instance
    """
    token = credentials.credentials
    
    # Verify token and get payload
    payload = verify_token(token)
    
    # Extract sub (subject) from token
    keycloak_sub = payload.get("sub")
    if not keycloak_sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing 'sub' claim"
        )
    
    # Try to get username from token (preferred_username or username claim)
    username = payload.get("preferred_username") or payload.get("username")
    
    # Get or create user in local database
    user = get_or_create_user(db, keycloak_sub=keycloak_sub, username=username)
    
    return user

