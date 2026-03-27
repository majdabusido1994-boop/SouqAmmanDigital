const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const seedVelvetSouq = async () => {
  await connectDB();

  try {
    // Create seller account for Velvet Souq
    let seller = await User.findOne({ email: 'velvetsouq@souqamman.com' });
    if (!seller) {
      seller = await User.create({
        name: 'Velvet Souq',
        email: 'velvetsouq@souqamman.com',
        password: 'velvetsouq123',
        role: 'seller',
        neighborhood: 'Abdoun',
      });
      console.log('Created seller account');
    }

    // Create the shop
    let shop = await Shop.findOne({ instagramHandle: 'velvetsouq' });
    if (!shop) {
      shop = await Shop.create({
        owner: seller._id,
        name: 'Velvet Souq',
        description: 'Curated vintage & pre-loved fashion. Unique finds from around the world, delivered to Amman.',
        instagramHandle: 'velvetsouq',
        category: 'fashion',
        neighborhood: 'Abdoun',
        isActive: true,
        isVerified: true,
        nextDropDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      });
      console.log('Created Velvet Souq shop');
    }

    // Create products
    const products = [
      {
        name: 'Vintage Pattern Pullover by Mountain Gear',
        description: 'Cozy vintage pullover with beautiful pattern work. Great condition, perfect for layering. A true retro find from Mountain Gear.',
        price: 15,
        category: 'fashion',
        sizes: ['M', 'L'],
        fitType: 'relaxed',
        isNewDrop: true,
        dropDate: new Date(),
        tags: ['vintage', 'pullover', 'retro', 'mountain-gear', 'winter'],
        neighborhood: 'Abdoun',
        isAvailable: true,
        acceptsOffers: true,
        acceptsCustomOrders: false,
      },
      {
        name: 'Cute Knit Top',
        description: 'Adorable knit top in excellent condition. Soft fabric, flattering fit. Perfect for casual outings or layering.',
        price: 10,
        category: 'fashion',
        sizes: ['S', 'M'],
        fitType: 'regular',
        isNewDrop: true,
        dropDate: new Date(),
        tags: ['knit', 'top', 'cute', 'casual', 'pre-loved'],
        neighborhood: 'Abdoun',
        isAvailable: true,
        acceptsOffers: true,
        acceptsCustomOrders: false,
      },
      {
        name: 'Helen Steele x Dunnes Teddy Fleece Jacket',
        description: 'Luxurious teddy fleece jacket from the Helen Steele x Dunnes collaboration. Super soft and warm, perfect for Amman winters. Like new condition.',
        price: 20,
        category: 'fashion',
        sizes: ['M', 'L', 'XL'],
        fitType: 'oversized',
        isNewDrop: true,
        dropDate: new Date(),
        tags: ['jacket', 'fleece', 'teddy', 'helen-steele', 'dunnes', 'winter', 'cozy'],
        neighborhood: 'Abdoun',
        isAvailable: true,
        acceptsOffers: true,
        acceptsCustomOrders: false,
      },
    ];

    for (const productData of products) {
      const exists = await Product.findOne({ name: productData.name, shop: shop._id });
      if (!exists) {
        await Product.create({
          ...productData,
          shop: shop._id,
          seller: seller._id,
        });
        console.log(`Created product: ${productData.name}`);
      }
    }

    console.log('\nVelvet Souq seed complete!');
    console.log(`Shop ID: ${shop._id}`);
    console.log(`Seller login: velvetsouq@souqamman.com / velvetsouq123`);
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedVelvetSouq();
