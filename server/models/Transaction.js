// // models/Transaction.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../db');
// const User = require('./User');

// const Transaction = sequelize.define('Transaction', {
//   amount: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },
//   type: {
//     type: DataTypes.ENUM('income', 'expense'),
//     allowNull: false,
//   },
//   category: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   description: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
// });

// // Устанавливаем связь "один ко многим"
// // Один пользователь может иметь много операций
// User.hasMany(Transaction, {
//   foreignKey: 'userId', // В таблице Transaction будет поле userId
// });
// Transaction.belongsTo(User, {
//   foreignKey: 'userId',
// });

// module.exports = Transaction;

// models/Transaction.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Category = require('./Category'); // Импортируем новую модель

const Transaction = sequelize.define('Transaction', {
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
  },
  // ! Удаляем старое поле 'category'
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Устанавливаем связи:
// 1. Связь с Пользователем
User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

// 2. Связь с Категорией (Каждая транзакция принадлежит одной категории)
Category.hasMany(Transaction, { foreignKey: 'categoryId' }); // В транзакции будет поле categoryId
Transaction.belongsTo(Category, { foreignKey: 'categoryId' }); 

module.exports = Transaction;

