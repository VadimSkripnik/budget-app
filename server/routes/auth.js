// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken'); // Импортируем JWT
// const User = require('../models/User');

// const router = express.Router();
// // const JWT_SECRET = process.env.JWT_SECRET; // Замените на реальный секретный ключ!
// const JWT_SECRET = "this_is_a_very_long_and_random_string_of_characters"
// // ... (код для регистрации)

// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // 1. Ищем пользователя по email
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // 2. Сравниваем введенный пароль с хешем в базе данных
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // 3. Если пароли совпадают, создаём JWT
//     const payload = {
//       user: {
//         id: user.id,
//       },
//     };

//     jwt.sign(
//       payload,
//       JWT_SECRET,
//       { expiresIn: '1h' }, // Токен будет действовать 1 час
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token });
//       }
//     );
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send('Server error');
//   }
// });

// module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
 // Замените на реальный секретный ключ!
  const JWT_SECRET = process.env.JWT_SECRET;

// @route   POST /api/auth/register
// @desc    Регистрация пользователя
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Проверяем, существует ли пользователь с таким email
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // 2. Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Создаём нового пользователя
    user = await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Авторизация пользователя и получение токена
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Ищем пользователя по email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Сравниваем введенный пароль с хешем в базе данных
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Если пароли совпадают, создаём JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' }, // Токен будет действовать 1 час
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

