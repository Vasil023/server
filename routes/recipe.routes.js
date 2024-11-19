// routes/auth.js
const { Router } = require('express');
const sharp = require('sharp');
const Recipe = require('../models/Recipe');
const router = Router();


// Маршрут для створення рецепту з перевіркою формату
router.post('/create', async (req, res) => {
  try {
    const { title, description, point, image, isChecked, isDone, isCooking } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // if (!image) {
    //   return res.status(400).json({ message: 'Image is required' });
    // }

    // let buffer;
    // if (image.startsWith('data:image/')) {
    //   const base64Data = image.split(';base64,').pop(); // Відокремлюємо base64
    //   buffer = Buffer.from(base64Data, 'base64'); // Створюємо буфер
    // } else {
    //   return res.status(400).json({ message: 'Unsupported image format' });
    // }

    // // Конвертуємо зображення в підтримуваний формат
    // const compressedImageBuffer = await sharp(buffer)
    //   .toFormat('jpeg') // Конвертуємо в JPEG
    //   .resize(400) // Зменшуємо розмір до 800px
    //   .jpeg({ quality: 80 }) // Стискаємо з якістю 80%
    //   .toBuffer();


    // // Перетворюємо буфер назад у base64
    // const compressedImageBase64 = compressedImageBuffer.toString('base64');
    // const finalImage = `data:image/jpeg;base64,${compressedImageBase64}`;

    const newRecipe = new Recipe({
      title,
      description,
      image, // Додаємо оброблене зображення
      point,
      isDone,
      isCooking,
      isChecked
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
    const { title, description, image, isChecked, isDone, isCooking } = req.body;

    // Знаходимо рецепт за ID
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Оновлення поля рецепту
    recipe.title = title || recipe.title;
    recipe.description = description || recipe.description;
    recipe.image = image || recipe.image; // Якщо зображення не передане, не змінюємо
    recipe.isDone = isDone || recipe.isDone;
    recipe.isCooking = isCooking || recipe.isCooking;
    recipe.isChecked = isChecked;

    // Збереження оновленого рецепту
    await recipe.save();

    res.json({ message: 'Recipe updated successfully', recipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong while updating the recipe' });
  }
});

// Маршрут для отримання всіх рецептів
router.get('/get-all', async (req, res) => {
  try {
    const recipes = await Recipe.find(); // Отримуємо всі рецепти з бази даних

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
