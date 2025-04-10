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


// Middleware to update price and stock dynamically
variantSchema.pre('save', function (next) {
  if (this.subVariants.length > 0) {
    // Sum up the stock from subvariants
    this.stock = this.subVariants.reduce((total, sv) => total + sv.stock, 0);

    // Set price to null if subvariants exist
    this.price = null;
  }
  next();
});

// Middleware to handle updates
variantSchema.pre('findOneAndUpdate', async function (next) {
  const variant = await this.model.findOne(this.getQuery());

  if (variant && variant.subVariants.length > 0) {
    // Sum up the stock from subvariants
    const totalStock = variant.subVariants.reduce((total, sv) => total + sv.stock, 0);

    // Set price to null if subvariants exist
    this.set({ stock: totalStock, price: null });
  }

  next();
});
export default variantSchema;
