const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  image: { type: String, required: false },
  isDone: { type: Boolean, default: false },
  isCooking: { type: Boolean, default: false },
  point: { type: Number, required: true },
  isChecked: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

});

module.exports = mongoose.model('Recipe', recipeSchema);
