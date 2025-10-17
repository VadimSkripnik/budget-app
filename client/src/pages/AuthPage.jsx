// src/pages/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Хук для автоматического перенаправления, если пользователь уже вошел
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      
      // Принудительное перенаправление на дашборд после успешного входа/регистрации
      navigate('/'); 

    } catch (err) {
      // Ловим и обрабатываем ошибки, пришедшие от API (401, 400 и т.д.)
      const msg = err.response?.data?.message || err.response?.data?.msg || 'Произошла ошибка сети/сервера.';
      setError(msg);
      // Важно: сбрасываем токен, если ошибка связана с аутентификацией
      if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        {error && <p style={{ color: '#dc3545', marginBottom: '15px', fontSize: '0.9em' }}>{error}</p>}
        <button type="submit" style={{ 
          width: '100%', 
          padding: '10px', 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}>
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>
      <button 
        onClick={() => { setIsLogin(!isLogin); setError(''); }}
        style={{ 
          marginTop: '15px', 
          background: 'transparent', 
          border: 'none', 
          color: '#007bff', 
          width: '100%',
          cursor: 'pointer' 
        }}
      >
        {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
      </button>
    </div>
  );
};

export default AuthPage;


