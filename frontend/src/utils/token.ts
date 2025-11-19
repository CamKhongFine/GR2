/**
 * Token utility functions for JWT handling and refresh
 */

interface TokenPayload {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decode JWT token without verification (client-side only)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if token is expired or will expire soon
 * @param token - JWT token string
 * @param bufferSeconds - Buffer time in seconds before expiry (default: 60 seconds)
 * @returns true if token is expired or will expire soon
 */
export function isTokenExpired(token: string, bufferSeconds: number = 60): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true; // Consider invalid token as expired
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  const expiryTime = payload.exp;
  
  // Token is expired if current time >= expiry time - buffer
  return currentTime >= (expiryTime - bufferSeconds);
}

/**
 * Get remaining time until token expires (in seconds)
 */
export function getTokenExpiryTime(token: string): number | null {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return null;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  const expiryTime = payload.exp;
  
  return Math.max(0, expiryTime - currentTime);
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    console.warn('No refresh token available');
    return null;
  }

  try {
    const KEYCLOAK_BASE_URL = import.meta.env.VITE_KEYCLOAK_BASE_URL || 'http://localhost:8080';
    const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'auction';
    const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'auction-web';

    const params = new URLSearchParams();
    params.append('client_id', KEYCLOAK_CLIENT_ID);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const response = await fetch(
      `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Token refresh failed:', error);
      
      // If refresh token is invalid, clear all tokens
      if (response.status === 401 || response.status === 400) {
        clearAuthTokens();
      }
      
      return null;
    }

    const tokenData = await response.json();
    
    if (tokenData.access_token) {
      // Store new tokens
      localStorage.setItem('access_token', tokenData.access_token);
      
      if (tokenData.refresh_token) {
        localStorage.setItem('refresh_token', tokenData.refresh_token);
      }
      
      return tokenData.access_token;
    }

    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearAuthTokens();
    return null;
  }
}

/**
 * Clear all authentication tokens
 */
export function clearAuthTokens(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_info');
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

/**
 * Get current refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

/**
 * Store tokens after login
 */
export function storeTokens(tokenData: {
  access_token: string;
  refresh_token?: string;
}): void {
  localStorage.setItem('access_token', tokenData.access_token);
  if (tokenData.refresh_token) {
    localStorage.setItem('refresh_token', tokenData.refresh_token);
  }
}

