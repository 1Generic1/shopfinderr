import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },

  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0, // Default rating will be 0
  },
  
  image: {
    type: String, // To store the image URL or file path
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

ProductSchema.plugin(mongoosePaginate);

export default mongoose.model('Product', ProductSchema);
