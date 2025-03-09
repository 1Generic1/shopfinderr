import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// Add product to General Wishlist
export const addProductToWishlist = async (req, res) => {
  const { productId } = req.body;

  console.log('Request Body:', req.body);

  try {
    const userId = req.user.id;
     console.log('User ID:', userId);

    // Find or create General Wishlist
    let generalWishlist = await Wishlist.findOne({ userId, name: 'General Wishlist' });
    console.log('General Wishlist (Before Creation):', generalWishlist);
    if (!generalWishlist) {
      generalWishlist = new Wishlist({ userId, name: 'General Wishlist' });
    }

    // Check if product is already in the wishlist
    const itemExists = generalWishlist.items.some(item => item.productId.toString() === productId);
    if (itemExists) {
      return res.status(400).json({ msg: 'Product already in General Wishlist.' });
    }

    // Add product to wishlist
    generalWishlist.items.push({ productId });
    await generalWishlist.save();

    res.status(200).json({ msg: 'Product added to General Wishlist.', wishlist: generalWishlist });
  } catch (err) {
    res.status(500).json({ msg: 'Error adding to wishlist.', error: err.message });
  }
};

// Fetch all wishlists for the logged-in user
export const getAllWishlists = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlists = await Wishlist.find({ userId }).populate('items.productId', 'name price');
    res.status(200).json({ wishlists });
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching wishlists.', error: err.message });
  }
};

// Move product between wishlists
export const moveProductBetweenWishlists = async (req, res) => {
  const { productId, fromWishlist, toWishlist } = req.body;

  try {
    const userId = req.user.id;

    // Find source and target wishlists
    const source = await Wishlist.findOne({ userId, name: fromWishlist });
    const target = await Wishlist.findOne({ userId, name: toWishlist });

    if (!source || !target) {
      return res.status(404).json({ msg: 'One or both wishlists not found.' });
    }

    // Remove product from source wishlist
    const itemIndex = source.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.status(400).json({ msg: 'Product not found in source wishlist.' });
    }
    const [item] = source.items.splice(itemIndex, 1);
    await source.save();

    // Add product to target wishlist
    target.items.push(item);
    await target.save();

    res.status(200).json({ msg: 'Product moved successfully.', target });
  } catch (err) {
    res.status(500).json({ msg: 'Error moving product.', error: err.message });
  }
};

// Create a new wishlist
export const createWishlist = async (req, res) => {
  const { name } = req.body;

  try {
    const userId = req.user.id;

    // Check if wishlist name already exists
    const existingWishlist = await Wishlist.findOne({ userId, name });
    if (existingWishlist) {
      return res.status(400).json({ msg: 'Wishlist with this name already exists.' });
    }

    const newWishlist = new Wishlist({ userId, name });
    await newWishlist.save();

    res.status(201).json({ msg: 'Wishlist created successfully.', wishlist: newWishlist });
  } catch (err) {
    res.status(500).json({ msg: 'Error creating wishlist.', error: err.message });
  }
};

// Share a wishlist with another user
export const shareWishlist = async (req, res) => {
  const { wishlistId, shareWithUserId } = req.body;

  try {
    const wishlist = await Wishlist.findById(wishlistId);

    if (!wishlist) {
      return res.status(404).json({ msg: 'Wishlist not found.' });
    }

    // Add user to sharedWith array
    if (!wishlist.sharedWith.includes(shareWithUserId)) {
      wishlist.sharedWith.push(shareWithUserId);
      await wishlist.save();
    }

    res.status(200).json({ msg: 'Wishlist shared successfully.', wishlist });
  } catch (err) {
    res.status(500).json({ msg: 'Error sharing wishlist.', error: err.message });
  }
};

