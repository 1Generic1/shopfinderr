import Category from '../models/Category.js';
import Product from '../models/Product.js';
// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? `http://localhost:3001/uploads/categories_images/${req.file.filename}` : null;
    
    // Validate if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a picture.' });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ msg: 'Category already exists' });
    }

    const category = new Category({
      name,
      image,
    });
    console.log('Category before save:', category);
    await category.save();
    console.log('Category after save:', category);
    res.status(201).json(category);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Update an existing category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const image = req.file ? `http://localhost:3001/uploads/categories_images/${req.file.filename}` : null;
    
     console.log("Category ID from request params:", id);
    console.log("Category name from request body:", name);
    console.log("Image file from request:", image);
    // Find the category by ID
    const category = await Category.findById(id);
    console.log("Category found in the database:", category);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    // Store the old category name in case it's changed
    const oldCategoryName = category.name;
    console.log("Old category name:", oldCategoryName);

    // Update category fields
    category.name = name || category.name;
    if (image) {
      category.image = image;
    }

    // Save the updated category
    await category.save();
    console.log("Updated category:", category);
    // If the category name is updated, update all products with the old category name
    if (oldCategoryName !== category.name) {
      const updatedProducts = await Product.updateMany(
        { category: oldCategoryName }, // Match by old category name
        { $set: { category: name } } // Update the category field in Product model
      );
      console.log(`Updated ${updatedProducts.modifiedCount} products with the new category name.`);
    }
   
    res.json({ msg: 'Category updated successfully', category });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the category by ID and delete it
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    res.json({ msg: 'Category deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

