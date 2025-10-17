// // routes/budget.js
// const express = require('express');
// const { fn, col, literal } = require('sequelize');
// const auth = require('../middleware/auth');
// const Budget = require('../models/Budget');
// const Transaction = require('../models/Transaction'); // Нужен для расчета остатка
// const Category = require('../models/Category');
// const router = express.Router();

// // @route   POST /api/budgets
// // @desc    Установка или обновление лимита для категории
// // @access  Private
// router.post('/', auth, async (req, res) => {
//   const { limit, categoryId, month, year } = req.body;

//   try {
//     // Проверка принадлежности категории
//     const category = await Category.findOne({ where: { id: categoryId, userId: req.user.id } });
//     if (!category) {
//       return res.status(404).json({ msg: 'Category not found or does not belong to user.' });
//     }
    
//     // Создаем или обновляем запись (upsert)
//     const [budget, created] = await Budget.findOrCreate({
//       where: { userId: req.user.id, categoryId, month, year },
//       defaults: { limit, categoryId, month, year, userId: req.user.id }
//     });

//     if (!created) {
//         // Если запись уже была, то обновляем лимит
//         await budget.update({ limit });
//     }

//     res.status(200).json({ message: created ? 'Budget set successfully' : 'Budget updated successfully', budget });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // @route   GET /api/budgets
// // @desc    Получение всех лимитов пользователя с расчетом остатка
// // @access  Private
// router.get('/', auth, async (req, res) => {
//   try {
//     // 1. Получаем все лимиты пользователя
//     const budgets = await Budget.findAll({
//       where: { userId: req.user.id },
//       include: [{ model: Category, attributes: ['name', 'type'] }],
//     });

//     if (budgets.length === 0) {
//         return res.json([]);
//     }

//     // 2. Рассчитываем сумму трат по каждой категории в рамках установленных месяцев/годов
//     const transactionsPromises = budgets.map(async (budget) => {
//         const spent = await Transaction.findAll({
//             attributes: [
//                 [fn('SUM', col('amount')), 'totalSpent']
//             ],
//             where: {
//                 userId: req.user.id,
//                 categoryId: budget.categoryId,
//                 // Фильтруем транзакции по дате: в рамках месяца и года бюджета
//                 createdAt: literal(`strftime('%m', createdAt) = '${String(budget.month).padStart(2, '0')}' AND strftime('%Y', createdAt) = '${budget.year}'`),
//                 type: 'expense' // Лимит обычно ставится на расходы
//             },
//             raw: true,
//         });

//         const totalSpent = parseFloat(spent[0].totalSpent || 0);

//         return {
//             budgetId: budget.id,
//             limit: budget.limit,
//             month: budget.month,
//             year: budget.year,
//             categoryName: budget.Category.name,
//             totalSpent: totalSpent.toFixed(2),
//             remaining: (budget.limit - totalSpent).toFixed(2),
//             isOverBudget: totalSpent > budget.limit
//         };
//     });

//     const detailedBudgets = await Promise.all(transactionsPromises);
//     res.json(detailedBudgets);

//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });


// // @route   GET /api/budgets/:id
// // @desc    Получение конкретного лимита по ID
// // @access  Private
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const budget = await Budget.findOne({
//       where: {
//         id: req.params.id,
//         userId: req.user.id, // Только свой бюджет
//       },
//       include: [{ model: Category, attributes: ['name', 'type'] }],
//     });

//     if (!budget) {
//       return res.status(404).json({ msg: 'Budget not found or does not belong to user.' });
//     }

//     res.json(budget);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // @route   DELETE /api/budgets/:id
// // @desc    Удаление лимита
// // @access  Private
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const budget = await Budget.findOne({
//       where: {
//         id: req.params.id,
//         userId: req.user.id, // Только свой бюджет
//       },
//     });

//     if (!budget) {
//       return res.status(404).json({ msg: 'Budget not found or does not belong to user.' });
//     }

//     await budget.destroy();
//     res.json({ msg: 'Budget removed successfully' });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });


// module.exports = router;





// routes/budget.js
const express = require('express');
const { fn, col, literal } = require('sequelize');
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction'); // Нужен для расчета остатка
const Category = require('../models/Category');

const router = express.Router();

// @route   POST /api/budgets
// @desc    Установка или обновление лимита для категории
// @access  Private
router.post('/', auth, async (req, res) => {
    // Получаем данные с фронтенда. 'month' приходит в виде строки 'YYYY-MM'
    // const { limit: limitAmount, categoryId, month: monthYearStr } = req.body;
    const { limitAmount, categoryId, month: monthYearStr } = req.body;
    
    // --- ИСПРАВЛЕНИЕ: Парсинг строки 'YYYY-MM' в числовые month и year ---
    if (!monthYearStr || typeof monthYearStr !== 'string' || monthYearStr.length !== 7) {
        return res.status(400).json({ msg: 'Invalid month format. Expected YYYY-MM.' });
    }
    
    const [yearStr, monthStr] = monthYearStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

    // Проверка, что limitAmount - корректное число
    if (isNaN(parseFloat(limitAmount)) || parseFloat(limitAmount) <= 0) {
        return res.status(400).json({ msg: 'Limit amount must be a positive number.' });
    }

    try {
        // Проверка принадлежности категории
        const category = await Category.findOne({ where: { id: categoryId, userId: req.user.id } });
        if (!category) {
            return res.status(404).json({ msg: 'Category not found or does not belong to user.' });
        }
        
        // Создаем или обновляем запись (upsert)
        const [budget, created] = await Budget.findOrCreate({
            where: { userId: req.user.id, categoryId, month, year }, // Используем числовые month и year
            defaults: { 
                limit: limitAmount, 
                categoryId, 
                month, 
                year, 
                userId: req.user.id 
            }
        });

        if (!created) {
            // Если запись уже была, то обновляем лимит
            await budget.update({ limit: limitAmount });
        }

        // Возвращаем обновленный бюджет для фронтенда
        const updatedBudget = await Budget.findOne({
             where: { id: budget.id },
             include: [{ model: Category, attributes: ['name', 'type'] }],
        });

        res.status(200).json({ message: created ? 'Budget set successfully' : 'Budget updated successfully', budget: updatedBudget });
    } catch (err) {
        // Если ошибка уникальности (крайне маловероятно, т.к. используем findOrCreate)
        if (err.name === 'SequelizeUniqueConstraintError') {
             return res.status(400).json({ msg: 'A budget for this category and month already exists. Please edit the existing one.' });
        }
        console.error("Budget POST error:", err.message);
        res.status(500).send('Server error');
    }
});


// @route   GET /api/budgets
// @desc    Получение всех лимитов пользователя с расчетом остатка
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // 1. Получаем все лимиты пользователя
        const budgets = await Budget.findAll({
            where: { userId: req.user.id },
            include: [{ model: Category, attributes: ['name', 'type'] }],
        });

        if (budgets.length === 0) {
            return res.json([]);
        }

        // 2. Рассчитываем сумму трат по каждой категории в рамках установленных месяцев/годов
        const transactionsPromises = budgets.map(async (budget) => {
            const spent = await Transaction.findAll({
                attributes: [
                    [fn('SUM', col('amount')), 'totalSpent']
                ],
                where: {
                    userId: req.user.id,
                    categoryId: budget.categoryId,
                    // Фильтруем транзакции по дате: в рамках месяца и года бюджета
                    // (Предполагается, что используется SQLite)
                    createdAt: literal(`strftime('%m', createdAt) = '${String(budget.month).padStart(2, '0')}' AND strftime('%Y', createdAt) = '${budget.year}'`),
                    type: 'expense' // Лимит ставится на расходы
                },
                raw: true,
            });

            const totalSpent = parseFloat(spent[0].totalSpent || 0);
            
            // Находим имя категории, т.к. include: [{ model: Category }] уже сработал
            const categoryName = budget.Category ? budget.Category.name : 'Категория удалена';

            return {
                budgetId: budget.id,
                limitAmount: budget.limit, // Переименовано, чтобы совпадало с фронтендом
                month: budget.month,
                year: budget.year,
                categoryName: categoryName,
                totalSpent: totalSpent.toFixed(2),
                remaining: (budget.limit - totalSpent).toFixed(2),
                isOverBudget: totalSpent > budget.limit
            };
        });

        const detailedBudgets = await Promise.all(transactionsPromises);
        res.json(detailedBudgets);

    } catch (err) {
        console.error("Budget GET error:", err.message);
        res.status(500).send('Server error');
    }
});


// @route   DELETE /api/budgets/:id
// @desc    Удаление лимита
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const budget = await Budget.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id, // Только свой бюджет
            },
        });

        if (!budget) {
            return res.status(404).json({ msg: 'Budget not found or does not belong to user.' });
        }

        await budget.destroy();
        res.json({ msg: 'Budget removed successfully' });
    } catch (err) {
        console.error("Budget DELETE error:", err.message);
        res.status(500).send('Server error');
    }
});


// ... (маршрут GET /api/budgets/:id был удален, т.к. GET /api/budgets уже возвращает детали)


module.exports = router;

