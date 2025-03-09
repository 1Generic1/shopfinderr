import express from 'express';
import { addProductToWishlist, getAllWishlists, moveProductBetweenWishlists, createWishlist, shareWishlist } from '../controllers/wishlistController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Add product to General Wishlist
router.post('/add', authMiddleware, addProductToWishlist);

// Get all wishlists for the logged-in user
router.get('/', authMiddleware, getAllWishlists);

// Move product between wishlists
router.post('/move', authMiddleware, moveProductBetweenWishlists);

// Create a new wishlist
router.post('/create', authMiddleware, createWishlist);

// Share a wishlist with another user
router.post('/share', authMiddleware, shareWishlist);

export default router;

