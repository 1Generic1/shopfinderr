import express from 'express';
import Product from '../models/Product.js';
import BASE_URL from '../config/config.js'; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete file: ${filePath}`, err);
    } else {
      console.log(`File deleted successfully: ${filePath}`);
    }
  });
};

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


export const updateVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { name, option, price, stock, imagePosition, imageIndex } = req.body;

    // Find the product that contains the variant
    const product = await Product.findOne({ "variants._id": variantId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Update variant fields
    if (name) variant.name = name;
    if (option) variant.option = option;
    if (price) variant.price = price;
    if (stock) variant.stock = stock;

    // Handle image update if a new image is provided
    if (req.file) {
      const imageUrl = `${BASE_URL}/uploads/variant_images/${req.file.filename}`;

      // Determine where to place the new image
      if (imagePosition === "first") {
        variant.images.unshift(imageUrl); // Add to the beginning
      } else if (imagePosition === "last") {
        variant.images.push(imageUrl); // Add to the end
      } else if (imagePosition === "specific") {
        const index = parseInt(imageIndex); // Specific index
        if (index >= 0 && index < variant.images.length) {
          variant.images.splice(index, 0, imageUrl); // Insert at the specified index
        } else {
          return res.status(400).json({ message: "Invalid image index" });
        }
      } else {
        return res.status(400).json({ message: "Invalid image position" });
      }

      // Ensure the array does not exceed the maximum limit (e.g., 5 images)
      if (variant.images.length > 5) {
        const removedImages = variant.images.slice(5); // Get the images that will be removed
        variant.images = variant.images.slice(0, 5); // Keep only the first 5 images

        // Delete the removed files from the file system
        removedImages.forEach((image) => {
          const filePath = path.join(__dirname, "..", image.replace(BASE_URL, ""));
          deleteFile(filePath);
        });
      }
    }

    await product.save();

    res.status(200).json({ message: "Variant updated successfully", variant });
  } catch (error) {
    console.error("Error in updateVariant:", error);
    res.status(500).json({ message: "Failed to update variant", error: error.message });
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

// Delete a variant
export const deleteVariant = async (req, res) => {
  try {
    const { variantId } = req.params;

    // Find the product that contains the variant
    const product = await Product.findOne({ "variants._id": variantId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the variant to delete
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Delete all images associated with the variant from the file system
    variant.images.forEach((image) => {
      const filePath = path.join(__dirname, "..", image.replace(BASE_URL, ""));
      deleteFile(filePath);
    });

    // Remove the variant from the product's variants array
    product.variants = product.variants.filter((v) => v._id.toString() !== variantId);
    await product.save();

    res.status(200).json({ message: "Variant deleted successfully" });
  } catch (error) {
    console.error("Error in deleteVariant:", error);
    res.status(500).json({ message: "Failed to delete variant", error: error.message });
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
