const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'superadmin'],
    default: 'buyer',
  },
  avatar: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  neighborhood: {
    type: String,
    default: '',
  },
  savedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  followingShops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
  }],
  pushToken: {
    type: String,
    default: '',
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
