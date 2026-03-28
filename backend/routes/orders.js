const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders - Get user's orders (buyer sees their orders, seller sees received orders)
router.get('/', auth, async (req, res) => {
  try {
    const { role } = req.query; // 'buyer' or 'seller'
    const query = role === 'seller'
      ? { seller: req.user._id }
      : { buyer: req.user._id };

    const orders = await Order.find(query)
      .populate('buyer', 'name avatar phone')
      .populate('seller', 'name avatar phone')
      .populate('shop', 'name profileImage')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name avatar phone')
      .populate('seller', 'name avatar phone')
      .populate('shop', 'name profileImage')
      .populate('items.product', 'name images price');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only buyer or seller can view
    if (order.buyer._id.toString() !== req.user._id.toString() &&
        order.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders - Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shopId, paymentMethod, deliveryMethod, deliveryAddress, buyerPhone, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Fetch products and calculate total
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res.status(400).json({ message: 'Some products not found' });
    }

    // Ensure all products belong to the same seller
    const sellerIds = [...new Set(products.map((p) => p.seller.toString()))];
    if (sellerIds.length > 1) {
      return res.status(400).json({ message: 'All items in an order must be from the same seller' });
    }

    // Prevent ordering your own products
    if (sellerIds[0] === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot order your own products' });
    }

    const orderItems = products.map((p) => {
      const item = items.find((i) => i.productId === p._id.toString());
      return {
        product: p._id,
        name: p.name,
        price: p.price,
        quantity: item.quantity || 1,
        image: p.images?.[0] || '',
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      buyer: req.user._id,
      seller: products[0].seller,
      shop: shopId || products[0].shop,
      items: orderItems,
      total,
      paymentMethod: paymentMethod || 'cash',
      deliveryMethod: deliveryMethod || 'pickup',
      deliveryAddress,
      buyerPhone,
      notes,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    // Emit socket event to seller
    const io = req.app.get('io');
    if (io) {
      io.to(products[0].seller.toString()).emit('newOrder', {
        orderId: order._id,
        buyerName: req.user.name,
      });
    }

    const populated = await order.populate([
      { path: 'buyer', select: 'name avatar phone' },
      { path: 'shop', select: 'name profileImage' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status (seller only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isSeller = order.seller.toString() === req.user._id.toString();
    const isBuyer = order.buyer.toString() === req.user._id.toString();

    if (!isSeller && !isBuyer) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status, note } = req.body;

    // Buyers can only cancel pending orders
    if (isBuyer && (status !== 'cancelled' || order.status !== 'pending')) {
      return res.status(403).json({ message: 'You can only cancel pending orders' });
    }
    const validStatuses = ['confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Prevent updating already delivered or cancelled orders
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot update a completed or cancelled order' });
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || '' });
    await order.save();

    // Notify buyer via socket
    const io = req.app.get('io');
    if (io) {
      io.to(order.buyer.toString()).emit('orderUpdate', {
        orderId: order._id,
        status,
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
