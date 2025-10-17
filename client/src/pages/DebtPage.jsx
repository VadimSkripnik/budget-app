
// // src/pages/DebtPage.jsx
// import React, { useState, useEffect } from 'react';
// // Импортируем функцию для внесения платежей (должна быть обновлена для приема даты)
// import { fetchDebts, createDebt, payDebtAmount, deleteDebt } from '../api/debtApi';

// const DebtPage = () => {
//     const [debts, setDebts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
    
//     // Состояния формы создания
//     const [personName, setPersonName] = useState('');
//     const [amount, setAmount] = useState('');
//     const [type, setType] = useState('lending'); 
//     const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//     const [description, setDescription] = useState('');
    
//     // --- СОСТОЯНИЯ ДЛЯ ПЛАТЕЖЕЙ (Модальное окно) ---
//     const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
//     const [currentDebtForPayment, setCurrentDebtForPayment] = useState(null);
//     const [paymentAmount, setPaymentAmount] = useState('');
//     // --- КОНЕЦ СОСТОЯНИЙ ПЛАТЕЖЕЙ ---


//     // --- ЛОГИКА ЗАГРУЗКИ ---
//     const loadDebts = async () => {
//         setLoading(true);
//         try {
//             const data = await fetchDebts();
//             setDebts(data);
//         } catch (err) {
//             setError("Не удалось загрузить данные о долгах.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadDebts();
//     }, []);

//     // --- ЛОГИКА ФОРМЫ СОЗДАНИЯ ---
//     const resetForm = () => {
//         setPersonName('');
//         setAmount('');
//         setDescription('');
//         setType('lending');
//         setDate(new Date().toISOString().split('T')[0]);
//         setError(null);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError(null);

//         if (!personName || !amount || !type || !date) {
//             setError("Имя, сумма, тип и дата обязательны.");
//             return;
//         }

//         const numericAmount = parseFloat(amount);
//         if (isNaN(numericAmount) || numericAmount <= 0) {
//             setError("Сумма должна быть положительным числом.");
//             return;
//         }
        
//         // Конвертация типа для бэкенда: 'lending' -> 'loan', 'borrowing' -> 'owed'
//         const debtTypeForBackend = type === 'lending' ? 'loan' : 'owed';

//         try {
//             await createDebt(personName, numericAmount, debtTypeForBackend, date, description);
            
//             await loadDebts();
//             resetForm();
            
//         } catch (err) {
//             const msg = err.response?.data?.msg || "Ошибка сохранения записи.";
//             setError(msg);
//         }
//     };
    
//     // --- ЛОГИКА ОПЛАТЫ (ЧАСТИЧНОЙ И ПОЛНОЙ) ---
    
//     // Открывает модальное окно для внесения платежа
//     const startPayment = (debt) => {
//         const remaining = debt.amount - debt.paidAmount;
//         if (remaining <= 0) {
//             alert("Этот долг уже погашен.");
//             return;
//         }
//         setCurrentDebtForPayment(debt);
//         setPaymentAmount(remaining.toFixed(2)); // Предлагаем оставшуюся сумму по умолчанию
//         setIsPaymentModalOpen(true);
//     };

//     // Закрывает модальное окно
//     const closePaymentModal = () => {
//         setIsPaymentModalOpen(false);
//         setCurrentDebtForPayment(null);
//         setPaymentAmount('');
//     };
    
//     // Обработка платежа (ПРИНИМАЕТ ДАТУ ПЛАТЕЖА ИЗ МОДАЛЬНОГО ОКНА)
//     const handlePaymentSubmit = async (e, paymentDate) => {
//         e.preventDefault();
        
//         const numericPayment = parseFloat(paymentAmount);
//         const remaining = currentDebtForPayment.amount - currentDebtForPayment.paidAmount;

//         if (isNaN(numericPayment) || numericPayment <= 0) {
//             alert("Сумма платежа должна быть положительным числом.");
//             return;
//         }
        
//         if (numericPayment > remaining + 0.001) {
//             alert(`Сумма платежа не может превышать оставшуюся сумму: ${remaining.toFixed(2)} ₽`);
//             return;
//         }

//         try {
//             // Отправляем дату и сумму в API
//             await payDebtAmount(currentDebtForPayment.id, numericPayment, paymentDate); 
            
//             closePaymentModal();
//             await loadDebts(); 
//         } catch (err) {
//             alert("Ошибка при внесении платежа.");
//             console.error(err);
//         }
//     };
    
//     // --- ЛОГИКА УДАЛЕНИЯ ---
//     const handleDelete = async (id) => {
//         if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
//             try {
//                 await deleteDebt(id);
//                 await loadDebts();
//             } catch (err) {
//                 alert("Ошибка удаления записи.");
//             }
//         }
//     };


//     if (loading) return <div style={{padding: '20px'}}>Загрузка данных...</div>;

//     // Сортировка и группировка
//     const activeDebts = debts.filter(d => d.isSettled === false);
//     const resolvedDebts = debts.filter(d => d.isSettled === true);

//     const calculateNet = (list, type) => 
//         list.filter(d => d.type === type).reduce((sum, d) => 
//             sum + (parseFloat(d.amount) - parseFloat(d.paidAmount)), 0);

//     const totalLending = calculateNet(activeDebts, 'loan');
//     const totalBorrowing = calculateNet(activeDebts, 'owed');
    
//     // --- РЕНДЕРИНГ ОСНОВНОГО КОМПОНЕНТА ---

//     return (
//         <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
//             <h1>Учет Долгов и Займов</h1>
            
//             {/* БЛОК СВОДКИ */}
//             <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
//                 <SummaryCard title="Мне должны (Займы)" amount={totalLending} color="#28a745" />
//                 <SummaryCard title="Я должен (Долги)" amount={totalBorrowing} color="#dc3545" />
//                 <SummaryCard title="Чистый баланс" amount={totalLending - totalBorrowing} color="#007bff" />
//             </div>

//             {/* БЛОК ФОРМЫ СОЗДАНИЯ */}
//             <div style={{ border: '1px solid #ffc107', padding: '20px', borderRadius: '8px', marginBottom: '30px', background: '#fffbe6' }}>
//                 <h3>Добавить новую запись</h3>
                
//                 <div style={{ marginBottom: '15px' }}>
//                     <button 
//                         onClick={() => setType('lending')}
//                         style={{ padding: '10px 15px', background: type === 'lending' ? '#28a745' : '#ccc', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px 0 0 4px' }}>
//                         Я дал в долг (Lending)
//                     </button>
//                     <button 
//                         onClick={() => setType('borrowing')}
//                         style={{ padding: '10px 15px', background: type === 'borrowing' ? '#dc3545' : '#ccc', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '0 4px 4px 0' }}>
//                         Я взял в долг (Borrowing)
//                     </button>
//                 </div>
                
//                 <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    
//                     <input type="text" value={personName} onChange={e => setPersonName(e.target.value)} placeholder="Имя человека/компании" required style={{ flex: '1 1 200px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
//                     <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Сумма (₽)" required min="0.01" step="0.01" style={{ flex: '1 1 100px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
//                     <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ flex: '1 1 150px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
//                     <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание (необязательно)" style={{ flex: '2 1 200px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

//                     <button type="submit" style={{ flex: '1 1 auto', padding: '10px 15px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
//                         Записать
//                     </button>
//                 </form>
//                 {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
//             </div>

//             {/* СПИСОК АКТИВНЫХ ДОЛГОВ */}
//             <DebtList 
//                 title="Активные Записи" 
//                 list={activeDebts} 
//                 onSettle={startPayment}
//                 onDelete={handleDelete}
//                 isSettledList={false}
//             />

//             {/* СПИСОК ПОГАШЕННЫХ ДОЛГОВ */}
//             <DebtList 
//                 title="Погашенные Записи" 
//                 list={resolvedDebts} 
//                 onSettle={() => {}}
//                 onDelete={handleDelete}
//                 isSettledList={true}
//             />
            
//             {/* МОДАЛЬНОЕ ОКНО ОПЛАТЫ */}
//             {isPaymentModalOpen && (
//                 <PaymentModal 
//                     debt={currentDebtForPayment}
//                     paymentAmount={paymentAmount}
//                     setPaymentAmount={setPaymentAmount}
//                     handleSubmit={handlePaymentSubmit} // Использует главный обработчик
//                     onClose={closePaymentModal}
//                 />
//             )}
//         </div>
//     );
// };

// // ====================================================================
// // Вспомогательный компонент для карточки сводки
// // ====================================================================
// const SummaryCard = ({ title, amount, color }) => (
//     <div style={{ flex: 1, padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', background: color, color: 'white' }}>
//         <h4 style={{ margin: '0 0 10px 0' }}>{title}</h4>
//         <p style={{ fontSize: '1.5em', margin: 0, fontWeight: 'bold' }}>
//             {amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 })}
//         </p>
//     </div>
// );

// // ====================================================================
// // Вспомогательный компонент для списка долгов/займов
// // ====================================================================
// const DebtList = ({ title, list, onSettle, onDelete, isSettledList }) => (
//     <div style={{ marginTop: '40px' }}>
//         <h2>{title} ({list.length})</h2>
//         {list.length === 0 ? (
//             <p>Нет записей в этой категории.</p>
//         ) : (
//             <ul style={{ listStyle: 'none', padding: 0 }}>
//                 {list.map(debt => {
//                     const remaining = parseFloat(debt.amount) - parseFloat(debt.paidAmount);
//                     const debtTypeColor = debt.type === 'loan' ? '#28a745' : '#dc3545';
//                     const typeLabel = debt.type === 'loan' ? 'Мне должны' : 'Я должен';
                    
//                     // Расчеты для транзакций
//                     const transactionCount = debt.payments ? debt.payments.length : 0;
//                     // Дата погашения (берем дату последней транзакции, если isSettled=true)
//                     const settledDate = isSettledList && transactionCount > 0 
//                         ? debt.payments.slice(-1)[0].paymentDate : null;


//                     return (
//                         <li key={debt.id} style={{ 
//                             padding: '15px', 
//                             borderBottom: '1px solid #eee', 
//                             display: 'flex', 
//                             justifyContent: 'space-between', 
//                             alignItems: 'center', 
//                             background: '#fff',
//                             borderRadius: '4px',
//                             marginBottom: '10px'
//                         }}>
//                             <div style={{ flex: 3 }}>
//                                 <strong>{debt.name}</strong> 
//                                 <span style={{ marginLeft: '10px', padding: '3px 8px', borderRadius: '3px', fontSize: '0.8em', color: 'white', background: debtTypeColor }}>
//                                     {typeLabel}
//                                 </span>
//                                 <div style={{ fontSize: '0.9em', color: '#666' }}>{debt.description || '—'}</div>
                                
//                                 {/* Отображение количества транзакций */}
//                                 {transactionCount > 0 && (
//                                     <div style={{ fontSize: '0.8em', color: '#007bff', marginTop: '5px' }}>
//                                         {transactionCount} {transactionCount === 1 ? 'транзакция' : (transactionCount < 5 ? 'транзакции' : 'транзакций')}
//                                     </div>
//                                 )}
//                             </div>
                            
//                             <div style={{ flex: 1, textAlign: 'right' }}>
//                                 Общая сумма: <strong style={{color: debtTypeColor}}>{parseFloat(debt.amount).toLocaleString('ru-RU')} ₽</strong>
//                             </div>

//                             <div style={{ flex: 1, textAlign: 'right' }}>
//                                 Выплачено: <strong style={{color: '#007bff'}}>{parseFloat(debt.paidAmount).toLocaleString('ru-RU')} ₽</strong>
//                                 <br/>
//                                 {isSettledList ? (
//                                     <>
//                                         <span style={{ color: '#28a745', fontWeight: 'bold' }}>Полностью погашено</span>
//                                         {settledDate && (
//                                             <div style={{ fontSize: '0.8em', color: '#6c757d' }}>
//                                                 ({new Date(settledDate).toLocaleDateString()})
//                                             </div>
//                                         )}
//                                     </>
//                                 ) : (
//                                     <span style={{ color: remaining > 0 ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
//                                         Остаток: {remaining.toLocaleString('ru-RU')} ₽
//                                     </span>
//                                 )}
//                             </div>
                            
//                             <div style={{ flex: 1, textAlign: 'right', minWidth: '160px' }}>
//                                 {!isSettledList && (
//                                     <button onClick={() => onSettle(debt)} style={{ background: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer' }}>
//                                         Внести платеж
//                                     </button>
//                                 )}
//                                 <button onClick={() => onDelete(debt.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
//                                     Удалить
//                                 </button>
//                             </div>
//                         </li>
//                     )
//                 })}
//             </ul>
//         )}
//     </div>
// );


// // ====================================================================
// // КОМПОНЕНТ: Модальное окно для платежа (с датой)
// // ====================================================================
// const PaymentModal = ({ debt, paymentAmount, setPaymentAmount, handleSubmit, onClose }) => {
//     const remaining = debt.amount - debt.paidAmount;
    
//     // Состояние для даты платежа (по умолчанию - сегодня)
//     const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 

//     // Новый обработчик для отправки данных: включает дату и сумму
//     const handleFormSubmit = (e) => {
//         // Вызываем внешний обработчик, передавая ему дату
//         handleSubmit(e, date); 
//     };

//     // Внутренний стиль для модального окна
//     const modalStyle = {
//         position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
//         backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
//         justifyContent: 'center', alignItems: 'center', zIndex: 1000
//     };
//     const contentStyle = {
//         backgroundColor: 'white', padding: '30px', borderRadius: '8px', 
//         width: '400px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
//     };

//     return (
//         <div style={modalStyle}>
//             <div style={contentStyle}>
//                 <h3>Внести платеж</h3>
//                 <p><strong>Кому/От кого:</strong> {debt.name}</p>
//                 <p><strong>Осталось к оплате:</strong> {remaining.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 })}</p>

//                 <form onSubmit={handleFormSubmit}>
                    
//                     <label style={{ display: 'block', marginBottom: '5px', marginTop: '10px' }}>Дата платежа:</label>
//                     <input
//                         type="date"
//                         value={date}
//                         onChange={(e) => setDate(e.target.value)}
//                         required
//                         style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
//                     />
                    
//                     <label style={{ display: 'block', marginBottom: '5px' }}>Сумма платежа (до {remaining.toFixed(2)} ₽):</label>
//                     <input
//                         type="number"
//                         value={paymentAmount}
//                         onChange={(e) => setPaymentAmount(e.target.value)}
//                         required
//                         min="0.01"
//                         step="0.01"
//                         max={remaining.toFixed(2)}
//                         style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc' }}
//                     />

//                     <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//                         <button type="button" onClick={onClose} style={{ padding: '10px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
//                             Отмена
//                         </button>
//                         <button type="submit" style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
//                             Подтвердить платеж
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };


// export default DebtPage;

// src/pages/DebtPage.jsx
import React, { useState, useEffect } from 'react';
// Импортируем функции API. payDebtAmount должен принимать id, amount, date.
import { fetchDebts, createDebt, payDebtAmount, deleteDebt } from '../api/debtApi';

const DebtPage = () => {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Состояния формы создания
    const [personName, setPersonName] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('lending'); 
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    
    // --- СОСТОЯНИЯ ДЛЯ МОДАЛЬНЫХ ОКОН ---
    // Для внесения платежа
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [currentDebtForPayment, setCurrentDebtForPayment] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    // Для просмотра истории транзакций
    const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
    const [currentDebtForTransactions, setCurrentDebtForTransactions] = useState(null);
    // --- КОНЕЦ СОСТОЯНИЙ МОДАЛЬНЫХ ОКОН ---


    // --- ЛОГИКА ЗАГРУЗКИ ---
    const loadDebts = async () => {
        setLoading(true);
        try {
            const data = await fetchDebts();
            setDebts(data);
        } catch (err) {
            setError("Не удалось загрузить данные о долгах.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDebts();
    }, []);

    // --- ЛОГИКА ФОРМЫ СОЗДАНИЯ ---
    const resetForm = () => {
        setPersonName('');
        setAmount('');
        setDescription('');
        setType('lending');
        setDate(new Date().toISOString().split('T')[0]);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!personName || !amount || !type || !date) {
            setError("Имя, сумма, тип и дата обязательны.");
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError("Сумма должна быть положительным числом.");
            return;
        }
        
        const debtTypeForBackend = type === 'lending' ? 'loan' : 'owed';

        try {
            await createDebt(personName, numericAmount, debtTypeForBackend, date, description);
            await loadDebts();
            resetForm();
        } catch (err) {
            const msg = err.response?.data?.msg || "Ошибка сохранения записи.";
            setError(msg);
        }
    };
    
    // --- ЛОГИКА ОПЛАТЫ (ЧАСТИЧНОЙ И ПОЛНОЙ) ---
    
    // Открывает модальное окно для внесения платежа
    const startPayment = (debt) => {
        const remaining = debt.amount - debt.paidAmount;
        if (remaining <= 0) {
            alert("Этот долг уже погашен.");
            return;
        }
        setCurrentDebtForPayment(debt);
        setPaymentAmount(remaining.toFixed(2));
        setIsPaymentModalOpen(true);
    };

    // Закрывает модальное окно платежа
    const closePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setCurrentDebtForPayment(null);
        setPaymentAmount('');
    };
    
    // Обработка платежа (принимает дату платежа)
    const handlePaymentSubmit = async (e, paymentDate) => {
        e.preventDefault();
        
        const numericPayment = parseFloat(paymentAmount);
        const remaining = currentDebtForPayment.amount - currentDebtForPayment.paidAmount;

        if (isNaN(numericPayment) || numericPayment <= 0) {
            alert("Сумма платежа должна быть положительным числом.");
            return;
        }
        
        if (numericPayment > remaining + 0.001) {
            alert(`Сумма платежа не может превышать оставшуюся сумму: ${remaining.toFixed(2)} ₽`);
            return;
        }

        try {
            await payDebtAmount(currentDebtForPayment.id, numericPayment, paymentDate); 
            closePaymentModal();
            await loadDebts(); 
        } catch (err) {
            alert("Ошибка при внесении платежа.");
            console.error(err);
        }
    };
    
    // --- ЛОГИКА ПРОСМОТРА ТРАНЗАКЦИЙ ---
    
    const openTransactionsModal = (debt) => {
        setCurrentDebtForTransactions(debt);
        setIsTransactionsModalOpen(true);
    };

    const closeTransactionsModal = () => {
        setIsTransactionsModalOpen(false);
        setCurrentDebtForTransactions(null);
    };

    // --- ЛОГИКА УДАЛЕНИЯ ---
    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
            try {
                await deleteDebt(id);
                await loadDebts();
            } catch (err) {
                alert("Ошибка удаления записи.");
            }
        }
    };


    if (loading) return <div style={{padding: '20px'}}>Загрузка данных...</div>;

    // Сортировка и группировка
    const activeDebts = debts.filter(d => d.isSettled === false);
    const resolvedDebts = debts.filter(d => d.isSettled === true);

    const calculateNet = (list, type) => 
        list.filter(d => d.type === type).reduce((sum, d) => 
            sum + (parseFloat(d.amount) - parseFloat(d.paidAmount)), 0);

    const totalLending = calculateNet(activeDebts, 'loan');
    const totalBorrowing = calculateNet(activeDebts, 'owed');
    
    // --- РЕНДЕРИНГ ОСНОВНОГО КОМПОНЕНТА ---

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Учет Долгов и Займов</h1>
            
            {/* БЛОК СВОДКИ */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <SummaryCard title="Мне должны (Займы)" amount={totalLending} color="#28a745" />
                <SummaryCard title="Я должен (Долги)" amount={totalBorrowing} color="#dc3545" />
                <SummaryCard title="Чистый баланс" amount={totalLending - totalBorrowing} color="#007bff" />
            </div>

            {/* БЛОК ФОРМЫ СОЗДАНИЯ */}
            <div style={{ border: '1px solid #ffc107', padding: '20px', borderRadius: '8px', marginBottom: '30px', background: '#fffbe6' }}>
                <h3>Добавить новую запись</h3>
                
                <div style={{ marginBottom: '15px' }}>
                    <button 
                        onClick={() => setType('lending')}
                        style={{ padding: '10px 15px', background: type === 'lending' ? '#28a745' : '#ccc', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px 0 0 4px' }}>
                        Я дал в долг (Lending)
                    </button>
                    <button 
                        onClick={() => setType('borrowing')}
                        style={{ padding: '10px 15px', background: type === 'borrowing' ? '#dc3545' : '#ccc', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '0 4px 4px 0' }}>
                        Я взял в долг (Borrowing)
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    
                    <input type="text" value={personName} onChange={e => setPersonName(e.target.value)} placeholder="Имя человека/компании" required style={{ flex: '1 1 200px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Сумма (₽)" required min="0.01" step="0.01" style={{ flex: '1 1 100px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ flex: '1 1 150px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание (необязательно)" style={{ flex: '2 1 200px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

                    <button type="submit" style={{ flex: '1 1 auto', padding: '10px 15px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Записать
                    </button>
                </form>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </div>

            {/* СПИСОК АКТИВНЫХ ДОЛГОВ */}
            <DebtList 
                title="Активные Записи" 
                list={activeDebts} 
                onSettle={startPayment}
                onDelete={handleDelete}
                onShowTransactions={openTransactionsModal}
                isSettledList={false}
            />

            {/* СПИСОК ПОГАШЕННЫХ ДОЛГОВ */}
            <DebtList 
                title="Погашенные Записи" 
                list={resolvedDebts} 
                onSettle={() => {}}
                onDelete={handleDelete}
                onShowTransactions={openTransactionsModal}
                isSettledList={true}
            />
            
            {/* МОДАЛЬНОЕ ОКНО ОПЛАТЫ */}
            {isPaymentModalOpen && (
                <PaymentModal 
                    debt={currentDebtForPayment}
                    paymentAmount={paymentAmount}
                    setPaymentAmount={setPaymentAmount}
                    handleSubmit={handlePaymentSubmit}
                    onClose={closePaymentModal}
                />
            )}

            {/* МОДАЛЬНОЕ ОКНО ДЕТАЛЕЙ ТРАНЗАКЦИЙ */}
            {isTransactionsModalOpen && (
                <TransactionsModal
                    debt={currentDebtForTransactions}
                    onClose={closeTransactionsModal}
                />
            )}
        </div>
    );
};

// ====================================================================
// Вспомогательный компонент для карточки сводки
// ====================================================================
const SummaryCard = ({ title, amount, color }) => (
    <div style={{ flex: 1, padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', background: color, color: 'white' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>{title}</h4>
        <p style={{ fontSize: '1.5em', margin: 0, fontWeight: 'bold' }}>
            {amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 })}
        </p>
    </div>
);

// ====================================================================
// Вспомогательный компонент для списка долгов/займов
// ====================================================================
const DebtList = ({ title, list, onSettle, onDelete, onShowTransactions, isSettledList }) => (
    <div style={{ marginTop: '40px' }}>
        <h2>{title} ({list.length})</h2>
        {list.length === 0 ? (
            <p>Нет записей в этой категории.</p>
        ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {list.map(debt => {
                    const remaining = parseFloat(debt.amount) - parseFloat(debt.paidAmount);
                    const debtTypeColor = debt.type === 'loan' ? '#28a745' : '#dc3545';
                    const typeLabel = debt.type === 'loan' ? 'Мне должны' : 'Я должен';
                    
                    // Расчеты для транзакций
                    const transactionCount = debt.payments ? debt.payments.length : 0;
                    // Дата погашения (берем дату последней транзакции, если isSettled=true)
                    const settledDate = isSettledList && transactionCount > 0 
                        ? debt.payments.slice(-1)[0].paymentDate : null;


                    return (
                        <li key={debt.id} style={{ 
                            padding: '15px', 
                            borderBottom: '1px solid #eee', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            background: '#fff',
                            borderRadius: '4px',
                            marginBottom: '10px'
                        }}>
                            <div style={{ flex: 3 }}>
                                <strong>{debt.name}</strong> 
                                <span style={{ marginLeft: '10px', padding: '3px 8px', borderRadius: '3px', fontSize: '0.8em', color: 'white', background: debtTypeColor }}>
                                    {typeLabel}
                                </span>
                                <div style={{ fontSize: '0.9em', color: '#666' }}>{debt.description || '—'}</div>
                            </div>
                            
                            <div style={{ flex: 1, textAlign: 'right' }}>
                                Общая сумма: <strong style={{color: debtTypeColor}}>{parseFloat(debt.amount).toLocaleString('ru-RU')} ₽</strong>
                            </div>

                            <div style={{ flex: 1, textAlign: 'right' }}>
                                Выплачено: <strong style={{color: '#007bff'}}>{parseFloat(debt.paidAmount).toLocaleString('ru-RU')} ₽</strong>
                                <br/>
                                {isSettledList ? (
                                    <>
                                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>Полностью погашено</span>
                                        {settledDate && (
                                            <div style={{ fontSize: '0.8em', color: '#6c757d' }}>
                                                ({new Date(settledDate).toLocaleDateString()})
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span style={{ color: remaining > 0 ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                                        Остаток: {remaining.toLocaleString('ru-RU')} ₽
                                    </span>
                                )}
                            </div>
                            
                            <div style={{ flex: 1, textAlign: 'right', minWidth: '160px' }}>
                                
                                {/* Кнопка деталей транзакций */}
                                {transactionCount > 0 && (
                                    <button 
                                        onClick={() => onShowTransactions(debt)} 
                                        style={{ background: '#6c757d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer' }}>
                                        {transactionCount} {transactionCount === 1 ? 'платеж' : (transactionCount < 5 ? 'платежа' : 'платежей')}
                                    </button>
                                )}
                                
                                {/* Кнопка внести платеж */}
                                {!isSettledList && (
                                    <button onClick={() => onSettle(debt)} style={{ background: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer' }}>
                                        Внести платеж
                                    </button>
                                )}
                                <button onClick={() => onDelete(debt.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                    Удалить
                                </button>
                            </div>
                        </li>
                    )
                })}
            </ul>
        )}
    </div>
);


// ====================================================================
// КОМПОНЕНТ: Модальное окно для платежа (с датой)
// ====================================================================
const PaymentModal = ({ debt, paymentAmount, setPaymentAmount, handleSubmit, onClose }) => {
    const remaining = debt.amount - debt.paidAmount;
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 

    const handleFormSubmit = (e) => {
        handleSubmit(e, date); 
    };

    const modalStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
        justifyContent: 'center', alignItems: 'center', zIndex: 1000
    };
    const contentStyle = {
        backgroundColor: 'white', padding: '30px', borderRadius: '8px', 
        width: '400px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    };

    return (
        <div style={modalStyle}>
            <div style={contentStyle}>
                <h3>Внести платеж</h3>
                <p><strong>Кому/От кого:</strong> {debt.name}</p>
                <p><strong>Осталось к оплате:</strong> {remaining.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 })}</p>

                <form onSubmit={handleFormSubmit}>
                    
                    <label style={{ display: 'block', marginBottom: '5px', marginTop: '10px' }}>Дата платежа:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    
                    <label style={{ display: 'block', marginBottom: '5px' }}>Сумма платежа (до {remaining.toFixed(2)} ₽):</label>
                    <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        required
                        min="0.01"
                        step="0.01"
                        max={remaining.toFixed(2)}
                        style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Отмена
                        </button>
                        <button type="submit" style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Подтвердить платеж
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ====================================================================
// КОМПОНЕНТ: Модальное окно деталей транзакций
// ====================================================================
const TransactionsModal = ({ debt, onClose }) => {
    
    // Сортируем платежи по дате (последние вверху)
    const sortedPayments = debt.payments 
        ? [...debt.payments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)) 
        : [];
        
    const contentStyle = { 
        backgroundColor: 'white', padding: '30px', borderRadius: '8px', 
        width: '550px', // Увеличим ширину
        maxHeight: '80vh', overflowY: 'auto',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    };
    
    const tableHeaderStyle = { padding: '10px', borderBottom: '2px solid #ccc', textAlign: 'left', fontWeight: 'bold' };
    const tableCellStyle = { padding: '10px', borderBottom: '1px solid #eee', textAlign: 'left' };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={contentStyle}>
                
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    История платежей: {debt.name} ({debt.type === 'loan' ? 'Займ' : 'Долг'})
                </h3>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>№</th>
                            <th style={tableHeaderStyle}>Дата платежа</th>
                            <th style={tableHeaderStyle}>Сумма</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPayments.map((payment, index) => (
                            <tr key={payment.id}>
                                <td style={tableCellStyle}>{sortedPayments.length - index}</td>
                                <td style={tableCellStyle}>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                <td style={{ ...tableCellStyle, fontWeight: 'bold', color: '#28a745' }}>
                                    {payment.amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {sortedPayments.length === 0 && (
                    <p style={{ marginTop: '20px', textAlign: 'center', color: '#6c757d' }}>Платежей пока нет.</p>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                    <button onClick={onClose} style={{ padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
};


export default DebtPage;


