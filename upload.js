const multer = require('multer');
const path = require('path');

// Налаштування Multer для збереження файлів в папці uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Вказуємо папку для збереження файлів
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ім'я файлу буде унікальним
  },
});

// Створюємо інстанс Multer з нашими налаштуваннями
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Обмеження на розмір файлу (5 MB)
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/; // Дозволені формати
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

module.exports = upload;
