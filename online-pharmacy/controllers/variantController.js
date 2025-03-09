import express from 'express';
import Product from '../models/Product.js';
import BASE_URL from '../config/config.js'; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add a variant to an existing product
export const createVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, option, price, stock } = req.body;

    console.log("Product ID:", productId); // Log the productId
    console.log("Request body:", req.body); // Log the request body
    console.log("Uploaded file:", req.file);
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Handle variant image upload
    const image = req.file ? `${BASE_URL}/uploads/variant_images/${req.file.filename}` : null;

    // Create a new variant
    const newVariant = {
      name,
      option,
      price,
      stock,
      images: image ? [image] : [],
      subVariants: [], // Empty by default
    };

    // Push to variants array
    product.variants.push(newVariant);
    await product.save();

    res.status(201).json({ message: 'Variant added successfully', name: newVariant.name, product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add variant' });
  }
};


// Add images to a variant
export const addVariantImages = async (req, res) => {
  try {
    const { variantId } = req.params;

    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);
    console.log("Request Params:", req.params);
console.log("Request Query:", req.query);

    // Find the product that contains the variant
    const product = await Product.findOne({ "variants._id": variantId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    const invalidFiles = req.files.filter(file => !allowedMimeTypes.includes(file.mimetype));
    if (invalidFiles.length > 0) {
      return res.status(400).json({ message: "Invalid file type. Only JPEG, PNG, and GIF are allowed." });
    }

    const maxImages = 5;
    if (variant.images.length + req.files.length > maxImages) {
      return res.status(400).json({ message: `You can only upload up to ${maxImages} images per variant.` });
    }

    const newImages = req.files.map(file => `${BASE_URL}/uploads/variant_images/${file.filename}`);

    variant.images.push(...newImages);
    await product.save();

    res.status(200).json({ message: "Images added successfully", images: variant.images });
  } catch (error) {
    console.error("Error in addVariantImages:", error);
    res.status(500).json({ message: "Failed to add images", error: error.message });
  }
};

// Delete an image from a variant
export const deleteVariantImage = async (req, res) => {
  try {
    const { variantId, imageIndex } = req.params;
    console.log("Deleting image:", { variantId, imageIndex }); // Debugging log

    const product = await Product.findOne({ "variants._id": variantId });
    if (!product) {
      console.error("Product not found for variant ID:", variantId); // Debugging log
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      console.error("Variant not found for ID:", variantId); // Debugging log
      return res.status(404).json({ message: "Variant not found" });
    }

    const index = parseInt(imageIndex);
    if (isNaN(index) || index < 0 || index >= variant.images.length) {
      console.error("Invalid image index:", index); // Debugging log
      return res.status(400).json({ message: "Invalid image index" });
    }

    const imageUrl = variant.images[index];
    console.log("Image URL to delete:", imageUrl); // Debugging log

    const filePath = path.join(__dirname, "..", imageUrl.replace(BASE_URL, ""));
    console.log("File path to delete:", filePath); // Debugging log

    // Delete the file from the server
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Failed to delete file:", filePath, err); // Debugging log
      } else {
        console.log("File deleted successfully:", filePath); // Debugging log
      }
    });

    // Remove the image from the variant
    variant.images.splice(index, 1);
    await product.save();

    console.log("Image deleted successfully from database"); // Debugging log
    res.status(200).json({ message: "Image deleted successfully", images: variant.images });
  } catch (error) {
    console.error("Error in deleteVariantImage:", error); // Debugging log
    res.status(500).json({ message: "Failed to delete image", error: error.message });
  }
};
