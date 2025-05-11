const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        size: {
            type: String, // Store the selected size
            required: true
        },
        color: {
            type: String, // Store the selected color
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    cancellationReason: {
        type: String, // Store the reason for cancellation
        default: null
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'cash'],
        required: true
    },
    discount: {
        type: Number, // Store the discount percentage
        default: 0,
    },
    discountAmount: {
        type: Number, // Store the discount amount
        default: 0,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);