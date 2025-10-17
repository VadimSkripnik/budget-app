// routes/debt.js
const express = require('express');
const { fn, col, literal } = require('sequelize'); 
const auth = require('../middleware/auth');
const Debt = require('../models/Debt');
const Payment = require('../models/Payment');

const sequelize = require('../db');

const router = express.Router();

// --- 1. CRUD ЗАЙМОВ ---

// @route   POST /api/debts
// @desc    Создание нового займа (дать или взять)
// @access  Private
router.post('/', auth, async (req, res) => {
    const { personName, amount, type, date, description } = req.body; 
    
    if (!personName || !amount || !type || !date) {
        return res.status(400).json({ msg: 'Missing required fields: personName, amount, type, or date.' });
    }
    if (!['loan', 'owed'].includes(type)) {
        return res.status(400).json({ msg: 'Invalid type value. Must be "loan" or "owed".' });
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ msg: 'Amount must be a positive number.' });
    }

    try {
        const newDebt = await Debt.create({
            name: personName, 
            amount: parseFloat(amount),
            type: type,
            dueDate: date,
            description: description,
            userId: req.user.id,
            paidAmount: 0.00,
            isSettled: false
        });
        res.status(201).json(newDebt);
    } catch (err) {
        console.error("Sequelize Debt POST Error:", err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/debts
// @desc    Получение всех займов
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const debts = await Debt.findAll({
            where: { userId: req.user.id },
            order: [['dueDate', 'ASC']],
            // Включаем информацию о платежах
            include: [{
                model: Payment,
                as: 'payments', // Используем 'payments' как определено в Payment.js
                attributes: ['id', 'amount', 'paymentDate'], // Только нужные поля
                required: false // Необязательно: возвращает долг, даже если нет платежей
            }]
        });
        res.json(debts);
    } catch (err) {
        console.error("Sequelize Debt GET Error:", err.message);
        res.status(500).send('Server error');
    }
});

// router.get('/', auth, async (req, res) => {
//     try {
//         const debts = await Debt.findAll({
//             where: { userId: req.user.id },
//             order: [['dueDate', 'ASC']]
//         });
//         res.json(debts);
//     } catch (err) {
//         console.error("Sequelize Debt GET Error:", err.message);
//         res.status(500).send('Server error');
//     }
// });








// @route   PUT /api/debts/:id
// @desc    Редактирование существующего займа/долга
// @access  Private





router.put('/:id', auth, async (req, res) => {
    const { personName, amount, type, dueDate, isSettled, paidAmount, description } = req.body;

    try {
        const debt = await Debt.findOne({
            where: { id: req.params.id, userId: req.user.id },
        });

        if (!debt) {
            return res.status(404).json({ msg: 'Debt not found or does not belong to user.' });
        }
        
        const updatedDebt = await debt.update({
            name: personName !== undefined ? personName : debt.name,
            amount: amount !== undefined ? parseFloat(amount) : debt.amount,
            type: type !== undefined ? type : debt.type,
            dueDate: dueDate !== undefined ? dueDate : debt.dueDate,
            isSettled: isSettled !== undefined ? isSettled : debt.isSettled,
            paidAmount: paidAmount !== undefined ? parseFloat(paidAmount) : debt.paidAmount,
            description: description !== undefined ? description : debt.description,
        });

        res.json(updatedDebt);
    } catch (err) {
        console.error("Sequelize Debt PUT Error:", err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/debts/:id
// @desc    Удаление займа/долга
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const debt = await Debt.findOne({
            where: { id: req.params.id, userId: req.user.id },
        });

        if (!debt) {
            return res.status(404).json({ msg: 'Debt not found or does not belong to user.' });
        }

        await debt.destroy();
        res.json({ msg: 'Debt removed successfully' });
    } catch (err) {
        console.error("Sequelize Debt DELETE Error:", err.message);
        res.status(500).send('Server error');
    }
});


// --- 2. УПРАВЛЕНИЕ ПЛАТЕЖАМИ И СВОДКА ---

// // @route   PUT /api/debts/:id/payment

// @route   PUT /api/debts/:id/payment
// @desc    Запись частичного или полного платежа по долгу
// @access  Private
router.put('/:id/payment', auth, async (req, res) => {
    const { amount, paymentDate } = req.body; // Теперь можем принять paymentDate
    const transaction = await sequelize.transaction(); // <--- Начинаем транзакцию

    if (!amount || amount <= 0) {
        return res.status(400).json({ msg: 'Payment amount must be a positive number.' });
    }

    try {
        const debt = await Debt.findOne({
            where: { id: req.params.id, userId: req.user.id }
        }, { transaction }); // Используем транзакцию

        if (!debt) {
            await transaction.rollback();
            return res.status(404).json({ msg: 'Debt not found or does not belong to user.' });
        }
        
        const numericAmount = parseFloat(amount);
        const remaining = debt.amount - debt.paidAmount;

        if (numericAmount > remaining + 0.001) {
             await transaction.rollback();
             return res.status(400).json({ msg: 'Payment exceeds remaining debt amount.' });
        }

        // 1. Создаем новую запись платежа
        const newPayment = await Payment.create({
            amount: numericAmount,
            paymentDate: paymentDate || new Date().toISOString().split('T')[0],
            debtId: debt.id,
            userId: req.user.id
        }, { transaction }); // Используем транзакцию

        // 2. Обновляем общую сумму в Debt
        const newPaidAmount = debt.paidAmount + numericAmount;
        const isSettled = newPaidAmount >= debt.amount;

        await debt.update({
            paidAmount: newPaidAmount,
            isSettled: isSettled
        }, { transaction }); // Используем транзакцию
        
        await transaction.commit(); // Подтверждаем транзакцию

        res.json(debt);
    } catch (err) {
        await transaction.rollback(); // Откатываем в случае ошибки
        console.error("Sequelize Payment PUT Error:", err.message);
        res.status(500).send('Server error');
    }
});


// // @desc    Запись частичного или полного платежа по долгу
// // @access  Private
// router.put('/:id/payment', auth, async (req, res) => {
//     const { amount } = req.body;
//     if (!amount || amount <= 0) {
//         return res.status(400).json({ msg: 'Payment amount must be a positive number.' });
//     }

//     try {
//         const debt = await Debt.findOne({
//             where: { id: req.params.id, userId: req.user.id }
//         });

//         if (!debt) {
//             return res.status(404).json({ msg: 'Debt not found or does not belong to user.' });
//         }
//         // **********************************************
//         // * ЭТОТ БЛОК РАБОТАЕТ И ПОГАШАЕТ ДОЛГ
//         // **********************************************
//         const newPaidAmount = debt.paidAmount + parseFloat(amount);
//         const isSettled = newPaidAmount >= debt.amount;

//         await debt.update({
//             paidAmount: newPaidAmount,
//             isSettled: isSettled
//         });

//         res.json(debt);
//     } catch (err) {
//         console.error("Sequelize Payment PUT Error:", err.message);
//         res.status(500).send('Server error');
//     }
// });





// @route   GET /api/debts/summary
// @desc    Получение сводки по займам и долгам
// @access  Private
router.get('/summary', auth, async (req, res) => {
    try {
        const summary = await Debt.findAll({
            attributes: [
                [fn('SUM', literal("CASE WHEN type = 'loan' THEN amount - paidAmount ELSE 0 END")), 'totalLoan'],
                [fn('SUM', literal("CASE WHEN type = 'owed' THEN amount - paidAmount ELSE 0 END")), 'totalOwed'],
            ],
            where: {
                userId: req.user.id,
                isSettled: false, 
            },
            raw: true,
        });

        const totalLoan = parseFloat(summary[0].totalLoan || 0);
        const totalOwed = parseFloat(summary[0].totalOwed || 0);
        
        const netPosition = totalLoan - totalOwed;

        res.json({
            totalLoan: totalLoan.toFixed(2),
            totalOwed: totalOwed.toFixed(2),
            netPosition: netPosition.toFixed(2),
        });

    } catch (err) {
        console.error("Sequelize Summary GET Error:", err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;

