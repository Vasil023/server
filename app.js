const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv').config();
const path = require('path'); // Додано для роботи з шляхами
const { createProxyMiddleware } = require('http-proxy-middleware');
const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');
const { log } = require('console');

const url = process.env.MONGODB_URI || 'mongodb+srv://myblogactivation:cyKjAufKOSA9lLGW@cooking.bgsxm.mongodb.net/coockin?retryWrites=true&w=majority&appName=cooking';
const PORT = process.env.PORT || 3000; // Використовуємо process.env.PORT для Heroku

const app = express();




// Налаштування CORS
app.use(cors());

// Middleware для обробки JSON у вхідних запитах
app.use(express.json({ limit: '50mb' })); // Обмеження, якщо потрібно

// Підключення до MongoDB
mongoose.connect(url)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Вихід з програми, якщо не вдалося підключитись до бази
  });

// Використання маршрутів з різними префіксами
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);



console.log(__dirname);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
