const express = require('express');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth, sellerOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// GET /api/shops - List all shops
router.get('/', async (req, res) => {
  try {
    const { category, neighborhood, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (neighborhood) query.neighborhood = neighborhood;
    if (search) query.name = { $regex: search, $options: 'i' };

    const shops = await Shop.find(query)
      .populate('owner', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Shop.countDocuments(query);

    res.json({
      shops,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/shops/mine - Get current user's shop
router.get('/mine', auth, async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id }).populate('owner', 'name avatar phone');
    if (!shop) return res.status(404).json({ message: 'No shop found' });

    const products = await Product.find({ shop: shop._id, isAvailable: true })
      .sort({ createdAt: -1 });

    res.json({ shop, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/shops/:id - Get shop details
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('owner', 'name avatar phone');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const products = await Product.find({ shop: shop._id, isAvailable: true })
      .sort({ createdAt: -1 });

    res.json({ shop, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/shops - Create shop (seller only)
router.post('/', auth, async (req, res) => {
  try {
    // Upgrade user to seller
    await User.findByIdAndUpdate(req.user._id, { role: 'seller' });

    const existingShop = await Shop.findOne({ owner: req.user._id });
    if (existingShop) {
      return res.status(400).json({ message: 'You already have a shop' });
    }

    const shop = await Shop.create({
      ...req.body,
      owner: req.user._id,
    });

    res.status(201).json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/shops/:id - Update shop
router.put('/:id', auth, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Shop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/shops/:id - Delete shop
router.delete('/:id', auth, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all products belonging to this shop
    await Product.deleteMany({ shop: shop._id });
    await Shop.findByIdAndDelete(req.params.id);

    res.json({ message: 'Shop and all its products have been deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/shops/:id/follow - Follow/unfollow shop
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const isFollowing = shop.followers.includes(req.user._id);

    if (isFollowing) {
      shop.followers.pull(req.user._id);
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { followingShops: shop._id },
      });
    } else {
      shop.followers.push(req.user._id);
      await User.findByIdAndUpdate(req.user._id, {
        $push: { followingShops: shop._id },
      });
    }

    await shop.save();
    res.json({ isFollowing: !isFollowing, followerCount: shop.followers.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/shops/:id/upload - Upload shop images
router.post('/:id/upload', auth, upload.single('image'), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const field = req.body.field || 'profileImage';
    if (!['profileImage', 'coverImage'].includes(field)) {
      return res.status(400).json({ message: 'Invalid field' });
    }

    const url = (req.file.path && req.file.path.startsWith('http'))
      ? req.file.path
      : `/uploads/${req.file.filename}`;
    shop[field] = url;
    await shop.save();

    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
