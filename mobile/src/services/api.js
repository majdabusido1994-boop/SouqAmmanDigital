import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Change this to your production server URL when deploying
// For local dev, use your machine's IP. For production, use your deployed backend URL.
const API_URL = __DEV__
  ? 'http://192.168.100.236:5000/api'
  : 'https://your-production-server.com/api';

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

export default api;
