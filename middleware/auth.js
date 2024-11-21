const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Розшифровуємо токен
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user; // Додаємо користувача в запит
    next();
  } catch (error) {
    console.error('Invalid token:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
