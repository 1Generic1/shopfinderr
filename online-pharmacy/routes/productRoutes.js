import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { createProduct, getAllProducts, getProductById, updateProduct, addProductImages, deleteProductImage, deleteProduct } from '../controllers/productController.js';
import uploadProductImage from '../middleware/uploadProductImage.js';
import uploadProductImages from '../middleware/uploadProductImages.js';
 
const router = express.Router();

router.post('/create', authMiddleware, uploadProductImage, createProduct);

router.get('/all_products', getAllProducts);

router.get('/:id', authMiddleware, getProductById);

// PUT /products/:id - Update a product
router.put('/:id', uploadProductImage, authMiddleware, updateProduct);

// Route for adding multiple product images
router.post('/:productId/add-images', uploadProductImages, authMiddleware, addProductImages);

// Route for deleting a product image
router.delete('/:productId/delete-image/:imageIndex', authMiddleware, deleteProductImage);

// Route for deleting a product
router.delete('/:id', authMiddleware, deleteProduct);

export default router;
