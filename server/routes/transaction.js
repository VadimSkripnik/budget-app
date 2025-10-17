const express = require('express');
const { fn, col, literal, Op } = require('sequelize'); // Импортируем Op для условий WHERE
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

const router = express.Router();

// Функция-помощник для создания условия фильтрации по дате
const createDateWhereClause = (req) => {
  const { startDate, endDate } = req.query;
  let whereClause = { userId: req.user.id };

  if (startDate || endDate) {
    whereClause.createdAt = {};

    if (startDate) {
      // createdAt >= startDate
      whereClause.createdAt[Op.gte] = new Date(startDate); 
    }
    if (endDate) {
      // createdAt <= endDate
      whereClause.createdAt[Op.lte] = new Date(endDate);
    }
  }
  return whereClause;
};

// --- 1. CRUD ТРАНЗАКЦИЙ ---

// @route   POST /api/transactions
// @desc    Добавление новой транзакции
// @access  Private
router.post('/', auth, async (req, res) => {
  const { amount, type, categoryId, description } = req.body;
  
  try {
    // 1. Проверка существования и принадлежности категории
    const category = await Category.findOne({
      where: {
        id: categoryId,
        userId: req.user.id,
      },
    });

    if (!category) {
      return res.status(404).json({ msg: 'Category not found or does not belong to user.' });
    }

    // 2. Создание транзакции
    const newTransaction = await Transaction.create({
      amount,
      type,
      description,
      categoryId: category.id,
      userId: req.user.id, 
    });

    res.status(201).json(newTransaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/transactions
// @desc    Получение всех транзакций текущего пользователя (с фильтром по дате)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const whereClause = createDateWhereClause(req); // Получаем условия фильтрации

    const transactions = await Transaction.findAll({
      where: whereClause, // Применяем условия
      include: [{ model: Category, attributes: ['name', 'type'] }], 
      order: [['createdAt', 'DESC']],
    });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Удаление транзакции по ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    await transaction.destroy();
    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- 2. СВОДКА И СТАТИСТИКА ---

// @route   GET /api/transactions/summary
// @desc    Получение общего баланса, дохода и расхода за период
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const whereClause = createDateWhereClause(req); // Получаем условия фильтрации

    const summary = await Transaction.findAll({
      attributes: [
        [fn('SUM', literal("CASE WHEN type = 'income' THEN amount ELSE 0 END")), 'totalIncome'],
        [fn('SUM', literal("CASE WHEN type = 'expense' THEN amount ELSE 0 END")), 'totalExpense'],
      ],
      where: whereClause, // Применяем условия
      raw: true,
    });

    const totalIncome = parseFloat(summary[0].totalIncome || 0);
    const totalExpense = parseFloat(summary[0].totalExpense || 0);
    const balance = totalIncome - totalExpense;

    res.json({
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      balance: balance.toFixed(2),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/transactions/summary/categories
// @desc    Получение сводки расходов/доходов, сгруппированных по категориям за период
// @access  Private
router.get('/summary/categories', auth, async (req, res) => {
  try {
    const whereClause = createDateWhereClause(req); // Получаем условия фильтрации

    const summaryByCategory = await Transaction.findAll({
      attributes: [
        [fn('SUM', col('amount')), 'totalAmount'],
        'categoryId'
      ],
      include: [{
        model: Category,
        attributes: ['name', 'type'],
      }],
      where: whereClause, // Применяем условия
      group: ['Transaction.categoryId', 'Category.id'],
      order: [[col('Category.type'), 'ASC'], [col('totalAmount'), 'DESC']],
    });

    const formattedSummary = summaryByCategory.map(item => ({
      categoryId: item.categoryId,
      categoryName: item.Category.name,
      categoryType: item.Category.type,
      totalAmount: parseFloat(item.dataValues.totalAmount).toFixed(2),
    }));

    res.json(formattedSummary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route   PUT /api/transactions/:id
// @desc    Обновление существующей транзакции
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { amount, type, categoryId, description } = req.body;
  
  try {
    // 1. Проверяем, существует ли транзакция и принадлежит ли она пользователю
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found or does not belong to user.' });
    }

    // 2. Если передан categoryId, проверяем, что он валиден и принадлежит пользователю
    if (categoryId) {
        const category = await Category.findOne({
            where: { id: categoryId, userId: req.user.id }
        });
        if (!category) {
            return res.status(400).json({ msg: 'Invalid category ID or category does not belong to user.' });
        }
    }
    
    // 3. Обновляем транзакцию, используя все переданные поля
    const updatedTransaction = await transaction.update({
        amount: amount !== undefined ? amount : transaction.amount,
        type: type !== undefined ? type : transaction.type,
        categoryId: categoryId !== undefined ? categoryId : transaction.categoryId,
        description: description !== undefined ? description : transaction.description,
    });

    res.json(updatedTransaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;
