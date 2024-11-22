const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

// Імпортуємо маршрути та обробник Socket.io
const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');
const socketHandler = require('./socket/socket');

// Параметри підключення до MongoDB
const url = process.env.MONGODB_URI || 'mongodb+srv://myblogactivation:cyKjAufKOSA9lLGW@cooking.bgsxm.mongodb.net/coockin?retryWrites=true&w=majority&appName=cooking';
const PORT = process.env.PORT || 3000; // Порт сервера

// Ініціалізація Express і HTTP сервера
const app = express();
const server = http.createServer(app);


// Налаштування WebSocket (Socket.io)
const io = new Server(server, {
  cors: {
    origin: 'https://nyama.netlify.app/', // Домен вашого клієнта
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Використовуємо обробник для WebSocket
socketHandler(io);

// Налаштування CORS
app.use(cors());

// Middleware для обробки JSON
app.use(express.json({ limit: '50mb' }));

// Підключення до MongoDB
mongoose.connect(url)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Завершення роботи у разі помилки підключення
  });

// Використання маршрутів
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Запуск HTTP сервера
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
