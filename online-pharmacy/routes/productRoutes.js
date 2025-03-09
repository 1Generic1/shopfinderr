import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { createProduct, getAllProducts, getProductById, addProductImages, deleteProductImage } from '../controllers/productController.js';
import uploadProductImage from '../middleware/uploadProductImage.js';
import uploadProductImages from '../middleware/uploadProductImages.js';
 
const router = express.Router();

router.post('/create', authMiddleware, uploadProductImage, createProduct);

router.get('/all_products', authMiddleware, getAllProducts);

router.get('/:id', authMiddleware, getProductById);

// Route for adding multiple product images
router.post('/:productId/add-images', uploadProductImages, addProductImages);

// Route for deleting a product image
router.delete('/:productId/delete-image/:imageIndex', deleteProductImage);


export default router;
