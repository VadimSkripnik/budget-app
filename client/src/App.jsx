
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

// Компонент-обертка для защищенных маршрутов
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>; // Можно заменить на спиннер
  }

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
            {/* НОВЫЙ МАРШРУТ ДЛЯ КАТЕГОРИЙ */}
      <Route 
        path="/categories" 
        element={
          <ProtectedRoute>
            <CategoryPage /> 
          </ProtectedRoute>
        } 
      />

      {/* Добавляем перенаправление на защищенную главную */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;





