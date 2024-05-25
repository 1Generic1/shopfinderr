const auth = require('../middleware/auth');
const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');


module.exports = {
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

