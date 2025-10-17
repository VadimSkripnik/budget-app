// src/pages/SavingPage.jsx

import React, { useState, useEffect } from 'react';
import { fetchSavingGoals, createSavingGoal, depositToGoal, deleteSavingGoal } from '../api/savingApi';

const SavingPage = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояния формы создания цели
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');

    // Состояния для депозита
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [currentGoalForDeposit, setCurrentGoalForDeposit] = useState(null);
    const [depositAmount, setDepositAmount] = useState('');

    // --- ЛОГИКА ЗАГРУЗКИ ---
    const loadGoals = async () => {
        setLoading(true);
        try {
            const data = await fetchSavingGoals();
            setGoals(data);
        } catch (err) {
            setError("Не удалось загрузить цели накоплений.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGoals();
    }, []);

    // --- ЛОГИКА СОЗДАНИЯ ЦЕЛИ ---
    const handleCreateGoal = async (e) => {
        e.preventDefault();
        setError(null);
        if (!name || !targetAmount) {
            setError("Имя и целевая сумма обязательны.");
            return;
        }
        const numericAmount = parseFloat(targetAmount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError("Целевая сумма должна быть положительным числом.");
            return;
        }

        try {
            await createSavingGoal(name, numericAmount, targetDate || null);
            await loadGoals();
            setName('');
            setTargetAmount('');
            setTargetDate('');
        } catch (err) {
            setError("Ошибка при создании цели.");
            console.error(err);
        }
    };

    // --- ЛОГИКА ДЕПОЗИТА ---
    const startDeposit = (goal) => {
        setCurrentGoalForDeposit(goal);
        setDepositAmount('');
        setIsDepositModalOpen(true);
    };

    const closeDepositModal = () => {
        setIsDepositModalOpen(false);
        setCurrentGoalForDeposit(null);
        setDepositAmount('');
    };

    const handleDepositSubmit = async (e) => {
        e.preventDefault();

        const numericDeposit = parseFloat(depositAmount);
        if (isNaN(numericDeposit) || numericDeposit <= 0) {
            alert("Сумма должна быть положительным числом.");
            return;
        }

        try {
            await depositToGoal(currentGoalForDeposit.id, numericDeposit);
            closeDepositModal();
            await loadGoals();
        } catch (err) {
            alert("Ошибка при внесении средств.");
            console.error(err);
        }
    };

    // --- ЛОГИКА УДАЛЕНИЯ ---
    const handleDeleteGoal = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить эту цель?')) {
            try {
                await deleteSavingGoal(id);
                await loadGoals();
            } catch (err) {
                alert("Ошибка удаления цели.");
            }
        }
    };

    if (loading) return <div style={{padding: '20px'}}>Загрузка целей...</div>;

    const activeGoals = goals.filter(g => g.isCompleted === false);
    const completedGoals = goals.filter(g => g.isCompleted === true);

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Мои Накопления и Цели</h1>
            
            {/* БЛОК СОЗДАНИЯ ЦЕЛИ */}
            <div style={{ border: '1px solid #007bff', padding: '20px', borderRadius: '8px', marginBottom: '30px', background: '#e6f2ff' }}>
                <h3>Создать новую цель накопления</h3>
                <form onSubmit={handleCreateGoal} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Название цели (Отпуск, Ноутбук)" required style={{ flex: '2 1 200px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="Целевая сумма (₽)" required min="0.01" step="0.01" style={{ flex: '1 1 150px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} placeholder="Дата (необязательно)" style={{ flex: '1 1 150px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

                    <button type="submit" style={{ flex: '1 1 auto', padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Создать Цель
                    </button>
                </form>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </div>

            {/* СПИСОК АКТИВНЫХ ЦЕЛЕЙ */}
            <GoalList title="Активные Цели" list={activeGoals} onDeposit={startDeposit} onDelete={handleDeleteGoal} />

            {/* СПИСОК ЗАВЕРШЕННЫХ ЦЕЛЕЙ */}
            <GoalList title="Завершенные Цели" list={completedGoals} onDeposit={() => {}} onDelete={handleDeleteGoal} isCompletedList={true} />

            {/* МОДАЛЬНОЕ ОКНО ДЕПОЗИТА */}
            {isDepositModalOpen && (
                <DepositModal
                    goal={currentGoalForDeposit}
                    depositAmount={depositAmount}
                    setDepositAmount={setDepositAmount}
                    handleSubmit={handleDepositSubmit}
                    onClose={closeDepositModal}
                />
            )}
        </div>
    );
};

// ====================================================================
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ====================================================================

const GoalList = ({ title, list, onDeposit, onDelete, isCompletedList = false }) => (
    <div style={{ marginTop: '40px' }}>
        <h2>{title} ({list.length})</h2>
        {list.length === 0 ? (
            <p>Нет записей в этой категории.</p>
        ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {list.map(goal => {
                    const remaining = goal.targetAmount - goal.currentAmount;
                    const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                    
                    return (
                        <li key={goal.id} style={{ 
                            padding: '15px', 
                            borderBottom: '1px solid #eee', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            background: '#fff',
                            borderRadius: '4px',
                            marginBottom: '10px',
                            borderLeft: `5px solid ${isCompletedList ? '#28a745' : '#ffc107'}`
                        }}>
                            <div style={{ flex: 3 }}>
                                <strong>{goal.name}</strong> 
                                <div style={{ fontSize: '0.9em', color: '#666' }}>
                                    Цель: {goal.targetAmount.toLocaleString('ru-RU')} ₽ 
                                    {goal.targetDate && ` (до ${new Date(goal.targetDate).toLocaleDateString()})`}
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', marginTop: '5px' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: isCompletedList ? '#28a745' : '#007bff', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                            
                            <div style={{ flex: 1, textAlign: 'right' }}>
                                Накоплено: <strong style={{color: '#007bff'}}>{goal.currentAmount.toLocaleString('ru-RU')} ₽</strong>
                                <br/>
                                <span style={{ color: isCompletedList ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                                    {isCompletedList ? 'Готово!' : `Осталось: ${remaining.toLocaleString('ru-RU')} ₽`}
                                </span>
                            </div>
                            
                            <div style={{ flex: 1, textAlign: 'right', minWidth: '160px' }}>
                                {!isCompletedList && (
                                    <button onClick={() => onDeposit(goal)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer' }}>
                                        Внести средства
                                    </button>
                                )}
                                <button onClick={() => onDelete(goal.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
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

const DepositModal = ({ goal, depositAmount, setDepositAmount, handleSubmit, onClose }) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    
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
                <h3>Внести средства в цель: {goal.name}</h3>
                <p><strong>Осталось до цели:</strong> {remaining.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 })}</p>

                <form onSubmit={handleSubmit}>
                    
                    <label style={{ display: 'block', marginBottom: '5px' }}>Сумма депозита:</label>
                    <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        required
                        min="0.01"
                        step="0.01"
                        style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Отмена
                        </button>
                        <button type="submit" style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Внести
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default SavingPage;
