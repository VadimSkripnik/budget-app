// server/models/SavingGoal.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Ваш импорт sequelize

const SavingGoal = sequelize.define('SavingGoal', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // Название цели (например, "Ноутбук", "Отпуск")
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Целевая сумма
    targetAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    // Текущая накопленная сумма
    currentAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
    },
    // Дата, к которой нужно накопить (если есть)
    targetDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    // userId для привязки к пользователю
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Убедитесь, что имя таблицы пользователей правильное
            key: 'id',
        }
    },
    // Статус
    isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
});

module.exports = SavingGoal;
