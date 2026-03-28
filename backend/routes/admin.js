const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Message = require('../models/Message');
const { cloudinary } = require('../config/cloudinary');

// All routes require auth + admin
router.use(auth, adminOnly);

// ============ DASHBOARD STATS ============
router.get('/stats', async (req, res) => {
  try {
    const [users, shops, products, messages] = await Promise.all([
      User.countDocuments(),
      Shop.countDocuments(),
      Product.countDocuments(),
      Message.countDocuments(),
    ]);
    res.json({ users, shops, products, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ USERS ============
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const shop = await Shop.findOne({ owner: user._id });
    const products = await Product.find({ seller: user._id });
    res.json({ user, shop, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, phone, neighborhood } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, phone, neighborhood },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete superadmin' });
    }
    // Delete user's shop, products, and messages
    const shop = await Shop.findOne({ owner: user._id });
    if (shop) {
      await Product.deleteMany({ shop: shop._id });
      await Shop.deleteOne({ _id: shop._id });
    }
    await Message.deleteMany({ $or: [{ sender: user._id }, { receiver: user._id }] });
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ SHOPS ============
router.get('/shops', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const shops = await Shop.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Shop.countDocuments(query);
    res.json({ shops, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/shops/:id', async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/shops/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    await Product.deleteMany({ shop: shop._id });
    await Shop.deleteOne({ _id: shop._id });
    res.json({ message: 'Shop and all products deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/shops/:id/verify', async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.isVerified },
      { new: true }
    );
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/shops/:id/toggle-active', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    shop.isActive = !shop.isActive;
    await shop.save();
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ PRODUCTS ============
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const products = await Product.find(query)
      .populate('shop', 'name')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Product.countDocuments(query);
    res.json({ products, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Delete images from Cloudinary
    for (const imageUrl of product.images) {
      try {
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        // Continue even if image delete fails
      }
    }
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/products/:id/toggle-available', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.isAvailable = !product.isAvailable;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ MESSAGES ============
router.get('/messages', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find()
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Message.countDocuments();
    res.json({ messages, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
