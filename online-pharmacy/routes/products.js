import express from 'express';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';
import { Types } from 'mongoose';

const { ObjectId } = Types;

const router = express.Router();


router.post('/', auth, async (req, res) => {
  const { name, category, price, quantity, description } = req.body;


  try {
    const newProduct = new Product({
      name,
      category,
      price,
      quantity,
      description,
    });

    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.get('/', async (req, res) => {
  try {
    // Extract query parameters
    const { category, minPrice, maxPrice, sortBy, page = 1, pageSize = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

    // Build sort object
    const sort = {};
    if (sortBy) sort[sortBy] = 1; // 1 for ascending order, -1 for descending order

    // Pagination options
    const options = {
      page: Number(page),
      limit: Number(pageSize),
      sort
    };

    // Find products with pagination, filtering, and sorting
    const products = await Product.paginate(filter, options);

    // Respond with the products
    res.json(products);
    } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name, category, price, quantity,  description } = req.body;

  try {
    const productId = req.params.id;
    console.log("Product ID:", productId);
    let product = await Product.findById(productId);
    console.log("Retrieved Product:", product);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    product.name = name || product.name;
    product.category  = category || product.category
    product.price = price || product.price
    product.quantity = quantity || product.quantity
    product.description = description || product.description
    
    await product.save();

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: 'Invalid product ID' });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    await Product.deleteOne({ _id: productId });

    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
