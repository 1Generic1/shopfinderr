import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // Ensure category names are unique
  },
  image: {
    type: String, // Path to the category image
    required: true
  },
});

export default mongoose.model('Category', CategorySchema);

