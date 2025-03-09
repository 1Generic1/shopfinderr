import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { createSubVariant, addSubVariantImages, deleteSubVariantImage } from '../controllers/subVariantController.js';
import uploadSubVariantImage from '../middleware/uploadSubVariantImage.js';
import uploadSubVariantImages from '../middleware/uploadSubVariantImages.js';
const router = express.Router();

// Route to create a sub-variant for a specific variant
router.post('/:variantId/create', authMiddleware, uploadSubVariantImage, createSubVariant);

// Route to update a sub-variant
//router.put('/:subVariantId/update', authMiddleware, updateSubVariant);

// Route to delete a sub-variant
//router.delete('/:subVariantId/delete', authMiddleware, deleteSubVariant);

// Route to add images
router.post('/:subVariantId/images', uploadSubVariantImages, addSubVariantImages);
router.delete('/:subVariantId/delete-image/:imageIndex', deleteSubVariantImage);
 
export default router;

