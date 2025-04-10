import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import BASE_URL from '../config/config.js'; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { deleteFile } from '../utils/fileUtils.js';

// Define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper functions
function getPhysicalPath(url) {
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'products_images');
  const filename = url?.split('/')?.pop();
  return filename ? path.join(uploadsDir, filename) : null;
}


// Create a new product (without variants)
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, description, stock, rating } = req.body;

    const image = req.file ? `${BASE_URL}/uploads/products_images/${req.file.filename}` : null;

    if (!name || !price || !category || !stock || !description || !rating) {
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
      stock,
      images: image ? [image] : [],
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
};

//get all products
export const getAllProducts = async (req, res) => {
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
};

//get products by id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, description, rating, imagePosition, imageIndex } = req.body;

    // Verify required fields
    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update product fields
    product.name = name;
    product.category = category;
    product.price = price;
    product.stock = stock;
    if (description) product.description = description;
    
    // Validate rating
    if (rating !== undefined) {
      if (rating < 0 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 0 and 5" });
      }
      product.rating = rating;
    }

    // Handle image update
    if (req.file) {
      const imageUrl = `${BASE_URL}/uploads/products_images/${req.file.filename}`;
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'products_images');

      // Verify file exists
      const tempFilePath = path.join(uploadsDir, req.file.filename);
      if (!fs.existsSync(tempFilePath)) {
        return res.status(400).json({ message: "Uploaded file not found" });
      }

      // Initialize images array if it doesn't exist
      if (!product.images) product.images = [];

      switch (imagePosition) {
        case 'first':
          // Replace first image
          if (product.images[0]) deleteFile(getPhysicalPath(product.images[0]));
          product.images[0] = imageUrl;
          break;

        case 'last':
          // Replace last image
          if (product.images.length > 0) {
            deleteFile(getPhysicalPath(product.images[product.images.length - 1]));
            product.images.pop();
          }
          product.images.push(imageUrl);
          break;

        case 'specific':
          const index = parseInt(imageIndex);
          // Replace at specific index
          if (index >= 0 && index < product.images.length) {
            if (product.images[index]) deleteFile(getPhysicalPath(product.images[index]));
            product.images[index] = imageUrl;
          } else if (index === product.images.length) {
            // Allow adding to end if index is exactly at length
            product.images.push(imageUrl);
          } else {
            deleteFile(tempFilePath);
            return res.status(400).json({ message: "Invalid image index" });
          }
          break;

        default:
          deleteFile(tempFilePath);
          return res.status(400).json({ message: "Invalid image position" });
      }

      // Clean up empty entries and enforce max limit
      product.images = product.images.filter(img => img);
      if (product.images.length > 5) {
        product.images.slice(5).forEach(img => deleteFile(getPhysicalPath(img)));
        product.images = product.images.slice(0, 5);
      }
    }

    await product.save();
    res.status(200).json({ 
      message: "Product updated successfully", 
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        // include other necessary fields
      }
    });

  } catch (error) {
    console.error("Error in updateProduct:", error);
    if (req?.file?.filename) {
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'products_images');
      deleteFile(path.join(uploadsDir, req.file.filename));
    }
    res.status(500).json({ 
      message: "Failed to update product",
      error: error.message 
    });
  }
};


export const addProductImages = async (req, res) => {

  console.log("Request Body:", req.body); // Log the request body
  console.log("Request Files:", req.files);
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    // Validate file types (double-check)
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    const invalidFiles = req.files.filter((file) => !allowedMimeTypes.includes(file.mimetype));
    if (invalidFiles.length > 0) {
      return res.status(400).json({ message: "Invalid file type. Only JPEG, PNG, and GIF are allowed." });
    }

    // Limit number of images
    const maxImages = 5;
    if (product.images.length + req.files.length > maxImages) {
      return res.status(400).json({ message: `You can only upload up to ${maxImages} images per product.` });
    }

    // Save the image URLs
    const newImages = req.files.map((file) => `${BASE_URL}/uploads/products_images/${file.filename}`);

    // Update the product with new images (atomic operation)
    const updateResult = await Product.updateOne(
      { _id: req.params.productId },
      { $push: { images: { $each: newImages } } }
    );
    console.log("Update Result:", updateResult);

    res.status(200).json({ message: "Images added successfully", images: [...product.images, ...newImages] });
  } catch (error) {
    console.error("Error in addProductImages:", error); 
    // Delete uploaded files if an error occurs
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Failed to delete file:", file.path);
        });
      });
    }

    res.status(500).json({ message: "Failed to add images", error: error.message });
  }
};


// Delete image from product
export const deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate image index
    const imageIndex = parseInt(req.params.imageIndex);
    if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= product.images.length) {
      return res.status(400).json({ message: "Invalid image index" });
    }

    // Get the image URL
    const imageUrl = product.images[imageIndex];

    // Convert URL to file path
    const baseUrl = `${BASE_URL}`;
    const filePath = imageUrl.replace(baseUrl, '');
    const imagePath = path.join(__dirname, '..', filePath);

    // Delete the image from the file system
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Failed to delete image file:", err);
      }
    });

    // Remove the image from the database (atomic operation)
    await Product.updateOne(
      { _id: req.params.productId },
      { $pull: { images: imageUrl } }
    );

    res.status(200).json({ message: "Image deleted successfully", images: product.images.filter((img) => img !== imageUrl) });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete image", error: error.message });
  }
};


// Delete product and its associated images
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product first
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete all associated images from the file system
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          const filePath = getPhysicalPath(imageUrl);
          if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted image file: ${filePath}`);
          }
        } catch (err) {
          console.error(`Error deleting image file for URL ${imageUrl}:`, err);
          // Continue with deletion even if one image fails to delete
        }
      }
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Product and associated images deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ 
      message: "Failed to delete product",
      error: error.message 
    });
  }
};


