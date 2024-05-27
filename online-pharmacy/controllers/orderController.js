import auth from '../middleware/auth.js';
import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const orderController = {
  createOrder: async (req, res) => {
    try {
      const { products, totalAmount } = req.body;
      // Ensure products exist and have sufficient quantities
      for (let item of products) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ msg: 'Product not found' });
        }
      }

      const newOrder = new Order({
        user: req.user.id,
        products,
        totalAmount
      });

      const order = await newOrder.save();
      res.json(order);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },

  getOrders: async (req, res) => {
    try {
      const orders = await Order.find({ user : req.user.id}).populate('products.product');
      res.json(orders);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }     
  },
        
  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate('products.product');
      if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
      }

      if (order.user.toString() !== res.user.id) {
       return res.status(401).json({ msg: 'Not authorized' });
      }

      res.json(order);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server Error')
    }       
  },

  updateOrder: async (req, res) => {
    try {
      const { products, totalAmount } = req.body;

      let order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404). json({ msg: 'Order not found' });
      }

      if (order.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }

      order.products = products || order.products;
      order.totalAmount = totalAmount || order.totalAmount;

      order = await order.save();
      res.json(order);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
      }

      if (order.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }

      await order.remove();
      res.json({ msg: 'Order deleted' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
};

export default orderController;
