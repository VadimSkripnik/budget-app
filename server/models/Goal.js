// models/Goal.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Goal = sequelize.define('Goal', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetAmount: {
    type: DataTypes.FLOAT, // Целевая сумма
    allowNull: false,
  },
  currentAmount: {
    type: DataTypes.FLOAT, // Уже накоплено
    allowNull: false,
    defaultValue: 0.00,
  },
  dueDate: {
    type: DataTypes.DATE, // Срок достижения цели
    allowNull: true,
  },
});

// Связь: Каждая цель принадлежит одному пользователю
Goal.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Goal, { foreignKey: 'userId' });

module.exports = Goal;
