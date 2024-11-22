// routes/auth.js
const { Router } = require('express');
const sharp = require('sharp');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const router = Router();


// Маршрут для створення рецепту з перевіркою формату
router.post('/create', async (req, res) => {
  try {
    const { title, description, point, id, image, isChecked, isDone, isCooking, user } = req.body;

    // Перевіряємо, чи існує користувач
    const userID = await User.findById(user);

    if (!userID) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Перевірка обов'язкових полів
    if (!title) {
      return res.status(400).json({ message: 'Назва рецепту є обов`язковою', type: 'title' });
    }

    let finalImage = null;

    // Обробка зображення, якщо воно вказане
    if (image) {
      if (image.startsWith('data:image/')) {
        const base64Data = image.split(';base64,').pop(); // Відокремлюємо base64
        const buffer = Buffer.from(base64Data, 'base64'); // Створюємо буфер

        // Конвертуємо зображення в підтримуваний формат
        const compressedImageBuffer = await sharp(buffer)
          .toFormat('jpeg') // Конвертуємо в JPEG
          .resize(400) // Зменшуємо розмір до 400px
          .jpeg({ quality: 80 }) // Стискаємо з якістю 80%
          .toBuffer();

        // Перетворюємо буфер назад у base64
        const compressedImageBase64 = compressedImageBuffer.toString('base64');
        finalImage = `data:image/jpeg;base64,${compressedImageBase64}`;
      } else {
        // Якщо зображення не є base64, повертаємо помилку
        finalImage = image
        // return res.status(400).json({ message: 'Unsupported image format' });
      }
    }

    // Створення нового рецепту
    const newRecipe = new Recipe({
      title,
      id,
      description,
      image: finalImage, // Може бути null, якщо зображення відсутнє
      point: point || Math.floor(Math.random() * (50 - 10 + 1)) + 10,
      isDone: isDone || false,
      isCooking: isCooking || false,
      isChecked: isChecked || false,
      user: userID

    });

    await newRecipe.save();

    res.status(201).json({ message: 'Recipe created successfully', recipe: newRecipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong while creating the recipe' });
  }
});


// Маршрут для оновлення рецепту по ID
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Оновлюємо рецепт лише з переданими полями
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, { $set: req.body }, { new: true });

    if (!updatedRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json({ message: 'Recipe updated successfully', recipe: updatedRecipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong while updating the recipe' });
  }
});


// Маршрут для отримання всіх рецептів
router.get('/get-all', async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ _id: -1 }); // Отримуємо всі рецепти з бази даних

    if (!recipes || recipes.length === 0) {
      return res.json([]);
    }

    res.status(200).json({ recipes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong while fetching recipes' });
  }
});


module.exports = router;
