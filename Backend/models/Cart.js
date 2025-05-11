const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: true,
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product', 
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1, 
                },
                size: {
                    type: String,
                    required: true,
                },
                color: {
                    type: String,
                    required: true,
                },
                price: { type: Number, required: true }, // Add price field
            },
        ],
        totalPrice: {
            type: Number,
            required: true,
            default: 0, 
            min: 0, 
        },
    },
    { timestamps: true } 
);

module.exports = mongoose.model('Cart', CartSchema);