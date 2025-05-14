const router = require('express').Router();
const { verifyToken, verifyTokenAndAdmin } = require('./verifyToken'); // Ensure admin verification
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

router.get('/getOrders', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate({
                path: 'items.product',
                select: 'title price images sizes colors', // Include sizes and colors
            })
            .sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(200).json({
                message: 'No orders found',
                orders: []
            });
        }

        const formattedOrders = orders.map(order => {
            const subtotal = order.items.reduce((total, item) => total + item.price * item.quantity, 0);
            return {
                orderId: order._id,
                items: order.items.map(item => ({
                    product: {
                        _id: item.product._id,
                        title: item.product.title,
                        price: item.price,
                        image: item.product.images[0],
                        sizes: item.size, // Include sizes
                        colors: item.color // Include colors
                    },
                    quantity: item.quantity,
                    subtotal: Number((item.price * item.quantity).toFixed(2))
                })),
                subtotal: Number(subtotal.toFixed(2)), // Total before discount
                discount: order.discount || 0, // Discount percentage  
                discountAmount: order.discountAmount || 0, // Discount applied
                totalAmount: order.totalAmount, // Total after discount
                shippingFee: order.shippingFee, // Include shipping fee
                paymentMethod: order.paymentMethod, // Include payment method
                status: order.status,
                createdAt: order.createdAt,
                itemCount: order.items.length
            };
        });

        res.status(200).json({
            orders: formattedOrders,
            totalOrders: formattedOrders.length
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ 
            message: 'Error fetching orders',
            error: error.message 
        });
    }
});

router.post('/createOrder', verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('products.product');

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const orderItems = cart.products.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price,
            size: item.size, // Include selected size
            color: item.color // Include selected color
        }));

        const subtotal = orderItems.reduce((total, item) => 
            total + (item.price * item.quantity), 0);

        const shippingFee = req.body.shippingFee || 0; // Get shipping fee from frontend
        const discountAmount = (subtotal * req.body.discount) / 100;
        const totalAmount = subtotal - discountAmount + shippingFee;
        const paymentMethod = req.body.selectedPayment; 

        const newOrder = new Order({
            user: req.user.id,
            items: orderItems,
            totalAmount: Number(totalAmount.toFixed(2)),
            status: 'pending',
            shippingFee,
            paymentMethod, // Store the payment method
            discount: req.body.discount, // Store the discount percentage
            discountAmount,
        });

        for (const item of cart.products) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.product._id} not found` });
            }

            if (product.quantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for product: ${product.title}` 
                });
            }

            product.quantity -= item.quantity; // Reduce stock
            await product.save();
        }

        await newOrder.save();

        // Clear the cart
        cart.products = [];
        cart.totalPrice = 0;
        await cart.save();

        const populatedOrder = await Order.findById(newOrder._id)
            .populate({
                path: 'items.product',
                select: 'title price images', // Include only necessary fields
            });

        const formattedOrder = {
            orderId: populatedOrder._id,
            items: populatedOrder.items.map(item => ({
                product: {
                    _id: item.product._id,
                    title: item.product.title,
                    price: item.price,
                    image: item.product.images[0]
                },
                quantity: item.quantity,
                size: item.size, // Include selected size
                color: item.color, // Include selected color
                subtotal: Number((item.price * item.quantity).toFixed(2))
            })),
            totalAmount: populatedOrder.totalAmount,
            status: populatedOrder.status,
            discountAmount: populatedOrder.discount,
            createdAt: populatedOrder.createdAt
        };

        res.status(201).json({
            message: 'Order created successfully',
            order: formattedOrder
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            message: 'Error creating order',
            error: error.message 
        });
    }
});

// Route to update the status of an order
router.put('/updateStatus/:orderId', verifyTokenAndAdmin, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Validate the status
        const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Find and update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({
            message: 'Order status updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            message: 'Error updating order status',
            error: error.message
        });
    }
});

// Route for admin to view all orders
router.get('/admin/getAllOrders', verifyTokenAndAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'items.product',
                select: 'title price images', // Include necessary fields
            })
            .populate({
                path: 'user',
                select: 'username email address phoneNumber', // Include user details
            })
            .sort({ createdAt: -1 }); // Sort by most recent orders

        if (!orders || orders.length === 0) {
            return res.status(200).json({
                message: 'No orders found',
                orders: []
            });
        }

        const formattedOrders = orders.map(order => ({
            orderId: order._id,
            user: {
                id: order.user._id,
                username: order.user.username,
                email: order.user.email,
                address: order.user.address,
                phoneNumber: order.user.phoneNumber,
            },
            items: order.items.map(item => ({
                product: {
                    _id: item.product._id,
                    title: item.product.title,
                    price: item.price,
                    image: item.product.images[0],
                },
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                subtotal: Number((item.price * item.quantity).toFixed(2)),
            })),
            totalAmount: order.totalAmount,
            status: order.status,
            discount: order.discount || 0, // Discount percentage  
            discountAmount: order.discountAmount || 0, // Discount applied
            paymentMethod: order.paymentMethod, // Include payment method
            cancellationReason: order.cancellationReason || null, // Include cancellation reason
            createdAt: order.createdAt,
        }));

        res.status(200).json({
            message: 'Orders fetched successfully',
            orders: formattedOrders,
            totalOrders: formattedOrders.length,
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({
            message: 'Error fetching all orders',
            error: error.message,
        });
    }
});

router.put('/cancelOrder/:orderId', verifyToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ message: 'Cancellation reason is required' });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to cancel this order' });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Order is already cancelled' });
        }

        order.status = 'cancelled';
        order.cancellationReason = reason;
        await order.save();

        res.status(200).json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Error cancelling order', error: error.message });
    }
});

module.exports = router;