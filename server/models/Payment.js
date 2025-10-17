// models/Payment.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Debt = require('./Debt'); // Ваша модель Debt

const Payment = sequelize.define('Payment', {
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    // Дата фактического платежа
    paymentDate: { 
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW, // По умолчанию - текущая дата
    },
    // Связь с долгом/займом
    debtId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Debt,
            key: 'id',
        }
    },
    // Если нужно: ID пользователя, который внес/получил платеж
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Убедитесь, что имя таблицы правильное
            key: 'id',
        }
    }
});

// Устанавливаем связь
Debt.hasMany(Payment, { foreignKey: 'debtId', as: 'payments' });
Payment.belongsTo(Debt, { foreignKey: 'debtId' });

module.exports = Payment;
