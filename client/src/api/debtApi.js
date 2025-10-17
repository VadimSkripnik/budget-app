// src/api/debtApi.js
import api from './api';

// Получение всех долгов и займов
export const fetchDebts = async () => {
  const response = await api.get('/debts');
  return response.data;
};

// Создание нового долга/займа
export const createDebt = async (personName, amount, type, date, description) => {
  // type: 'lending' (я дал в долг) или 'borrowing' (я взял в долг)
  const response = await api.post('/debts', { personName, amount, type, date, description });
  return response.data;
};

// Отметка долга/займа как погашенного
export const resolveDebt = async (id) => {
  // Бэкенд должен сам установить статус 'resolved' и дату погашения
  const response = await api.put(`/debts/${id}/resolve`); 
  return response.data;
};

// // --- НОВАЯ ФУНКЦИЯ ДЛЯ ПОГАШЕНИЯ ---
// export const payDebtAmount = async (id, amount) => {
//   // Используем ваш PUT-маршрут /api/debts/:id/payment
//   const response = await api.put(`/debts/${id}/payment`, { amount }); 
//   return response.data;
// };

// --- НОВАЯ ФУНКЦИЯ ДЛЯ ПОГАШЕНИЯ ---
export const payDebtAmount = async (id, amount, paymentDate) => {
  // Используем ваш PUT-маршрут /api/debts/:id/payment
  const response = await api.put(`/debts/${id}/payment`, { amount, paymentDate }); 
  return response.data;
};



// Удаление долга/займа
export const deleteDebt = async (id) => {
  const response = await api.delete(`/debts/${id}`);
  return response.data;
};
