import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import variantSchema from './Variant.js'; // Use ES Module syntax

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Paracetamol"
  
  description: { type: String }, // Optional description of the medicine
  
  category: { type: String, required: true }, // e.g., "Pain Relief", "Antibiotics"

  price: { 
    type: Number, 
    required: true,
  }, 

  stock: { 
    type: Number, 
    required: true,
    default: 0, 
  }, 

  variants: [variantSchema], // Array of variants (optional)

  images: [String], // Array of image URLs for the product

/**  rating: {
    average: { type: Number, default: 0 }, // Average rating
    totalRatings: { type: Number, default: 0 }, // Total number of ratings
  }, */

  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0, // Default rating will be 0
  },

  createdAt: { type: Date, default: Date.now },
});

productSchema.pre('save', function (next) {
  if (this.variants.length > 0) {
    // Find the lowest price from variants and subVariants
    let allPrices = this.variants.flatMap(v => {
      if (v.subVariants && v.subVariants.length > 0) {
        // If the variant has subvariants, ignore its price and use subvariant prices
        return v.subVariants.map(sv => sv.price);
      } else {
        // If the variant has no subvariants, use its price
        return [v.price];
      }
    });

    // Calculate the minimum price (ignore null or undefined values)
    this.price = allPrices.length > 0 ? Math.min(...allPrices.filter(p => p != null)) : this.price;

    // Sum up the stock from variants and subVariants
    this.stock = this.variants.reduce((total, v) => {
      if (v.subVariants && v.subVariants.length > 0) {
        // If the variant has subvariants, sum the subvariant stocks
        return total + v.subVariants.reduce((subTotal, sv) => subTotal + sv.stock, 0);
      } else {
        // If the variant has no subvariants, use its stock
        return total + v.stock;
      }
    }, 0);
  }
  next();
});


productSchema.pre('findOneAndUpdate', async function (next) {
  let product = await this.model.findOne(this.getQuery());

  if (product && product.variants.length > 0) {
    // Find the lowest price from variants and subVariants
    let allPrices = product.variants.flatMap(v => {
      if (v.subVariants && v.subVariants.length > 0) {
        // If the variant has subvariants, ignore its price and use subvariant prices
        return v.subVariants.map(sv => sv.price);
      } else {
        // If the variant has no subvariants, use its price
        return [v.price];
      }
    });

    // Calculate the minimum price (ignore null or undefined values)
    this.set({ price: allPrices.length > 0 ? Math.min(...allPrices.filter(p => p != null)) : product.price });

    // Sum up the stock from variants and subVariants
    let totalStock = product.variants.reduce((total, v) => {
      if (v.subVariants && v.subVariants.length > 0) {
        // If the variant has subvariants, sum the subvariant stocks
        return total + v.subVariants.reduce((subTotal, sv) => subTotal + sv.stock, 0);
      } else {
        // If the variant has no subvariants, use its stock
        return total + v.stock;
      }
    }, 0);

    this.set({ stock: totalStock });
  }

  next();
});

// Add the pagination plugin to the schema
productSchema.plugin(mongoosePaginate);

// Export the Product model
export default mongoose.model('Product', productSchema);

