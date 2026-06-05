import axios from 'axios';

// API base URL
// Ref: https://axios-http.com/docs/instance
// Note: In production, set REACT_APP_API_URL in .env file to your backend URL
const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor — attach JWT token
// Ref: https://axios-http.com/docs/interceptors
// Note: This will automatically add the Authorization header to all requests if a token is present in localStorage
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor — handle 401
// Note: If the backend returns a 401 Unauthorized response, we assume the token is invalid/expired and log the user out by clearing localStorage and redirecting to login page
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        // For other errors, we can optionally show a toast notification here (not implemented in this snippet)
        return Promise.reject(error);
    }
);

// Auth endpoints
// Ref: https://axios-http.com/docs/api_intro
export const authAPI = {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
    getMe: () => API.get('/auth/me'),
    updateProfile: (data) => API.put('/auth/profile', data),
};

// Property endpoints
// Ref: https://axios-http.com/docs/api_intro
export const propertyAPI = {
    getAll: (params) => API.get('/properties', { params }),
    getOne: (id) => API.get(`/properties/${id}`),
    create: (data) => API.post('/properties', data),
    update: (id, data) => API.put(`/properties/${id}`, data),
    delete: (id) => API.delete(`/properties/${id}`),
    getMyListings: () => API.get('/properties/my-listings'),
};

// Review endpoints
// Ref: https://axios-http.com/docs/api_intro
export const reviewAPI = {
    getAll: (propertyId) => API.get(`/reviews/${propertyId}`),
    add: (propertyId, data) => API.post(`/reviews/${propertyId}`, data),
    delete: (id) => API.delete(`/reviews/${id}`),
};

// Bookmark endpoints
export const bookmarkAPI = {
    getAll: () => API.get('/bookmarks'),
    add: (propertyId) => API.post(`/bookmarks/${propertyId}`),
    remove: (propertyId) => API.delete(`/bookmarks/${propertyId}`),
};

export default API;