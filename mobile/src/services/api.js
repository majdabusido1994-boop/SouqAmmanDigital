import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor - attach token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. Please try again.';
    } else if (!error.response) {
      message = 'Cannot connect to server. Check your connection.';
    }
    return Promise.reject(new Error(message));
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  savePushToken: (token) => api.put('/auth/push-token', { token }),
  googleLogin: (data) => api.post('/auth/google', data),
};

// Products
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  like: (id) => api.post(`/products/${id}/like`),
  uploadImages: (id, formData) =>
    api.post(`/products/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Shops
export const shopsAPI = {
  getAll: (params) => api.get('/shops', { params }),
  getById: (id) => api.get(`/shops/${id}`),
  getMine: () => api.get('/shops/mine'),
  create: (data) => api.post('/shops', data),
  update: (id, data) => api.put(`/shops/${id}`, data),
  follow: (id) => api.post(`/shops/${id}/follow`),
  uploadImage: (id, formData) =>
    api.post(`/shops/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Messages
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId) => api.get(`/messages/${userId}`),
  send: (userId, data) => api.post(`/messages/${userId}`, data),
};

// Orders
export const ordersAPI = {
  getAll: (role) => api.get('/orders', { params: { role } }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// Reviews
export const reviewsAPI = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  getByShop: (shopId) => api.get(`/reviews/shop/${shopId}`),
  create: (productId, data) => api.post(`/reviews/product/${productId}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  // Shops
  getShops: (params) => api.get('/admin/shops', { params }),
  updateShop: (id, data) => api.put(`/admin/shops/${id}`, data),
  deleteShop: (id) => api.delete(`/admin/shops/${id}`),
  verifyShop: (id, isVerified) => api.put(`/admin/shops/${id}/verify`, { isVerified }),
  toggleShopActive: (id) => api.put(`/admin/shops/${id}/toggle-active`),
  // Products
  getProducts: (params) => api.get('/admin/products', { params }),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  toggleProductAvailable: (id) => api.put(`/admin/products/${id}/toggle-available`),
  // Messages
  getMessages: (params) => api.get('/admin/messages', { params }),
  deleteMessage: (id) => api.delete(`/admin/messages/${id}`),
};


export default api;
