const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: 2000,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  currency: {
    type: String,
    default: 'JOD',
  },
  images: [{
    type: String,
  }],
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
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  neighborhood: {
    type: String,
    default: 'Amman',
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isAvailable: {
    type: Boolean,
    default: true,
  },
  acceptsOffers: {
    type: Boolean,
    default: true,
  },
  acceptsCustomOrders: {
    type: Boolean,
    default: false,
  },

  // === FASHION-SPECIFIC ===
  sizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'],
  }],
  fitType: {
    type: String,
    enum: ['slim', 'regular', 'relaxed', 'oversized'],
  },
  modelInfo: {
    size: String,
    height: String,
    measurements: String,
  },
  isNewDrop: {
    type: Boolean,
    default: false,
  },
  dropDate: Date,
  styleWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],

  // === FOOD-SPECIFIC ===
  menuCategory: {
    type: String,
    trim: true,
  },
  prepTime: String,
  servingSize: String,
  calories: String,
  ingredients: String,
  dietaryTags: [{
    type: String,
    enum: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'halal', 'organic', 'sugar-free'],
  }],
  isTodaySpecial: {
    type: Boolean,
    default: false,
  },
  availableUntil: String,

  // === HANDCRAFT-SPECIFIC ===
  materials: [{
    type: String,
    trim: true,
  }],
  story: {
    type: String,
    maxlength: 2000,
  },
  process: {
    type: String,
    maxlength: 2000,
  },
  dimensions: String,
  isHandmade: {
    type: Boolean,
    default: true,
  },
  isLocal: {
    type: Boolean,
    default: true,
  },
  isEco: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

productSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

productSchema.set('toJSON', { virtuals: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
