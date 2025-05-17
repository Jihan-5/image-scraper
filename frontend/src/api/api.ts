import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        toast.error('Please login again');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error(error.response.data.message || 'Request failed');
    }
    throw error;
  }
);

export const saveImageToCollection = async (data: {
  imageUrl: string;
  collectionName: string;
  userId: string;
}) => {
  return api.post('/collections', data);
};

export const getScrapingHistory = async (userId: string) => {
  return api.get(`/history?userId=${userId}`);
};