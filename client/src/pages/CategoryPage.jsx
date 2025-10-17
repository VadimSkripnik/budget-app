// src/pages/CategoryPage.jsx
import React, { useState } from 'react';
import { useCategories } from '../context/CategoryContext';
import { createCategory, updateCategory, deleteCategory } from '../api/categoryApi';

const CategoryPage = () => {
    const { categories, loading, error, loadCategories } = useCategories();
    
    // Состояния для формы создания/редактирования
    const [editingCategory, setEditingCategory] = useState(null); // null для создания, объект для редактирования
    const [name, setName] = useState('');
    const [type, setType] = useState('expense');
    const [formError, setFormError] = useState(null);

    // Функция для начала редактирования
    const startEdit = (category) => {
        setEditingCategory(category);
        setName(category.name);
        setType(category.type);
        setFormError(null);
    };

    // Функция для сброса формы
    const resetForm = () => {
        setEditingCategory(null);
        setName('');
        setType('expense');
        setFormError(null);
    };

    // Обработчик отправки формы (создание или обновление)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!name.trim()) {
            setFormError("Имя категории не может быть пустым.");
            return;
        }

        try {
            if (editingCategory) {
                // ОБНОВЛЕНИЕ
                await updateCategory(editingCategory.id, name, type);
            } else {
                // СОЗДАНИЕ
                await createCategory(name, type);
            }
            
            // Перезагружаем категории из контекста
            await loadCategories();
            resetForm();
            
        } catch (err) {
            const msg = err.response?.data?.msg || "Ошибка сохранения категории.";
            setFormError(msg);
        }
    };
    
    // Обработчик удаления
    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить эту категорию? Все связанные транзакции будут без категории.')) {
            try {
                await deleteCategory(id);
                // Перезагружаем категории из контекста
                await loadCategories();
            } catch (err) {
                alert("Ошибка удаления категории. Проверьте консоль.");
                console.error("Ошибка удаления:", err);
            }
        }
    };

    if (loading) return <div style={{padding: '20px'}}>Загрузка категорий...</div>;
    if (error) return <div style={{padding: '20px', color: 'red'}}>Ошибка: {error}</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Управление категориями</h1>

            {/* БЛОК ФОРМЫ (СОЗДАНИЕ/РЕДАКТИРОВАНИЕ) */}
            <div style={{ border: '1px solid #007bff', padding: '20px', borderRadius: '8px', marginBottom: '30px', background: '#e9f7ff' }}>
                <h3>{editingCategory ? 'Редактировать категорию' : 'Создать новую категорию'}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Название:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Название категории"
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    
                    <div style={{ width: '150px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Тип:</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="expense">Расход</option>
                            <option value="income">Доход</option>
                        </select>
                    </div>

                    <button type="submit" style={{ padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {editingCategory ? 'Сохранить' : 'Создать'}
                    </button>
                    
                    {editingCategory && (
                        <button type="button" onClick={resetForm} style={{ padding: '10px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Отмена
                        </button>
                    )}
                </form>
                {formError && <p style={{ color: 'red', marginTop: '10px' }}>{formError}</p>}
            </div>

            {/* СПИСОК КАТЕГОРИЙ */}
            <h2>Существующие категории</h2>
            {categories.length === 0 && <p>Категорий нет. Создайте первую!</p>}
            
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {categories.map(cat => (
                    <li key={cat.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: editingCategory?.id === cat.id ? '#fff3cd' : 'none' }}>
                        <div>
                            <strong>{cat.name}</strong> 
                            <span style={{ marginLeft: '10px', padding: '3px 8px', borderRadius: '3px', fontSize: '0.8em', color: 'white', background: cat.type === 'income' ? '#28a745' : '#dc3545' }}>
                                {cat.type === 'income' ? 'Доход' : 'Расход'}
                            </span>
                        </div>
                        <div>
                            <button onClick={() => startEdit(cat)} style={{ background: '#ffc107', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '10px', cursor: 'pointer' }}>
                                Редактировать
                            </button>
                            <button onClick={() => handleDelete(cat.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                Удалить
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoryPage;
