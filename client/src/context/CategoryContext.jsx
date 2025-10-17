// src/context/CategoryContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchCategories } from '../api/categoryApi';
import { useAuth } from './AuthContext'; // Нужен для проверки isAuthenticated

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Добавляем функции CRUD, которые будут обновлять локальное состояние
  
  // Функция для загрузки данных с сервера
  const loadCategories = async () => {
    if (!isAuthenticated) {
      setCategories([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Не удалось загрузить категории.');
    } finally {
      setLoading(false);
    }
  };

  // Вызываем загрузку при аутентификации
  useEffect(() => {
    loadCategories();
  }, [isAuthenticated]);

  // Сортировка категорий по типу (сначала доходы, потом расходы)
  const sortedCategories = categories.sort((a, b) => {
    if (a.type === 'income' && b.type === 'expense') return -1;
    if (a.type === 'expense' && b.type === 'income') return 1;
    return a.name.localeCompare(b.name);
  });
  
  // Удобные геттеры для разделения категорий
  const incomeCategories = sortedCategories.filter(c => c.type === 'income');
  const expenseCategories = sortedCategories.filter(c => c.type === 'expense');

  return (
    <CategoryContext.Provider 
      value={{ 
        categories: sortedCategories, 
        incomeCategories, 
        expenseCategories,
        loading, 
        error, 
        loadCategories // Функция для принудительного обновления
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
