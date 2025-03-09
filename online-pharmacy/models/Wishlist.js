import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: 'General Wishlist' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      addedAt: { type: Date, default: Date.now },
      note: String,
    },
  ],
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;

