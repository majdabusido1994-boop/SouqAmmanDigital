const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: String,
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    maxlength: 2000,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  messageType: {
    type: String,
    enum: ['text', 'offer', 'custom-order'],
    default: 'text',
  },
  offerAmount: {
    type: Number,
    min: 0,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Generate a consistent conversation ID from two user IDs
messageSchema.statics.getConversationId = function (userId1, userId2) {
  return [userId1, userId2].sort().join('_');
};

module.exports = mongoose.model('Message', messageSchema);
