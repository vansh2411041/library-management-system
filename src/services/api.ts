import axios from 'axios';

// Fixed: Use import.meta.env for Vite instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add type definitions
interface UserRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const apiService = {
  register: async (userData: UserRegistrationData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  registerAdmin: async (adminData: {
    name: string;
    email: string;
    password: string;
    secretCode: string;
  }) => {
    const response = await api.post('/auth/register-admin', adminData);
    return response.data;
  },

  getBooks: async () => {
    const response = await api.get('/books');
    return response.data;
  },

  getMembers: async () => {
    const response = await api.get('/members');
    return response.data;
  },

  getLoans: async () => {
    const response = await api.get('/loans');
    return response.data;
  },
  
  getAdminStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getAdminList: async () => {
    const response = await api.get('/admin/list');
    return response.data;
  },

  borrowBook: async (bookId: number, memberId: number) => {
    console.log('📡 API call: borrowBook', { bookId, memberId });
    const response = await api.post('/loans', { bookId, memberId });
    console.log('📡 API response:', response.data);
    return response.data;
  },

  resetUserPassword: async (memberId: number, password: string) => {
    const response = await api.put(`/admin/users/${memberId}/reset-password`, { password });
    return response.data;
  },

  addBook: async (bookData: any) => {
    const response = await api.post('/books', bookData);
    return response.data;
  },
};

export default api;
