// index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Category = require('./models/Category');
const Budget = require('./models/Budget');
const Goal = require('./models/Goal');
const Debt = require('./models/Debt');
const Payment = require('./models/Payment');
const SavingGoal = require('./models/SavingGoal');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const transactionRoutes = require('./routes/transaction'); // Импортируем новый маршрут
const categoryRoutes = require('./routes/category');
const budgetRoutes = require('./routes/budget');
const goalRoutes = require('./routes/goal');
const debtRoutes = require('./routes/debt');
const savingRoutes = require('./routes/saving');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transactions', transactionRoutes); // Подключаем маршрут для транзакций
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/savings', savingRoutes);


sequelize.sync().then(() => {
  console.log('Database synced');
}).catch((error) => {
  console.error('Error syncing database:', error);
});

app.get('/', (req, res) => {
  res.send('Welcome to the budget app backend!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


