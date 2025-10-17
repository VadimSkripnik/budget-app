// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react'; // <-- Импортируем useCallback
import { Link } from 'react-router-dom'; // <-- Импортируем Link
import { useAuth } from '../context/AuthContext';
import { fetchSummary, fetchTransactions } from '../api/transactionApi';
import TransactionForm from '../components/TransactionForm'; // <-- Импортируем форму

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  // Выносим логику загрузки в useCallback, чтобы её можно было вызывать повторно
  const loadData = useCallback(async () => {
      try {
        setLoadingData(true);
        setError(null);

        // 1. Загрузка сводки (баланс)
        const summaryData = await fetchSummary(firstDayOfMonth, lastDayOfMonth);
        setSummary(summaryData);

        // 2. Загрузка транзакций
        const transactionsData = await fetchTransactions(firstDayOfMonth, lastDayOfMonth);
        setTransactions(transactionsData);

      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError("Не удалось загрузить данные о финансах.");
      } finally {
        setLoadingData(false);
      }
  }, [firstDayOfMonth, lastDayOfMonth]);

  // Загружаем данные при первом монтировании и при смене зависимостей
  useEffect(() => {
    loadData();
  }, [loadData]); 


  if (!user) {
    return <div style={{padding: '20px'}}>Загрузка данных пользователя...</div>;
  }
  
  if (loadingData) {
    return <div style={{padding: '20px'}}>Загрузка финансовых данных...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>👋 Привет, {user.email}!</h1>
      <p>Транзакции за период: {firstDayOfMonth} по {lastDayOfMonth}</p>
      
      
            {/* Блок навигации */}
      <div style={{ marginBottom: '20px' }}>
          <button onClick={logout} style={{ marginRight: '10px', padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
            Выйти
          </button>
          <Link to="/categories" style={{ padding: '8px 12px', background: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Управление категориями
          </Link>
                    {/* НОВАЯ ССЫЛКА */}
          <Link to="/budgets" style={{ padding: '8px 12px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Планирование бюджета
          </Link>
          <Link to="/debts" style={{ padding: '8px 12px', background: '#ffc107', color: 'black', textDecoration: 'none', borderRadius: '4px' }}>
            Долги и Займы
          </Link>
          <Link to="/savings" style={{ padding: '8px 12px', background: '#ffc107', color: 'black', textDecoration: 'none', borderRadius: '4px' }}>
            Накопления
          </Link>


      </div>


      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* ДОБАВЛЯЕМ ФОРМУ */}
      <TransactionForm onTransactionAdded={loadData} /> 

      {/* БЛОК БАЛАНСА */}
      {summary && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <BalanceCard title="Баланс" amount={summary.balance} color="#007bff" />
          <BalanceCard title="Доходы" amount={summary.totalIncome} color="#28a745" />
          <BalanceCard title="Расходы" amount={summary.totalExpense} color="#dc3545" />
        </div>
      )}

      {/* СПИСОК ТРАНЗАКЦИЙ */}
      <h2>Последние транзакции</h2>
      {transactions.length > 0 ? (
        <TransactionList transactions={transactions} />
      ) : (
        <p>Транзакций за этот период нет.</p>
      )}
    </div>
  );
};

// ... (BalanceCard и TransactionList остаются без изменений)
// Компоненты-заглушки (для чистоты кода)
const BalanceCard = ({ title, amount, color }) => (
    <div style={{ padding: '20px', borderLeft: `5px solid ${color}`, borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexGrow: 1, background: '#fff' }}>
        <h4 style={{ margin: 0, color: '#6c757d' }}>{title}</h4>
        <p style={{ margin: '10px 0 0', fontSize: '1.5em', fontWeight: 'bold', color: color }}>
            {parseFloat(amount).toLocaleString('ru-RU')} ₽
        </p>
    </div>
);

const TransactionList = ({ transactions }) => (
    <ul style={{ listStyle: 'none', padding: 0 }}>
        {transactions.map(t => (
            <li key={t.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <strong>{t.Category?.name || 'Без категории'}</strong> 
                    <span style={{ color: '#6c757d', fontSize: '0.9em', marginLeft: '10px' }}>
                        ({t.description})
                    </span>
                </div>
                <span style={{ color: t.type === 'income' ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                    {t.type === 'expense' ? '-' : '+'} {parseFloat(t.amount).toLocaleString('ru-RU')} ₽
                </span>
            </li>
        ))}
    </ul>
);

export default Dashboard;




