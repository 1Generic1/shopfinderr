import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { createVariant, updateVariant,  addVariantImages, deleteVariant, deleteVariantImage } from '../controllers/variantController.js';
import uploadVariantImage from '../middleware/uploadVariantImage.js';
import uploadVariantImages from '../middleware/uploadVariantImages.js';

const router = express.Router();

// Route to create a variant for a specific product
router.post('/:productId/create', authMiddleware, uploadVariantImage, createVariant);

// Route to update a variant
router.put('/:variantId/update', authMiddleware, uploadVariantImage, updateVariant);

// Route to delete a variant
router.delete('/:variantId/delete', authMiddleware, deleteVariant);

//route to add mutiple images
router.post('/:variantId/images', uploadVariantImages, addVariantImages);

//route to delete index image
router.delete('/:variantId/delete-image/:imageIndex', deleteVariantImage);

export default router;

