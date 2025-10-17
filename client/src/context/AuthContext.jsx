

// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null); 
  const [loading, setLoading] = useState(true); // Состояние загрузки (true, пока не проверили токен)

  // Проверка токена и загрузка данных пользователя при старте приложения
  useEffect(() => {
    const loadUser = async () => {
      // Начинаем загрузку
      setLoading(true);
      
      if (token) {
        try {
          // Отправляем GET /api/user. Токен автоматически прикрепляется интерцептором.
          const res = await api.get('/user');
          setUser(res.data);
          
        } catch (err) {
          // Если токен недействителен (401/403), сбрасываем аутентификацию
          console.error('Token invalid or user not found', err);
          logout();
        }
      }
      // Загрузка завершена
      setLoading(false);
    };
    loadUser();
  }, [token]); // Запускается при первом рендере и при изменении токена

  // Функция входа
  const login = async (email, password) => {
    // 1. Получаем токен
    const res = await api.post('/auth/login', { email, password });
    
    // 2. Сохраняем токен в стейт и localStorage
    setToken(res.data.token); 
    localStorage.setItem('token', res.data.token);
    
    // 3. Получаем данные пользователя
    const userRes = await api.get('/user');
    setUser(userRes.data);
  };

  // Функция регистрации
  const register = async (email, password) => {
    // При успешной регистрации сразу вызываем логин, чтобы получить токен
    await api.post('/auth/register', { email, password });
    await login(email, password); 
  };

  // Функция выхода
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, // Передаем loading
        login, 
        register, 
        logout, 
        isAuthenticated: !!token 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

