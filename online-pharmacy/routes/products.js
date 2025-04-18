import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import auth from '../middleware/auth.js';
import uploadProductImage from '../middleware/uploadProductImage.js';
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

router.get('/all_productss', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from DB
    res.json(products); // Send products as JSON response
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/all_products', async (req, res) => {
  try {
    // Extract query parameters
    const { category, minPrice, maxPrice, sortBy, page = 1, pageSize = 20 } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

    // Build sort object
    const sort = {};
    if (sortBy) sort[sortBy] = -1; // 1 for ascending order, -1 for descending order

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

router.put('/:id', auth, uploadProductImage, async (req, res) => {
  const { name, category, price, quantity,  description, rating } = req.body;

  try {
    const productId = req.params.id;
    console.log("Product ID:", productId);
    let product = await Product.findById(productId);
    console.log("Retrieved Product:", product);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    product.name = name || product.name;
    product.category  = category || product.category
    product.price = price || product.price
    if (quantity !== undefined) {
      product.quantity = quantity;
      product.inStock = quantity > 0; // Explicitly set inStock here
    }  
    product.description = description || product.description

    // Set the rating if provided and valid
    if (rating !== undefined) {
      if (rating >= 0 && rating <= 5) {
        product.rating = rating;
      } else {
        return res.status(400).json({ msg: 'Rating must be between 0 and 5' });
      }
    }
    
    if (req.file) {
      product.image = `http://localhost:3001/uploads/products_images/${req.file.filename}`; // Save the uploaded image path
    }
    await product.save();

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/add', uploadProductImage, async (req, res) => {
  try {
    const { name, category, price, description, quantity, rating } = req.body;

    const image = req.file ? `http://localhost:3001/uploads/products_images/${req.file.filename}` : null;

    if (!name || !price || !category || !quantity || !description || !rating) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the category exists
    const existingCategory = await Category.findOne({ name: category });
    if (!existingCategory) {
      return res.status(400).json({ msg: 'Category does not exist' });
    }

    // Check if a product with the same name already exists in the same category
    const existingProduct = await Product.findOne({ name, category });
    if (existingProduct) {
      return res.status(400).json({ error: `A product with the name "${name}" already exists in the "${category}" category.` });
    }

    let productRating = rating;

    if (rating !== undefined) {
      if (rating >= 0 && rating <= 5) {
        productRating = rating;
      } else {
        return res.status(400).json({ msg: 'Rating must be between 0 and 5' });
      }
    }

    const newProduct = new Product({
      name,
      category,
      price,
      description,
      quantity,
      image,
      rating: productRating,
    });
    console.log('product before save:', newProduct);
    await newProduct.save();
    console.log('product after save:', newProduct);
    res.status(201).json({ message: 'Product added successfully', newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
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
