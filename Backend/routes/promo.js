const express = require('express');
const router = express.Router();
const Promo = require('../models/Promo');

// Route to create a new promo
router.post('/create', async (req, res) => {
  try {
    const { code, discountPercent, expiryDate } = req.body;

    // Validate required fields
    if (!code || !discountPercent || !expiryDate) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create a new promo
    const newPromo = new Promo({
      code,
      discountPercent,
      expiryDate,
    });

    // Save the promo to the database
    const savedPromo = await newPromo.save();
    res.status(201).json(savedPromo);
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error for unique fields
      return res.status(400).json({ message: 'Promo code must be unique.' });
    }
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Route to fetch all promo codes
router.get('/', async (req, res) => {
    try {
      const promos = await Promo.find(); // Fetch all promo codes from the database
      res.status(200).json(promos);
    } catch (error) {
      res.status(500).json({ message: 'Server error.', error: error.message });
    }
  });
  
// Route to apply a promo code
router.post('/apply', async (req, res) => {
  try {
    const { code } = req.body;

    // Validate required fields
    if (!code) {
      return res.status(400).json({ message: 'Promo code is required.' });
    }

    // Find the promo code in the database
    const promo = await Promo.findOne({ code, isActive: true });

    if (!promo) {
      return res.status(404).json({ message: 'Invalid or expired promo code.' });
    }

    // Check if the promo code has expired
    if (new Date(promo.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Promo code has expired.' });
    }

    res.status(200).json({ discountPercent: promo.discountPercent });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;