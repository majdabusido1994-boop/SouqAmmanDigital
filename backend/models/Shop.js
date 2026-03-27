const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Shop description is required'],
    maxlength: 1000,
  },
  instagramHandle: {
    type: String,
    default: '',
    trim: true,
  },
  whatsappNumber: {
    type: String,
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: [
      'fashion',
      'accessories',
      'home-decor',
      'food',
      'art',
      'handmade',
      'electronics',
      'beauty',
      'services',
      'other',
    ],
    default: 'other',
  },
  neighborhood: {
    type: String,
    default: 'Amman',
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },

  // Fashion-specific
  nextDropDate: Date,

  // Food-specific
  deliveryInfo: {
    delivery: { type: Boolean, default: false },
    pickup: { type: Boolean, default: true },
    deliveryFee: Number,
    minimumOrder: Number,
  },
  operatingHours: {
    open: String,
    close: String,
    daysOff: [String],
  },

  // Handcraft-specific
  artisanStory: {
    type: String,
    maxlength: 2000,
  },
  isEco: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

shopSchema.virtual('followerCount').get(function () {
  return this.followers.length;
});

shopSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Shop', shopSchema);
