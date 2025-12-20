// utils/api.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
    baseURL: (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000') + '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            // Check if token is expired
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decoded.exp < currentTime) {
                    // Token expired
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(new Error('Token expired'));
                }

                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - redirect to login
                    localStorage.clear();
                    window.location.href = '/login';
                    break;

                case 403:
                    // Forbidden
                    console.error('Access forbidden:', data.message);
                    break;

                case 404:
                    // Not found
                    console.error('Resource not found:', data.message);
                    break;

                case 500:
                    // Server error
                    console.error('Server error:', data.message);
                    break;

                default:
                    console.error('API error:', data.message);
            }
        } else if (error.request) {
            // Request made but no response
            console.error('Network error: No response from server');
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

// Helper functions
export const apiHelper = {
    // GET request
    get: async (url, config = {}) => {
        try {
            const response = await api.get(url, config);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    },

    // POST request
    post: async (url, data, config = {}) => {
        try {
            const response = await api.post(url, data, config);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    },

    // PUT request
    put: async (url, data, config = {}) => {
        try {
            const response = await api.put(url, data, config);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    },

    // DELETE request
    delete: async (url, config = {}) => {
        try {
            const response = await api.delete(url, config);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }
};

export default api;
