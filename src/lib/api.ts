// lib/api.ts
import axios from 'axios';

// Set your backend base URL using an environment variable
// Make sure NEXT_PUBLIC_BACKEND_URL is set in your .env.local file
// e.g., NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add the Authorization header to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle specific HTTP errors, e.g., 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 Unauthorized and it's not a retry (to prevent infinite loops)
    if (error.response?.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true; // Mark as retried
      // This is where you'd typically refresh tokens if you had that mechanism.
      // For now, if the token is invalid, we'll clear it and log the user out.
      
      // We can't directly use useRouter here as this is a global interceptor.
      // The best approach is to let the component catch the error and handle the logout/redirect.
      // However, for immediate cleanup:
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.warn("Authentication token expired or invalid. User logged out.");
      // You might want to dispatch an event or use a global state manager (like Zustand/Redux)
      // to signal a logout to components, which can then trigger a useRouter redirect.
    }
    return Promise.reject(error);
  }
);

export default api;