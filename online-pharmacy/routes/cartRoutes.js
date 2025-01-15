import express from 'express';
import {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity,
  removeSelectedItems,
  removeMultipleItems,
} from '../controllers/cartController.js';
import authMiddleware from '../middleware/auth.js'; // Your custom auth middleware

const router = express.Router();

// Add an item to the cart
router.post('/add', authMiddleware, addToCart);

// Get the cart for the authenticated user
router.get('/cart', authMiddleware, getCart);

// Remove a single item from the cart
router.post('/remove', authMiddleware, removeFromCart);

// Update the quantity of an item in the cart
router.patch('/update-quantity', authMiddleware, updateQuantity);

// Remove multiple selected items from the cart
router.post('/remove-selected', authMiddleware, removeSelectedItems);

// Remove multiple items
router.delete('/remove-multiple', authMiddleware, removeMultipleItems);

export default router;

