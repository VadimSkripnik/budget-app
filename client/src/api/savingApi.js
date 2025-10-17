// src/api/savingApi.js
import api from './api'; 

// Получить все цели
export const fetchSavingGoals = async () => {
    const response = await api.get('/savings');
    return response.data;
};

// Создать новую цель
export const createSavingGoal = async (name, targetAmount, targetDate) => {
    const response = await api.post('/savings', { name, targetAmount, targetDate });
    return response.data;
};

// Внести средства
export const depositToGoal = async (id, amount) => {
    const response = await api.put(`/savings/${id}/deposit`, { amount });
    return response.data;
};

// Удалить цель
export const deleteSavingGoal = async (id) => {
    const response = await api.delete(`/savings/${id}`);
    return response.data;
};
