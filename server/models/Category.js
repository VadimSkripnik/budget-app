// models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User'); // Для связи с пользователем

const Category = sequelize.define('Category', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
  },
});

// Устанавливаем связь: Каждая категория принадлежит одному пользователю
User.hasMany(Category, {
  foreignKey: 'userId',
  onDelete: 'CASCADE', // Если пользователь удаляется, удаляются и его категории
});
Category.belongsTo(User, {
  foreignKey: 'userId',
});

module.exports = Category;
