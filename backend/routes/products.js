const express = require('express');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// GET /api/products - List products (feed)
router.get('/', async (req, res) => {
  try {
    const {
      category,
      neighborhood,
      search,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isAvailable: true };

    if (category) query.category = category;
    if (neighborhood) query.neighborhood = neighborhood;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { likes: -1 };

    const products = await Product.find(query)
      .populate('shop', 'name profileImage')
      .populate('seller', 'name')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shop', 'name profileImage instagramHandle whatsappNumber')
      .populate('seller', 'name avatar');

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products - Create product (seller)
router.post('/', auth, async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(400).json({ message: 'You need to create a shop first' });
    }

    // Remove any client-side image URIs (they'll be uploaded separately)
    const { images, ...productData } = req.body;

    const product = await Product.create({
      ...productData,
      shop: shop._id,
      seller: req.user._id,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products/:id/like - Like/unlike product
router.post('/:id/like', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const isLiked = product.likes.includes(req.user._id);

    if (isLiked) {
      product.likes.pull(req.user._id);
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { savedProducts: product._id },
      });
    } else {
      product.likes.push(req.user._id);
      await User.findByIdAndUpdate(req.user._id, {
        $push: { savedProducts: product._id },
      });
    }

    await product.save();
    res.json({ isLiked: !isLiked, likeCount: product.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products/:id/upload - Upload product images
router.post('/:id/upload', auth, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const urls = req.files.map((file) => {
      if (file.path && file.path.startsWith('http')) return file.path;
      return `/uploads/${file.filename}`;
    });
    product.images.push(...urls);
    await product.save();

    res.json({ urls, images: product.images });
  } catch (error) {
    console.error('Product upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
