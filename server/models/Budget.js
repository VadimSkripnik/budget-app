// models/Budget.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Category = require('./Category');

const Budget = sequelize.define('Budget', {
  limit: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  month: {
    type: DataTypes.INTEGER, // Месяц (1-12)
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER, // Год (2025, 2026 и т.д.)
    allowNull: false,
  },
}, {
    // Уникальный индекс: не может быть двух лимитов на одну категорию в один и тот же месяц/год
    indexes: [{
        unique: true,
        fields: ['userId', 'categoryId', 'month', 'year']
    }]
});

// Связи
Budget.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Budget, { foreignKey: 'userId' });

Budget.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Budget, { foreignKey: 'categoryId' });

module.exports = Budget;
