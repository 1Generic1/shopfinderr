import express from 'express';
import orderController from '../controllers/orderController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create a new order
router.post('/', auth, orderController.createOrder);

// Get all orders for the logged-in user
router.get('/', auth, orderController.getOrders);

// Get a specific order by ID
router.get('/:id', auth, orderController.getOrderById);

// Update a specific order by ID
router.put('/:id', auth, orderController.updateOrder);

// Delete a specific order by ID
router.delete('/:id', auth, orderController.deleteOrder);

export default router;
