const serverless = require('serverless-http');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('../../config/db');

const User = require('../../models/User');

// Connect to MongoDB
let dbConnected = false;
const ensureDB = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;

    // Seed admin on first connection
    try {
      let admin = await User.findOne({ email: 'abusido94@souqamman.com' });
      if (admin) {
        admin.role = 'superadmin';
        admin.password = 'majd94';
        await admin.save();
      } else {
        await User.create({
          name: 'abusido94',
          email: 'abusido94@souqamman.com',
          password: 'majd94',
          role: 'superadmin',
        });
      }
    } catch (error) {
      console.log('Admin seed check:', error.message);
    }
  }
};

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts, please try again later.' },
});

app.use('/.netlify/functions/api/', limiter);
app.use('/.netlify/functions/api/auth/login', authLimiter);
app.use('/.netlify/functions/api/auth/register', authLimiter);

// CORS & JSON
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.set('trust proxy', 1);

// DB middleware
app.use(async (req, res, next) => {
  await ensureDB();
  next();
});

// Routes (mounted under /.netlify/functions/api)
const router = express.Router();
router.use('/auth', require('../../routes/auth'));
router.use('/shops', require('../../routes/shops'));
router.use('/products', require('../../routes/products'));
router.use('/messages', require('../../routes/messages'));
router.use('/reviews', require('../../routes/reviews'));
router.use('/orders', require('../../routes/orders'));
router.use('/admin', require('../../routes/admin'));

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SOUQ AMMAN DIGITAL API is running on Netlify' });
});

app.use('/.netlify/functions/api', router);

// Error handler
const multer = require('multer');
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 20MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  console.error('Server error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

module.exports.handler = serverless(app);
