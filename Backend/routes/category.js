const router = require('express').Router();
const Category = require('../models/Category');
const { verifyTokenAndAdmin } = require('../routes/verifyToken');

// Add multiple categories
router.post('/addCategory', verifyTokenAndAdmin,async (req, res) => {
    try {
        const { name } = req.body;

            // Check if the category already exists
            const existingCategory = await Category.findOne({ name: name });
            if (!existingCategory) {
                // Create and save the new category
                const newCategory = new Category({ name: name });
                const savedCategory = await newCategory.save();
                res.status(201).json({
                    message: 'Category added successfully',
                    category: savedCategory,
                });
            }
    } catch (error) {
        console.error('Error adding category:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all categories
router.get('/getAllCategories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;