const express = require('express');
const router = express.Router();
const { verifyTokenAndAdmin, verifyToken } = require('../routes/verifyToken');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @route   POST /api/products
// @desc    Create a new product
// @access  Admin only
router.post('/createProduct', verifyTokenAndAdmin, async (req, res) => {
    try {
        const { title, description, price, images, category, quantity, sizes, colors, discount } = req.body;

        const newProduct = new Product({
            title,
            description,
            price,
            images,
            category,
            quantity,
            sizes,
            colors,
            discount
        });

        const savedProduct = await newProduct.save();
        const currentCategory = await Category.findById(category);
        if (!currentCategory) {
            return res.status(404).json({ msg: 'Category not found' });
        }

        currentCategory.products.push(savedProduct._id);
        await currentCategory.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Admin only
router.put('/editProduct/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(201).json(updatedProduct);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Admin only
router.delete('/deleteProduct/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.status(200).json({ msg: 'Product deleted successfully', product: deletedProduct });
    } catch (err) {
        console.error('Error deleting product:', err.message);

        if (err.name === 'CastError') {
            return res.status(400).json({ msg: 'Invalid product ID format' });
        }

        res.status(500).json({ msg: 'Server Error' });
    }
});

router.get('/getAllProducts', async (req, res) => {
    try {
      const products = await Product.find();
      
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error.message);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  router.post('/:id/createReview', verifyToken, async (req, res) => {
    try {
        const productId = req.params.id;
        const { rating, comment } = req.body;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const newReview = {
            user: req.user.id, // Add the user ID from the token
            rating,
            comment,
        };

        product.reviews.push(newReview);
        await product.save();

        // Populate the user field for the newly added review
        const populatedReview = await Product.findOne(
            { _id: productId },
            { reviews: { $slice: -1 } } // Get only the last review
        ).populate('reviews.user', 'username');

        res.status(201).json(populatedReview.reviews[0]); // Send the populated review
    } catch (error) {
        console.error('Error adding review:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

  router.get('/category/:categoryName', async (req, res) => {
    try {
      const { categoryName } = req.params;
      const category = await Category.findOne({ name: categoryName });
      if (!category) {
        return res.status(404).json({ message: Category `${categoryName}' not found` });
      }
  
      const allProducts = await Product.find();
      
      const filteredProducts = allProducts.filter(
        product => product.category?.toString() === category._id.toString()
      );      
      
      res.json(filteredProducts);
    } catch (error) {
      console.error('Error fetching products by category:', error.message);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).populate("reviews.user", "username");
      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }
      res.json(product);
    } catch (err) {
      console.error('Error fetching product:', err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  });


  router.get('/related/:categoryId/:excludeProductId', async (req, res) => {
    try {
        const { categoryId, excludeProductId } = req.params;

        // Find products in the same category, excluding the current product
        const relatedProducts = await Product.find({
            category: categoryId,
            _id: { $ne: excludeProductId }, // Exclude the current product
        })
            .limit(4); // Limit to 4 products

        res.json(relatedProducts);
    } catch (err) {
        console.error('Error fetching related products:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/products/search/query
// @desc    Search for products by query
// @access  Public
router.get('/search/query', async (req, res) => {
  try {
    const { q } = req.query; // Extract the query parameter

    if (!q) {
      return res.status(400).json({ msg: 'Query parameter is required' });
    }

    // Perform a case-insensitive search on the title or description fields
    const products = await Product.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    });

    res.json(products);
  } catch (err) {
    console.error('Error searching for products:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;