// src/components/TransactionForm.jsx
import React, { useState } from 'react';
import { useCategories } from '../context/CategoryContext';
import { createTransaction } from '../api/transactionApi';

// Принимает функцию обратного вызова для обновления списка транзакций на дашборде
const TransactionForm = ({ onTransactionAdded }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // По умолчанию: расход
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Определяем, какие категории показывать, в зависимости от выбранного типа (доход/расход)
  const filteredCategories = categories.filter(c => c.type === type);
  
  // Если категории еще не загружены или их нет
  if (categoriesLoading || categories.length === 0) {
    return <div>{categoriesLoading ? 'Загрузка категорий...' : 'Категории не найдены. Сначала добавьте их.'}</div>;
  }
  
  // При смене типа (expense/income) сбрасываем выбранный categoryId, 
  // так как он может быть недействительным для нового типа
  const handleTypeChange = (newType) => {
    setType(newType);
    setCategoryId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!amount || !categoryId) {
      setError('Сумма и категория обязательны.');
      return;
    }

    try {
      const newTransaction = {
        amount: parseFloat(amount),
        type,
        categoryId,
        description,
      };

      await createTransaction(newTransaction);
      setSuccess(true);
      
      // Сброс формы
      setAmount('');
      setDescription('');
      
      // Вызываем функцию для обновления данных на дашборде
      if (onTransactionAdded) {
        onTransactionAdded();
      }

    } catch (err) {
      console.error("Ошибка при добавлении транзакции:", err);
      setError(err.response?.data?.msg || 'Не удалось добавить транзакцию.');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '30px', background: '#f8f9fa' }}>
      <h3>Добавить транзакцию</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={() => handleTypeChange('expense')}
          style={{ padding: '10px 15px', background: type === 'expense' ? '#dc3545' : '#ccc', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px 0 0 4px' }}>
          Расход
        </button>
        <button 
          onClick={() => handleTypeChange('income')}
          style={{ padding: '10px 15px', background: type === 'income' ? '#28a745' : '#ccc', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '0 4px 4px 0' }}>
          Доход
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Сумма */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Сумма:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            min="0.01"
            step="0.01"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Категория */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Категория:</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="" disabled>Выберите категорию</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Описание */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Описание (необязательно):</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Продукты в супермаркете"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {error && <p style={{ color: '#dc3545', marginBottom: '15px' }}>{error}</p>}
        {success && <p style={{ color: '#28a745', marginBottom: '15px' }}>Транзакция успешно добавлена!</p>}

        <button type="submit" 
          style={{ width: '100%', padding: '10px', background: type === 'expense' ? '#dc3545' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Добавить {type === 'expense' ? 'Расход' : 'Доход'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
