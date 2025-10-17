const express = require('express');
const auth = require('../middleware/auth');
const Category = require('../models/Category');
const router = express.Router();

// @route   POST /api/categories
// @desc    Создание новой категории
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, type } = req.body;
  try {
    const newCategory = await Category.create({
      name,
      type,
      userId: req.user.id, // Привязываем к текущему пользователю
    });
    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/categories
// @desc    Получение всех категорий текущего пользователя
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.user.id },
      order: [['type', 'ASC'], ['name', 'ASC']],
    });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route   PUT /api/categories/:id
// @desc    Обновление существующей категории
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, type } = req.body;
  
  try {
    // 1. Проверяем, существует ли категория и принадлежит ли она пользователю
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!category) {
      return res.status(404).json({ msg: 'Category not found or does not belong to user.' });
    }
    
    // 2. Обновляем категорию
    const updatedCategory = await category.update({
        name: name !== undefined ? name : category.name,
        type: type !== undefined ? type : category.type,
    });

    res.json(updatedCategory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Добавьте также маршрут DELETE для категории, чтобы можно было удалять
// @route   DELETE /api/categories/:id
// @desc    Удаление категории
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const category = await Category.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id,
            },
        });
        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }
        await category.destroy();
        // ВНИМАНИЕ: Sequelize автоматически очистит поле categoryId в связанных транзакциях (nullify)
        res.json({ msg: 'Category removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;
