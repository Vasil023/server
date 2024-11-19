// routes/auth.js
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const router = Router();

// Маршрут для реєстрації
router.post(
  '/register',
  [
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Минимальная длина пароля - 6 символов').isLength({ min: 6 })
  ],
  async (req, res) => {
    try {

      // Перевірка помилок
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации'
        });
      }

      const { email, password, role } = req.body;

      // Перевірка, чи існує користувач
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: 'Такий користувач уже існує', type: 'email' });
      }

      // Хешування пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      // Створення нового користувача
      const user = new User({ email, password: hashedPassword, role });

      // Збереження користувача в базі даних
      await user.save();

      // Створення токена
      const token = jwt.sign(
        { userId: user._id },
        dotenv.parsed.SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.status(201).json({ token, userId: user._id, message: 'Пользователь создан' });
    } catch (e) {
      res.status(500).json({ message: 'Ошибка сервера. Попробуйте снова' });
    }
  }
);

// Авторизація користувача
router.post(
  '/login',
  [
    check('email', 'Введіть правильний email').normalizeEmail().isEmail(),
    check('password', 'Пароль повинен бути не менше 6 символів').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json({ errors: errors.array(), status: 400 });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: 'Користувача не знайдено', type: 'email' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Невірний пароль', type: 'password' });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.SECRET_KEY || 'default_secret_key',
        { expiresIn: '1h' }
      );

      res.json({ token, email: user.email, userId: user.id });
    } catch (e) {
      console.error('Помилка логіну:', e.message);
      res.status(500).json({ message: 'Внутрішня помилка сервера' });
    }
  }
);


module.exports = router;
