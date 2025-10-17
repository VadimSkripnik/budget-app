// src/api/transactionApi.js
import api from './api';

// Получение общего баланса, доходов и расходов
export const fetchSummary = async (startDate, endDate) => {
  let url = '/transactions/summary';
  const params = {};
  
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  // Добавляем параметры запроса, если они есть
  if (Object.keys(params).length > 0) {
    url += '?' + new URLSearchParams(params).toString();
  }
  
  const response = await api.get(url);
  return response.data;
};

// Получение списка всех транзакций (с фильтрацией по дате)
export const fetchTransactions = async (startDate, endDate) => {
  let url = '/transactions';
  const params = {};
  
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  if (Object.keys(params).length > 0) {
    url += '?' + new URLSearchParams(params).toString();
  }
  
  const response = await api.get(url);
  return response.data;
};

// Создание новой транзакции
export const createTransaction = async (transactionData) => {
  // transactionData должен содержать: amount, type, categoryId, description
  const response = await api.post('/transactions', transactionData);
  return response.data;
};


// ... (Сюда мы добавим создание, редактирование и удаление позже)
