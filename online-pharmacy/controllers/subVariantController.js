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


// Add a sub-variant to a specific variant
export const createSubVariant = async (req, res) => {
  try {
    const { variantId } = req.params; // Get variantId from route parameters
    console.log("Variant ID from backend:", variantId); 
    const { name, price, stock } = req.body; // Get subvariant data from request body

    // Handle file upload
    const image = req.file ? `${BASE_URL}/uploads/subvariant_images/${req.file.filename}` : null;

    // Find the product that contains the variant
    const product = await Product.findOne({ "variants._id": variantId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find the variant inside the product
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    // Add sub-variant
    const newSubVariant = {
      name,
      price,
      stock,
      images: image ? [image] : [], // Add image URL if file is uploaded
    };

    variant.subVariants.push(newSubVariant);
    await product.save();

     // Return the subvariant name in the response
    res.status(201).json({ 
      message: 'Sub-variant added successfully', 
      name: newSubVariant.name,
      product 
    });

  } catch (error) {
    console.error("Error creating sub-variant:", error);
    res.status(500).json({ error: 'Failed to add sub-variant', details: error.message });
  }
};


export const updateSubVariant = async (req, res) => {
  try {
    const { subVariantId } = req.params;
    const { name, price, stock, imagePosition, imageIndex } = req.body;

    // Find the product that contains the subvariant
    const product = await Product.findOne({ "variants.subVariants._id": subVariantId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let variant = null;
    let subVariant = null;

    // Find the variant and subvariant
    for (const v of product.variants) {
      subVariant = v.subVariants.id(subVariantId);
      if (subVariant) {
        variant = v;
        break;
      }
    }

    if (!subVariant) {
      return res.status(404).json({ message: "Sub-variant not found" });
    }

    // Update subvariant fields
    if (name) subVariant.name = name;
    if (price) subVariant.price = price;
    if (stock) subVariant.stock = stock;

    // Handle image update if a new image is provided
    if (req.file) {
      const imageUrl = `${BASE_URL}/uploads/subvariant_images/${req.file.filename}`;

      // Determine where to place the new image
      if (imagePosition === "first") {
        subVariant.images.unshift(imageUrl); // Add to the beginning
      } else if (imagePosition === "last") {
        subVariant.images.push(imageUrl); // Add to the end
      } else if (imagePosition === "specific") {
        const index = parseInt(imageIndex); // Specific index
        if (index >= 0 && index < subVariant.images.length) {
          subVariant.images.splice(index, 0, imageUrl); // Insert at the specified index
        } else {
          return res.status(400).json({ message: "Invalid image index" });
        }
      } else {
        return res.status(400).json({ message: "Invalid image position" });
      }

      // Ensure the array does not exceed the maximum limit (e.g., 5 images)
      if (subVariant.images.length > 5) {
        const removedImages = subVariant.images.slice(5); // Get the images that will be removed
        subVariant.images = subVariant.images.slice(0, 5); // Keep only the first 5 images

        // Delete the removed files from the file system
        removedImages.forEach((image) => {
          const filePath = path.join(__dirname, "..", image.replace(BASE_URL, ""));
          deleteFile(filePath);
        });
      }
    }

     await product.save();

    res.status(200).json({ message: "Sub-variant updated successfully", subVariant });
  } catch (error) {
    console.error("Error in updateSubVariant:", error);
    res.status(500).json({ message: "Failed to update sub-variant", error: error.message });
  }
};


// Add images to a sub-variant
export const addSubVariantImages = async (req, res) => {
  try {
    const { subVariantId } = req.params;

    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);

    const product = await Product.findOne({ "variants.subVariants._id": subVariantId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let variant = null;
    let subVariant = null;

    for (const v of product.variants) {
      subVariant = v.subVariants.id(subVariantId);
      if (subVariant) {
        variant = v;
        break;
      }
    }

    if (!subVariant) {
      return res.status(404).json({ message: "Sub-variant not found" });
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
    if (subVariant.images.length + req.files.length > maxImages) {
      return res.status(400).json({ message: `You can only upload up to ${maxImages} images per sub-variant.` });
    }

    const newImages = req.files.map(file => `${BASE_URL}/uploads/subvariant_images/${file.filename}`);

    subVariant.images.push(...newImages);
    await product.save();

    res.status(200).json({ message: "Images added successfully", images: subVariant.images });
  } catch (error) {
    console.error("Error in addSubVariantImages:", error);
    res.status(500).json({ message: "Failed to add images", error: error.message });
  }
};

// Delete an image from a sub-variant
export const deleteSubVariantImage = async (req, res) => {
  try {
    const { subVariantId, imageIndex } = req.params;
    const product = await Product.findOne({ "variants.subVariants._id": subVariantId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let variant = null;
    let subVariant = null;

    for (const v of product.variants) {
      subVariant = v.subVariants.id(subVariantId);
      if (subVariant) {
        variant = v;
        break;
      }
    }

    if (!subVariant) {
      return res.status(404).json({ message: "Sub-variant not found" });
    }

    const index = parseInt(imageIndex);
    if (isNaN(index) || index < 0 || index >= subVariant.images.length) {
      return res.status(400).json({ message: "Invalid image index" });
    }

    const imageUrl = subVariant.images[index];
    const filePath = path.join(__dirname, '..', imageUrl.replace(BASE_URL, ''));

    fs.unlink(filePath, err => {
      if (err) console.error("Failed to delete file:", filePath);
    });

    subVariant.images.splice(index, 1);
    await product.save();

    res.status(200).json({ message: "Image deleted successfully", images: subVariant.images });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete image", error: error.message });
  }
};
