import express from 'express';
import auth from '../middleware/auth.js';
import { createCategory, getCategories, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import uploadCategoryImage from '../middleware/uploadCategoryImage.js';

const router = express.Router();

// Route for creating a new category with image upload
router.post('/upload', uploadCategoryImage, auth, createCategory);

// Route for fetching all categories
router.get('/all_categories', getCategories);

// Edit category with image upload
router.put('/:id', uploadCategoryImage, auth, updateCategory);

// Delete category
router.delete('/:id', auth, deleteCategory); 

export default router;

