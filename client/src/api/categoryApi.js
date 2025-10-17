// src/api/categoryApi.js
import api from './api';

// Получение списка всех категорий пользователя
export const fetchCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// Создание новой категории
export const createCategory = async (name, type) => {
  const response = await api.post('/categories', { name, type });
  return response.data;
};

// Редактирование категории
export const updateCategory = async (id, name, type) => {
  const response = await api.put(`/categories/${id}`, { name, type });
  return response.data;
};

// Удаление категории
export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};
