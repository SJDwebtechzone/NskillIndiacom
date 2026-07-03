import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    // Only access localStorage if in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor to handle common errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (e.g., redirect to login)
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
