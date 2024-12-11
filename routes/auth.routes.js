// routes/auth.js
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const router = Router();
const authMiddleware = require('../middleware/auth')

// Маршрут для реєстрації
router.post(
  '/register',
  [
    check('email', 'Некорректний email').isEmail(),
    check('nickname', 'Некоректний никнейм').isLength({ min: 3 }),
    check('password', 'Мінімальна довжина пароля - 6 символов').isLength({ min: 6 })
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

      const { email, nickname, password, role } = req.body;

      // Перевірка, чи існує користувач
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'Користувач з таким email вже існує', path: 'email' }] });
      }

      // Хешування пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      // Створення нового користувача
      const user = new User({ email, nickname, password: hashedPassword, role });

      // Збереження користувача в базі даних
      await user.save();

      // Створення токена
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({ token, nickname, userId: user._id, message: 'Пользователь создан' });
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
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации'
        });
      }


      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Користувача не знайдено', path: 'email' }] });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ errors: [{ msg: 'Невірний пароль', path: 'password' }] });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'default_secret_key',
        { expiresIn: '7d' }
      );

      res.json({ token, nickname: user.nickname, email: user.email, userId: user._id, point: user.point });
    } catch (e) {
      console.error('Помилка логіну:', e.message);
      res.status(500).json({ message: 'Внутрішня помилка сервера' });
    }
  }
);

// Маршрут для отримання інформації про користувача
router.get('/get-user', authMiddleware, async (req, res) => {
  try {
    // Отримуємо ID користувача з токена
    const userId = req.user._id;

    // Знаходимо користувача в базі даних
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Повертаємо інформацію про користувача (без пароля)
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user information' });
  }
});

module.exports = router;


// Маршрут для оновлення поля "point"
router.patch('/update-point/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { point } = req.body;

    // Перевірка, чи ID є валідним ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Перевірка, чи користувач існує
    const userExists = await User.findById(userId);

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Перевірка типу поля "point"
    if (typeof point !== 'number' || isNaN(point)) {
      return res.status(400).json({ message: 'Point must be a valid number' });
    }

    // Оновлення поля point
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { point } }, // Додаємо значення до існуючого
      { new: true } // Повертаємо оновлений документ
    );

    res.status(200).json({
      message: 'User point updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong while updating the user point' });
  }
});


module.exports = router;
