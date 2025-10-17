// // src/pages/BudgetPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useCategories } from '../context/CategoryContext';
// import { fetchBudgets, createBudget, updateBudget, deleteBudget } from '../api/budgetApi';

// const BudgetPage = () => {
//     const { expenseCategories, loading: categoriesLoading } = useCategories();
    
//     // Бюджеты будут относиться только к расходам, поэтому берем только expenseCategories
//     const [budgets, setBudgets] = useState([]);
//     const [loadingBudgets, setLoadingBudgets] = useState(true);
//     const [error, setError] = useState(null);

//     // Состояния формы
//     const [categoryId, setCategoryId] = useState('');
//     const [limitAmount, setLimitAmount] = useState('');
//     // По умолчанию устанавливаем текущий месяц в формате YYYY-MM
//     const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
//     const [editingBudget, setEditingBudget] = useState(null);

//     // --- ЛОГИКА ЗАГРУЗКИ ---
//     const loadBudgets = async () => {
//         setLoadingBudgets(true);
//         try {
//             const data = await fetchBudgets();
//             setBudgets(data);
//         } catch (err) {
//             setError("Не удалось загрузить бюджеты.");
//         } finally {
//             setLoadingBudgets(false);
//         }
//     };

//     useEffect(() => {
//         loadBudgets();
//     }, []);

//     // --- ЛОГИКА ФОРМЫ ---

//     const startEdit = (budget) => {
//         setEditingBudget(budget);
//         setLimitAmount(budget.limitAmount);
//         setCategoryId(budget.categoryId);
//         setMonth(budget.month); // Месяц редактируемого бюджета
//         setError(null);
//     };

//     const resetForm = () => {
//         setEditingBudget(null);
//         setLimitAmount('');
//         setCategoryId('');
//         setMonth(new Date().toISOString().slice(0, 7));
//         setError(null);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError(null);

//         if (!limitAmount || !categoryId || !month) {
//             setError("Все поля обязательны.");
//             return;
//         }


//     // --- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Приведение limitAmount к числу ---
//     const numericLimit = parseFloat(limitAmount);
//     if (isNaN(numericLimit) || numericLimit <= 0) {
//         setError("Лимит должен быть положительным числом.");
//         return;
//     }
//     // --- КОНЕЦ ИСПРАВЛЕНИЯ ---


        
//         try {
//             if (editingBudget) {
//                 // // ОБНОВЛЕНИЕ ЛИМИТА
//                 // await updateBudget(editingBudget.id, parseFloat(limitAmount));
//                        // ОБНОВЛЕНИЕ
//             // Бэкенд ожидает limitAmount
//             await updateBudget(editingBudget.id, numericLimit); 

//             } else {
//                 // СОЗДАНИЕ
//                 // await createBudget(categoryId, parseFloat(limitAmount), month);
//                         // СОЗДАНИЕ
//             await createBudget(categoryId, numericLimit, month); // Передаем число

//             }
            
//             await loadBudgets();
//             resetForm();
            
//         } catch (err) {
//             const msg = err.response?.data?.msg || "Ошибка сохранения бюджета.";
//             setError(msg);
//         }
//     };

//     const handleDelete = async (id) => {
//         if (window.confirm('Вы уверены, что хотите удалить этот бюджет?')) {
//             try {
//                 await deleteBudget(id);
//                 await loadBudgets();
//             } catch (err) {
//                 alert("Ошибка удаления бюджета.");
//             }
//         }
//     };

//     if (categoriesLoading || loadingBudgets) return <div style={{padding: '20px'}}>Загрузка данных...</div>;

//     // Категории, на которые еще не установлен бюджет в текущем месяце (для формы создания)
//     const activeBudgetCategoryIds = budgets.map(b => b.categoryId);
//     const availableCategories = expenseCategories.filter(c => !activeBudgetCategoryIds.includes(c.id));
    
//     // --- РЕНДЕРИНГ ---

//     return (
//         <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
//             <h1>Планирование бюджета</h1>
//             <p>Установите ежемесячные лимиты расходов по категориям.</p>

//             {/* БЛОК ФОРМЫ */}
//             <div style={{ border: '1px solid #007bff', padding: '20px', borderRadius: '8px', marginBottom: '30px', background: '#e9f7ff' }}>
//                 <h3>{editingBudget ? 'Редактировать лимит' : 'Установить новый бюджет'}</h3>
                
//                 <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    
//                     {/* Месяц */}
//                     <div style={{ width: '150px' }}>
//                         <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Месяц:</label>
//                         <input
//                             type="month"
//                             value={month}
//                             onChange={(e) => setMonth(e.target.value)}
//                             required
//                             style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
//                             // Редактирование месяца запрещено, чтобы не путать пользователя
//                             disabled={!!editingBudget} 
//                         />
//                     </div>
                    
//                     {/* Категория */}
//                     <div style={{ flex: 1, minWidth: '150px' }}>
//                         <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Категория расхода:</label>
//                         <select
//                             value={categoryId}
//                             onChange={(e) => setCategoryId(e.target.value)}
//                             required
//                             style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
//                             // Редактирование категории запрещено
//                             disabled={!!editingBudget} 
//                         >
//                             <option value="" disabled>Выберите...</option>
//                             {(editingBudget ? expenseCategories : availableCategories).map(cat => (
//                                 <option key={cat.id} value={cat.id}>
//                                     {cat.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     {/* Лимит */}
//                     <div style={{ flex: 1, minWidth: '150px' }}>
//                         <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Лимит (₽):</label>
//                         <input
//                             type="number"
//                             value={limitAmount}
//                             onChange={(e) => setLimitAmount(e.target.value)}
//                             placeholder="50000"
//                             required
//                             min="1"
//                             style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
//                         />
//                     </div>

//                     <button type="submit" style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
//                         {editingBudget ? 'Сохранить лимит' : 'Установить'}
//                     </button>
                    
//                     {editingBudget && (
//                         <button type="button" onClick={resetForm} style={{ padding: '10px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
//                             Отмена
//                         </button>
//                     )}
//                 </form>
//                 {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
//             </div>
            
//             {/* СПИСОК БЮДЖЕТОВ */}
//             <h2>Активные лимиты</h2>
//             {budgets.length === 0 && <p>Бюджеты еще не установлены.</p>}
            
//             <ul style={{ listStyle: 'none', padding: 0 }}>
//                 {budgets.map(budget => (
//                     <li key={budget.id} style={{ 
//                         padding: '15px', 
//                         borderBottom: '1px solid #eee', 
//                         display: 'flex', 
//                         justifyContent: 'space-between', 
//                         alignItems: 'center', 
//                         background: '#fff',
//                         borderRadius: '4px',
//                         marginBottom: '10px'
//                     }}>
//                         <div>
//                             <strong>{budget.month}</strong> | 
//                             Категория: <strong>{expenseCategories.find(c => c.id === budget.categoryId)?.name || 'Неизвестная категория'}</strong>
//                         </div>
//                         <div>
//                             Лимит: <strong style={{color: '#007bff'}}>{parseFloat(budget.limitAmount).toLocaleString('ru-RU')} ₽</strong>
//                         </div>
//                         <div>
//                             <button onClick={() => startEdit(budget)} style={{ background: '#ffc107', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '10px', cursor: 'pointer' }}>
//                                 Изменить лимит
//                             </button>
//                             <button onClick={() => handleDelete(budget.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
//                                 Удалить
//                             </button>
//                         </div>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default BudgetPage;



// src/pages/BudgetPage.jsx
import React, { useState, useEffect } from 'react';
import { useCategories } from '../context/CategoryContext';
import { fetchBudgets, createBudget, updateBudget, deleteBudget } from '../api/budgetApi';

const BudgetPage = () => {
    // Получаем только категории расходов, так как бюджеты ставятся на расходы
    const { expenseCategories, loading: categoriesLoading } = useCategories();
    
    const [budgets, setBudgets] = useState([]);
    const [loadingBudgets, setLoadingBudgets] = useState(true);
    const [error, setError] = useState(null);

    // Состояния формы
    const [categoryId, setCategoryId] = useState('');
    const [limitAmount, setLimitAmount] = useState('');
    // По умолчанию устанавливаем текущий месяц в формате YYYY-MM
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [editingBudget, setEditingBudget] = useState(null);

    // --- ЛОГИКА ЗАГРУЗКИ ---
    const loadBudgets = async () => {
        setLoadingBudgets(true);
        try {
            const data = await fetchBudgets();
            // На бэкенде мы назвали ID бюджета 'budgetId', а лимит 'limitAmount'
            setBudgets(data);
        } catch (err) {
            setError("Не удалось загрузить бюджеты.");
        } finally {
            setLoadingBudgets(false);
        }
    };

    useEffect(() => {
        loadBudgets();
    }, []);

    // --- ЛОГИКА ФОРМЫ ---

    const startEdit = (budget) => {
        setEditingBudget(budget);
        // Приводим лимит к строке для поля input
        setLimitAmount(String(budget.limitAmount)); 
        // Категория нужна для отображения в форме (но поле disabled)
        setCategoryId(budget.categoryId); 
        // Собираем YYYY-MM из числовых полей
        const monthStr = String(budget.month).padStart(2, '0');
        setMonth(`${budget.year}-${monthStr}`); 
        setError(null);
    };

    const resetForm = () => {
        setEditingBudget(null);
        setLimitAmount('');
        setCategoryId('');
        setMonth(new Date().toISOString().slice(0, 7));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!limitAmount || !categoryId || !month) {
            setError("Все поля обязательны.");
            return;
        }
        
        // --- ИСПРАВЛЕНИЕ: Парсинг и валидация числа ---
        const numericLimit = parseFloat(limitAmount);
        
        if (isNaN(numericLimit) || numericLimit <= 0) {
            setError("Лимит должен быть положительным числом.");
            return;
        }
        // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
        
        try {
            if (editingBudget) {
                // ОБНОВЛЕНИЕ: Передаем ID бюджета и числовое значение
                await updateBudget(editingBudget.budgetId, numericLimit); 
            } else {
                // СОЗДАНИЕ: Передаем числовое значение лимита
                await createBudget(categoryId, numericLimit, month);
            }
            
            // Перезагружаем список и сбрасываем форму
            await loadBudgets();
            resetForm();
            
        } catch (err) {
            const msg = err.response?.data?.msg || "Ошибка сохранения бюджета.";
            setError(msg);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот бюджет?')) {
            try {
                // Бэкенд ожидает ID бюджета
                await deleteBudget(id);
                await loadBudgets();
            } catch (err) {
                alert("Ошибка удаления бюджета.");
            }
        }
    };

    if (categoriesLoading || loadingBudgets) return <div style={{padding: '20px'}}>Загрузка данных...</div>;

    // Категории, на которые еще не установлен бюджет в выбранном месяце
    const currentMonthFormatted = month;
    
    const activeCategoryIdsInMonth = budgets
        .filter(b => `${b.year}-${String(b.month).padStart(2, '0')}` === currentMonthFormatted)
        .map(b => b.categoryId);
        
    // Для создания показываем только те категории, на которые еще нет лимита в текущем месяце
    const availableCategories = expenseCategories.filter(c => !activeCategoryIdsInMonth.includes(c.id));
    
    // Если редактируем, мы должны разрешить выбор только той категории, которую редактируем
    const categoryOptions = editingBudget 
        ? expenseCategories 
        : availableCategories;

    // --- РЕНДЕРИНГ ---

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <h1>Планирование бюджета</h1>
            <p>Установите ежемесячные лимиты расходов по категориям.</p>

            {/* БЛОК ФОРМЫ */}
            <div style={{ border: '1px solid #007bff', padding: '20px', borderRadius: '8px', marginBottom: '30px', background: '#e9f7ff' }}>
                <h3>{editingBudget ? 'Редактировать лимит' : 'Установить новый бюджет'}</h3>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    
                    {/* Месяц */}
                    <div style={{ width: '150px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Месяц:</label>
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            // Месяц редактирования блокируем, чтобы избежать путаницы
                            disabled={!!editingBudget} 
                        />
                    </div>
                    
                    {/* Категория */}
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Категория расхода:</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            // Категорию редактирования блокируем
                            disabled={!!editingBudget} 
                        >
                            <option value="" disabled>Выберите...</option>
                            {categoryOptions.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Лимит */}
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Лимит (₽):</label>
                        <input
                            type="number"
                            value={limitAmount}
                            onChange={(e) => setLimitAmount(e.target.value)}
                            placeholder="50000"
                            required
                            min="0.01" // Минимальное значение для HTML5
                            step="0.01" 
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <button type="submit" style={{ padding: '10px 15px', background: editingBudget ? '#ffc107' : '#28a745', color: editingBudget ? 'black' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {editingBudget ? 'Сохранить лимит' : 'Установить'}
                    </button>
                    
                    {editingBudget && (
                        <button type="button" onClick={resetForm} style={{ padding: '10px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Отмена
                        </button>
                    )}
                </form>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </div>
            
            {/* СПИСОК БЮДЖЕТОВ */}
            <h2>Активные лимиты</h2>
            {budgets.length === 0 && <p>Бюджеты еще не установлены.</p>}
            
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {budgets.map(budget => (
                    <li key={budget.budgetId} style={{ 
                        padding: '15px', 
                        borderBottom: '1px solid #eee', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        background: '#fff',
                        borderRadius: '4px',
                        marginBottom: '10px'
                    }}>
                        <div>
                            {/* Форматируем месяц/год для вывода */}
                            <strong>{String(budget.month).padStart(2, '0')}-{budget.year}</strong> | 
                            Категория: <strong>{budget.categoryName}</strong>
                            <span style={{ 
                                marginLeft: '10px', 
                                color: budget.isOverBudget ? '#dc3545' : '#28a745', 
                                fontWeight: 'bold' 
                            }}>
                                {budget.isOverBudget ? '(Лимит превышен!)' : ''}
                            </span>
                        </div>
                        <div>
                            Потрачено: <strong style={{color: '#dc3545'}}>{parseFloat(budget.totalSpent).toLocaleString('ru-RU')} ₽</strong> | 
                            Остаток: <strong style={{color: budget.remaining < 0 ? '#dc3545' : '#28a745'}}>{parseFloat(budget.remaining).toLocaleString('ru-RU')} ₽</strong>
                        </div>
                        <div>
                            <button onClick={() => startEdit(budget)} style={{ background: '#ffc107', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '10px', cursor: 'pointer' }}>
                                Изменить лимит
                            </button>
                            <button onClick={() => handleDelete(budget.budgetId)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                Удалить
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BudgetPage;

