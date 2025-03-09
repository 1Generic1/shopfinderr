import mongoose from 'mongoose';
import subVariantSchema from './SubVariant.js';

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Dosage"

  option: { type: String, required: true }, // e.g., "250mg", "500mg"

  price: { 
    type: Number, 
    required: function () { return this.subVariants.length === 0; } 
  }, // Price required if no sub-variants

  stock: { 
    type: Number, 
    default: 0, 
    required: function () { return this.subVariants.length === 0; } 
  }, // Stock required if no sub-variants

  images: [String], // Array of image URLs specific to this variant

  subVariants: [subVariantSchema], // Optional sub-variants
});

export default variantSchema;
