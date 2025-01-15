import Cart from '../models/Cart.js';
import mongoose from 'mongoose';

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body; // Only productId and quantity come from the body

    // Log the received productId
    console.log("Received ProductId:", productId);

    // Check if the productId and quantity are provided
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'ProductId and quantity are required.' });
    }

    // Check if productId is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid productId format.' });
    }

    // Convert productId to ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId); // Directly convert to ObjectId

    // Find the cart for the user
    const userId = req.user.id;
    console.log('User ID from decoded token:', userId)
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found. Please log in.' });
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // If no cart exists, create a new one
      cart = new Cart({ userId, items: [] });
    }

    // Check if product already exists in the cart
    const existingItem = cart.items.find((item) => item.productId.toString() === productObjectId.toString());
    if (existingItem) {
      // Update quantity if product already exists
      existingItem.quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ productId: productObjectId, quantity });
    }

    // Save the cart
    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: 'Error adding item to cart', error });
  }
};


// Get cart for a user
export const getCart = async (req, res) => {
  try {
    // Retrieve the userId from the authenticated user
    const userId = req.user.id; // Assumes req.user is set by auth middleware

    // Populate the 'items.productId' field with the 'name' of the product
    const cart = await Cart.findOne({ userId }).populate('items.productId').exec();
    console.log(cart);

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error populating cart:', error);
    res.status(500).json({ message: 'Error retrieving cart', error });
  }
};


// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    // Retrieve the userId from the authenticated user
    const userId = req.user.id;

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Find the cart and remove the item
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error });
  }
};


// Update item quantity
export const updateQuantity = async (req, res) => {
  try {
    // Retrieve the userId from the authenticated user
    const userId = req.user.id;

    const { productId, quantity } = req.body;

    if (!productId || quantity == null) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    // Find the cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the item and update its quantity
    const item = cart.items.find((item) => item.productId.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = quantity;

    // Save the updated cart
    await cart.save();
    res.status(200).json({ message: 'Quantity updated', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error updating quantity', error });
  }
};


// remove multiple item in a cart
export const removeSelectedItems = async (req, res) => {
  try {
    // Retrieve the userId from the authenticated user (assumes req.user is set by auth middleware)
    const userId = req.user.id; // Ensure your middleware sets `req.user`

    const { items } = req.body; // `items` is an array of productIds

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required and must be an array.' });
    }

    // Find the cart and remove selected items
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId: { $in: items } } } },
      { new: true } // Return the updated cart
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    res.status(200).json({ message: 'Selected items removed from cart.', cart });
  } catch (error) {
    console.error('Error removing selected items from cart:', error);
    res.status(500).json({ message: 'Error removing selected items from cart.', error });
  }
};


export const removeMultipleItems = async (req, res) => {
  const { itemIds } = req.body; // Expecting an array of item IDs

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ error: 'itemIds must be a non-empty array.' });
  }

  try {

    console.log('Request body:', req.body);
    // Pull the items from the cart that match the productIds in itemIds
    const result = await Cart.updateMany(
      { "items.productId": { $in: itemIds } }, // Match items inside the cart
      { $pull: { items: { productId: { $in: itemIds } } } } // Remove items with matching productIds
    );

    console.log('Result of updateMany:', result);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'No items found to remove.' });
    }

    res.status(200).json({ message: 'Items removed successfully.', deletedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error removing items:', error);
    res.status(500).json({ error: 'Failed to remove items.' });
  }
};
