// src/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
};

// ─── Transactions API ────────────────────────────────────────────────────────
export const transactionsAPI = {
  getAll: () => api.get('/api/transactions/'),
  create: (data) => api.post('/api/transactions/', data),
  delete: (id) => api.delete(`/api/transactions/${id}`),
};

// ─── Budgets API ─────────────────────────────────────────────────────────────
export const budgetsAPI = {
  get: () => api.get('/api/budgets/'),
  update: (budgets) => api.put('/api/budgets/', { budgets }),
};

// ─── Analytics API ───────────────────────────────────────────────────────────
export const analyticsAPI = {
  summary: () => api.get('/api/analytics/summary'),
};

export default api;
