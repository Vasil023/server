const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  id: { type: Number, required: false },
  description: { type: String, required: false },
  image: { type: String, required: false },
  isDone: { type: Boolean, default: false },
  isCooking: { type: Boolean, default: false },
  point: { type: Number, required: true },
  isChecked: { type: Boolean, default: false },
  userCooked: { type: Object, required: false, default: null },
  userWaiting: { type: String, required: false, default: null },
  user: { type: Object, required: false }

});

module.exports = mongoose.model('Recipe', recipeSchema);
