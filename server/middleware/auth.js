const jwt = require('jsonwebtoken');

// Секретный ключ, должен быть таким же, как в auth.js
const JWT_SECRET = process.env.JWT_SECRET; 

module.exports = function(req, res, next) {
  // Получаем токен из заголовка
  const token = req.header('x-auth-token');

  // Если токена нет, возвращаем ошибку
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Проверяем токен
  try {
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded)
    // Добавляем user из токена в объект запроса (req)
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
