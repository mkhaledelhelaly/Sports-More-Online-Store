const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
    quantity: { type: Number, required: true, min: 0 },
    reviews: [reviewSchema],
    sizes: { type: [String], required: false }, // Added size field
    colors: { type: [String], required: false }, // Added color field
    discount: { type: Number, default: 0, min: 0, max: 100 }, // Discount percentage (0-100)
});

// Virtual field to calculate the discounted price
productSchema.virtual('discountedPrice').get(function () {
    return this.price - (this.price * this.discount) / 100;
});

// Include virtuals in JSON responses
productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;