const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { verifyTokenAndAuthorization, verifyToken } = require('../routes/verifyToken');
const Product = require('../models/Product');


// Calculate total price
const calculateTotalPrice = async (products) => {
    return products.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Add product to cart
router.post('/add', verifyToken, async (req, res) => {
    try {
        const { productId, quantity, size, color, price } = req.body; // Accept price from the request
        console.log("Product PRICE:", price);
        let cart = await Cart.findOne({ user: req.user.id });

        if (cart) {
            const productIndex = cart.products.findIndex(
                (p) => p.product.toString() === productId && p.size === size && p.color === color
            );
            if (productIndex > -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity, size, color, price });
            }
        } else {
            cart = new Cart({
                user: req.user.id,
                products: [{ product: productId, quantity, size, color, price }],
            });
        }
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Remove product from cart
router.delete('/removeProduct/:productId', verifyToken, async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const productIndex = cart.products.findIndex((item) => {
            return item.product.toString() === productId;
        });

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Remove the product from the cart
        cart.products.splice(productIndex, 1);

        // Recalculate the total price
        cart.totalPrice = await calculateTotalPrice(cart.products);

        // Save the updated cart
        await cart.save();

        // Populate the product field before sending the response
        const populatedCart = await Cart.findOne({ user: req.user.id }).populate('products.product');

        res.status(200).json(populatedCart);
    } catch (error) {
        console.error('Error removing product from cart:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// View cart
router.get('/', verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('products.product');
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Empty cart
router.delete('/empty', verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            cart.products = [];
            cart.totalPrice = 0;
            await cart.save();
            res.status(200).json(cart);
        } else {
            res.status(404).json("Cart not found");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update product quantity in cart
router.post('/updateCart', verifyToken, async (req, res) => {
    try {
        const { cartItemId, quantity } = req.body; // Use cartItemId and quantity increment

        let cart = await Cart.findOne({ user: req.user.id });

        if (cart) {
            const existingProductIndex = cart.products.findIndex(
                (item) => item._id.toString() === cartItemId // Match by cart item ID
            );

            if (existingProductIndex > -1) {
                // Update the quantity incrementally
                cart.products[existingProductIndex].quantity += quantity;

                // Ensure the quantity doesn't go below 1
                if (cart.products[existingProductIndex].quantity < 1) {
                    cart.products[existingProductIndex].quantity = 1;
                }
            } else {
                return res.status(404).json({ message: 'Cart item not found' });
            }
        } else {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.totalPrice = await calculateTotalPrice(cart.products);

        await cart.save();

        // Populate the product field before sending the response
        const populatedCart = await Cart.findOne({ user: req.user.id }).populate('products.product');

        res.status(200).json(populatedCart);
    } catch (error) {
        console.error('Error updating product quantity in cart:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;