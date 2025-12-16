import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for sending cookies
});

// Request interceptor to add token if available
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Token is stored in HttpOnly cookie, so we don't need to add it manually
        // But if you need to add it from localStorage/sessionStorage, you can do:
        // const token = localStorage.getItem('access_token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;

