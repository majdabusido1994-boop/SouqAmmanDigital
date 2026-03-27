const express = require('express');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/conversations - Get user's conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversation',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$isRead', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    // Populate sender/receiver info
    const populated = await Message.populate(messages, [
      { path: 'lastMessage.sender', select: 'name avatar', model: 'User' },
      { path: 'lastMessage.receiver', select: 'name avatar', model: 'User' },
      { path: 'lastMessage.product', select: 'name images price', model: 'Product' },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/messages/:userId - Get messages with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const conversationId = Message.getConversationId(req.user._id, req.params.userId);

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('product', 'name images price')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { conversation: conversationId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/messages/:userId - Send message
router.post('/:userId', auth, async (req, res) => {
  try {
    const { text, productId, messageType, offerAmount } = req.body;
    const conversationId = Message.getConversationId(req.user._id, req.params.userId);

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      receiver: req.params.userId,
      text,
      product: productId,
      messageType: messageType || 'text',
      offerAmount,
    });

    const populated = await message.populate([
      { path: 'sender', select: 'name avatar' },
      { path: 'receiver', select: 'name avatar' },
      { path: 'product', select: 'name images price' },
    ]);

    // Emit via socket if available
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.userId).emit('newMessage', populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
