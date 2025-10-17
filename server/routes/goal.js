const express = require('express');
const auth = require('../middleware/auth');
const Goal = require('../models/Goal');
const router = express.Router();

// @route   POST /api/goals
// @desc    Создание новой цели накопления
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, targetAmount, dueDate } = req.body;
  try {
    const newGoal = await Goal.create({
      name,
      targetAmount,
      dueDate,
      userId: req.user.id,
    });
    res.status(201).json(newGoal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/goals
// @desc    Получение всех целей
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.findAll({ where: { userId: req.user.id } });
    res.json(goals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/goals/:id
// @desc    Редактирование существующей цели
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, targetAmount, dueDate, currentAmount } = req.body;
  
  try {
    const goal = await Goal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found or does not belong to user.' });
    }
    
    // Обновляем цель, используя только переданные поля
    const updatedGoal = await goal.update({
        name: name !== undefined ? name : goal.name,
        targetAmount: targetAmount !== undefined ? targetAmount : goal.targetAmount,
        dueDate: dueDate !== undefined ? dueDate : goal.dueDate,
        currentAmount: currentAmount !== undefined ? currentAmount : goal.currentAmount, 
    });

    res.json(updatedGoal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/goals/:id/contribute
// @desc    Внесение средств в цель (увеличение currentAmount)
// @access  Private
router.put('/:id/contribute', auth, async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ msg: 'Amount must be a positive number.' });
    }

    try {
        const goal = await Goal.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!goal) {
            return res.status(404).json({ msg: 'Goal not found or does not belong to user.' });
        }

        // Обновляем текущую сумму
        const newAmount = goal.currentAmount + parseFloat(amount);
        await goal.update({ currentAmount: newAmount });

        res.json(goal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/goals/:id
// @desc    Удаление цели накопления
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found or does not belong to user.' });
    }

    await goal.destroy();
    res.json({ msg: 'Goal removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
