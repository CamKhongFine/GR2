import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { isTokenExpired, refreshAccessToken, getAccessToken, clearAuthTokens } from './token';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor for adding auth tokens and checking expiry
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get current token
    let token = getAccessToken();
    
    if (token) {
      // Check if token is expired or will expire soon
      if (isTokenExpired(token)) {
        // Token is expired, try to refresh
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            const newToken = await refreshAccessToken();
            
            if (newToken) {
              token = newToken;
              processQueue(null, newToken);
            } else {
              // Refresh failed, clear tokens and redirect to login
              clearAuthTokens();
              const refreshError = new Error('Token refresh failed') as AxiosError;
              processQueue(refreshError, null);
              
              // Redirect to login page
              if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                window.location.href = '/login';
              }
              
              return Promise.reject(new Error('Token refresh failed'));
            }
          } catch (error) {
            clearAuthTokens();
            processQueue(error as AxiosError, null);
            
            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
              window.location.href = '/login';
            }
            
            return Promise.reject(error);
          } finally {
            isRefreshing = false;
          }
        } else {
          // Already refreshing, wait for it to complete
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              if (config.headers) {
                config.headers.Authorization = `Bearer ${newToken}`;
              }
              return config;
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }
      }
      
      // Add token to header
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - token might be expired
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // If we're already refreshing, wait for it
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          processQueue(null, newToken);

          // Retry the original request
          return api(originalRequest);
        } else {
          // Refresh failed
          clearAuthTokens();
          const refreshError = new Error('Token refresh failed') as AxiosError;
          processQueue(refreshError, null);

          // Redirect to login
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }

          return Promise.reject(error);
        }
      } catch (refreshError) {
        clearAuthTokens();
        processQueue(refreshError as AxiosError, null);

        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default api;
