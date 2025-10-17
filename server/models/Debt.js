// models/Debt.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Debt = sequelize.define('Debt', {
  name: {
    type: DataTypes.STRING, // Кому или у кого взяли
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT, // Общая сумма долга
    allowNull: false,
  },
  type: {
    // loan: Вы дали в долг (актив)
    // owed: Вы взяли в долг (обязательство)
    type: DataTypes.ENUM('loan', 'owed'), 
    allowNull: false,
  },
  paidAmount: {
    type: DataTypes.FLOAT, // Уже выплаченная сумма
    allowNull: false,
    defaultValue: 0.00,
  },
  dueDate: {
    type: DataTypes.DATE, // Срок возврата
    allowNull: true,
  },
  isSettled: {
    type: DataTypes.BOOLEAN, // Закрыт ли долг
    defaultValue: false,
  }
});

// Связь: Каждый долг принадлежит одному пользователю
Debt.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Debt, { foreignKey: 'userId' });

module.exports = Debt;

// // models/Debt.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../db');
// const User = require('./User'); // Предполагая, что у вас есть модель User

// const Debt = sequelize.define('Debt', {
//     personName: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     amount: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//     },
//     // 'lending' (я дал в долг) или 'borrowing' (я взял в долг)
//     type: {
//         type: DataTypes.ENUM('lending', 'borrowing'),
//         allowNull: false,
//     },
//     date: {
//         type: DataTypes.DATEONLY, // Только дата (YYYY-MM-DD)
//         allowNull: false,
//     },
//     description: {
//         type: DataTypes.STRING,
//     },
//     status: {
//         type: DataTypes.ENUM('active', 'resolved'),
//         defaultValue: 'active',
//         allowNull: false,
//     },
//     resolvedAt: {
//         type: DataTypes.DATE, // Дата и время погашения
//         allowNull: true,
//     }
// });

// // Связь
// Debt.belongsTo(User, { foreignKey: 'userId' });
// User.hasMany(Debt, { foreignKey: 'userId' });

// module.exports = Debt;

