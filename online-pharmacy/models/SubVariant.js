import mongoose from 'mongoose';

const subVariantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "For Adults", "For Children"
  price: { type: Number, required: true }, // Price specific to this sub-variant
  stock: { type: Number, default: 0 }, // Stock specific to this sub-variant
  images: [String],
});

export default subVariantSchema; // Export the schema as default
