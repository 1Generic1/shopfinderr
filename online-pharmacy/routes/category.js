import express from 'express';
import { createCategory, getCategories } from '../controllers/categoryController.js';
import uploadCategoryImage from '../middleware/uploadCategoryImage.js';

const router = express.Router();

// Route for creating a new category with image upload
router.post('/upload', uploadCategoryImage, createCategory);

// Route for fetching all categories
router.get('/all_categories', getCategories);

export default router;

