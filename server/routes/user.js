const express = require('express');
const auth = require('../middleware/auth'); // Импортируем наш middleware
const User = require('../models/User');

const router = express.Router();

// Маршрут для получения информации о текущем пользователе
// Доступен только с валидным токеном
router.get('/', auth, async (req, res) => {
  try {
    // req.user.id доступен благодаря middleware
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    // Не отправляем хеш пароля!
    res.json({ email: user.email, id: user.id }); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
