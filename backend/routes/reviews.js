const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews/product/:productId - Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    const stats = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      reviews,
      avgRating: stats[0]?.avgRating || 0,
      count: stats[0]?.count || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reviews/shop/:shopId - Get reviews for all products in a shop
router.get('/shop/:shopId', async (req, res) => {
  try {
    const reviews = await Review.find({ shop: req.params.shopId })
      .populate('user', 'name avatar')
      .populate('product', 'name images')
      .sort({ createdAt: -1 })
      .limit(50);

    const stats = await Review.aggregate([
      { $match: { shop: require('mongoose').Types.ObjectId.createFromHexString(req.params.shopId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      reviews,
      avgRating: stats[0]?.avgRating || 0,
      count: stats[0]?.count || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/reviews/product/:productId - Create or update a review
router.post('/product/:productId', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Can't review your own product
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot review your own product' });
    }

    const { rating, text } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.findOneAndUpdate(
      { product: req.params.productId, user: req.user._id },
      {
        product: req.params.productId,
        shop: product.shop,
        user: req.user._id,
        rating,
        text: text?.trim(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    const populated = await review.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/reviews/:id - Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
