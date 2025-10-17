// src/api/budgetApi.js
import api from './api';

// Получение всех бюджетов пользователя
export const fetchBudgets = async () => {
  const response = await api.get('/budgets');
  return response.data;
};

// Создание нового бюджета
export const createBudget = async (categoryId, limitAmount, month) => {
  // month ожидается в формате 'YYYY-MM'
  const response = await api.post('/budgets', { categoryId, limitAmount, month });
  return response.data;
};

// Редактирование бюджета
export const updateBudget = async (id, limitAmount) => {
  const response = await api.put(`/budgets/${id}`, { limitAmount });
  return response.data;
};

// Удаление бюджета
export const deleteBudget = async (id) => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};
