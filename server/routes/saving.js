
// server/routes/saving.js

const express = require('express');
const auth = require('../middleware/auth');
const SavingGoal = require('../models/SavingGoal');

const router = express.Router();

// @route   POST /api/savings
// @desc    Создать новую цель накопления
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, targetAmount, targetDate } = req.body;

    try {
        const newGoal = await SavingGoal.create({
            name,
            targetAmount: parseFloat(targetAmount),
            targetDate: targetDate || null,
            userId: req.user.id
        });
        res.json(newGoal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/savings
// @desc    Получить все цели накоплений пользователя
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const goals = await SavingGoal.findAll({
            where: { userId: req.user.id },
            order: [['targetDate', 'ASC']]
        });
        res.json(goals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/savings/:id/deposit
// @desc    Внести средства в цель накопления
// @access  Private
router.put('/:id/deposit', auth, async (req, res) => {
    const { amount } = req.body;
    
    if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ msg: 'Сумма депозита должна быть положительной.' });
    }

    try {
        const goal = await SavingGoal.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!goal) {
            return res.status(404).json({ msg: 'Цель не найдена.' });
        }
        
        const numericAmount = parseFloat(amount);
        const newCurrentAmount = goal.currentAmount + numericAmount;
        
        let isCompleted = goal.isCompleted;

        // Проверка на завершение цели
        if (newCurrentAmount >= goal.targetAmount) {
            isCompleted = true;
        }

        await goal.update({
            currentAmount: newCurrentAmount,
            isCompleted: isCompleted
        });

        res.json(goal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/savings/:id
// @desc    Удалить цель
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const result = await SavingGoal.destroy({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (result === 0) {
            return res.status(404).json({ msg: 'Цель не найдена.' });
        }

        res.json({ msg: 'Цель успешно удалена' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;
