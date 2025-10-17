// src/api/api.js
import axios from 'axios';

// URL нашего бэкенда, запущенного на порту 3000
const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Перехватчик: Добавляем токен авторизации к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
