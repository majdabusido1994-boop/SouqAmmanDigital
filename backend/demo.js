/**
 * SOUQ AMMAN DIGITAL - Demo Server
 * Runs with in-memory MongoDB (no external DB needed)
 * Auto-seeds with demo data including Velvet Souq
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');

async function startDemo() {
  console.log('\n  Starting SOUQ AMMAN DIGITAL Demo...\n');

  // Start in-memory MongoDB (store binary on D: to avoid C: space issues)
  console.log('  Starting in-memory MongoDB...');
  process.env.MONGOMS_DOWNLOAD_DIR = path.join('D:', 'mongodb-binaries');
  process.env.MONGOMS_SYSTEM_BINARY = '';
  const mongod = await MongoMemoryServer.create({
    instance: { dbPath: path.join('D:', 'mongodb-data') },
    binary: { downloadDir: path.join('D:', 'mongodb-binaries') },
  });
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'souq-amman-demo-secret-2024';
  process.env.PORT = '5000';

  console.log(`  MongoDB ready at ${uri}`);

  // Connect & start server
  const mongoose = require('mongoose');
  await mongoose.connect(uri);
  console.log('  MongoDB connected!\n');

  // Seed demo data
  await seedDemoData();

  // Start Express
  const express = require('express');
  const cors = require('cors');
  const http = require('http');
  const { Server } = require('socket.io');

  const app = express();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  app.set('io', io);
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/shops', require('./routes/shops'));
  app.use('/api/products', require('./routes/products'));
  app.use('/api/messages', require('./routes/messages'));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SOUQ AMMAN DIGITAL Demo API' });
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => socket.join(userId));
    socket.on('typing', ({ to }) => io.to(to).emit('typing', { from: socket.id }));
  });

  const PORT = 5000;
  server.listen(PORT, () => {
    console.log('  ============================================');
    console.log('  SOUQ AMMAN DIGITAL Demo is running!');
    console.log(`  API:  http://localhost:${PORT}/api/health`);
    console.log('  ============================================');
    console.log('\n  Demo Accounts:');
    console.log('  Seller: velvetsouq@demo.com / demo123');
    console.log('  Seller: ammanfood@demo.com / demo123');
    console.log('  Seller: craftamman@demo.com / demo123');
    console.log('  Buyer:  buyer@demo.com / demo123');
    console.log('\n  Now start the mobile app:');
    console.log('  cd "../mobile" && npx expo start\n');
  });

  // Cleanup on exit
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    await mongod.stop();
    process.exit(0);
  });
}

async function seedDemoData() {
  const mongoose = require('mongoose');
  const User = require('./models/User');
  const Shop = require('./models/Shop');
  const Product = require('./models/Product');

  console.log('  Seeding demo data...\n');

  // Drop existing data for clean start
  await mongoose.connection.db.dropDatabase();

  // === SELLERS ===
  const velvetSeller = await User.create({
    name: 'Velvet Souq',
    email: 'velvetsouq@demo.com',
    password: 'demo123',
    role: 'seller',
    neighborhood: 'Abdoun',
  });

  const foodSeller = await User.create({
    name: 'Amman Bites',
    email: 'ammanfood@demo.com',
    password: 'demo123',
    role: 'seller',
    neighborhood: 'Rainbow Street',
  });

  const craftSeller = await User.create({
    name: 'Handmade Amman',
    email: 'craftamman@demo.com',
    password: 'demo123',
    role: 'seller',
    neighborhood: 'Jabal Amman',
  });

  const buyer = await User.create({
    name: 'Demo Buyer',
    email: 'buyer@demo.com',
    password: 'demo123',
    role: 'buyer',
    neighborhood: 'Sweifieh',
  });

  // === FASHION SHOP: Velvet Souq ===
  const velvetShop = await Shop.create({
    owner: velvetSeller._id,
    name: 'Velvet Souq',
    description: 'Curated vintage & pre-loved fashion. Unique finds from around the world, delivered to Amman.',
    instagramHandle: 'velvetsouq',
    whatsappNumber: '+962791234567',
    category: 'fashion',
    neighborhood: 'Abdoun',
    isActive: true,
    isVerified: true,
    nextDropDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    followers: [buyer._id],
  });

  const fashionProducts = [
    {
      name: 'Vintage Pattern Pullover by Mountain Gear',
      description: 'Cozy vintage pullover with beautiful pattern work. Great condition, perfect for layering. A true retro find.',
      price: 15, category: 'fashion', sizes: ['M', 'L'], fitType: 'relaxed',
      isNewDrop: true, dropDate: new Date(),
      tags: ['vintage', 'pullover', 'retro', 'winter'],
      neighborhood: 'Abdoun',
      modelInfo: { size: 'M', height: '170cm' },
    },
    {
      name: 'Cute Knit Top',
      description: 'Adorable knit top in excellent condition. Soft fabric, flattering fit. Perfect for casual outings.',
      price: 10, category: 'fashion', sizes: ['S', 'M'], fitType: 'regular',
      isNewDrop: true, dropDate: new Date(),
      tags: ['knit', 'top', 'casual', 'pre-loved'],
      neighborhood: 'Abdoun',
    },
    {
      name: 'Helen Steele x Dunnes Teddy Fleece Jacket',
      description: 'Luxurious teddy fleece jacket. Super soft and warm, perfect for Amman winters. Like new condition.',
      price: 20, category: 'fashion', sizes: ['M', 'L', 'XL'], fitType: 'oversized',
      isNewDrop: true, dropDate: new Date(),
      tags: ['jacket', 'fleece', 'teddy', 'winter', 'cozy'],
      neighborhood: 'Abdoun',
    },
    {
      name: 'Vintage Denim Jacket',
      description: 'Classic oversized vintage denim jacket with distressed wash. Timeless piece for any wardrobe.',
      price: 25, category: 'fashion', sizes: ['M', 'L'], fitType: 'oversized',
      tags: ['denim', 'jacket', 'vintage', 'classic'],
      neighborhood: 'Abdoun',
    },
    {
      name: 'Silk Floral Blouse',
      description: 'Beautiful floral print silk blouse. Elegant for work or weekends. Pre-loved in excellent condition.',
      price: 18, category: 'fashion', sizes: ['S', 'M', 'L'], fitType: 'regular',
      tags: ['silk', 'blouse', 'floral', 'elegant'],
      neighborhood: 'Abdoun',
    },
  ];

  for (const p of fashionProducts) {
    await Product.create({ ...p, shop: velvetShop._id, seller: velvetSeller._id, acceptsOffers: true });
  }
  console.log('  Created: Velvet Souq (Fashion) - 5 products');

  // === FOOD SHOP: Amman Bites ===
  const foodShop = await Shop.create({
    owner: foodSeller._id,
    name: 'Amman Bites',
    description: 'Authentic Jordanian home cooking. Fresh meals prepared daily with love from our kitchen to your table.',
    instagramHandle: 'ammanbites',
    whatsappNumber: '+962797654321',
    category: 'food',
    neighborhood: 'Rainbow Street',
    isActive: true,
    isVerified: true,
    followers: [buyer._id, velvetSeller._id],
    deliveryInfo: { delivery: true, pickup: true, deliveryFee: 2, minimumOrder: 5 },
    operatingHours: { open: '10:00', close: '22:00', daysOff: ['Friday'] },
  });

  const foodProducts = [
    {
      name: 'Mansaf Plate',
      description: 'Traditional Jordanian Mansaf with tender lamb, fermented dried yogurt (jameed), and aromatic rice. Serves 1-2.',
      price: 8, category: 'food', menuCategory: 'Main Dishes',
      prepTime: '25 min', servingSize: '1-2 persons', calories: '850 kcal',
      ingredients: 'Lamb, jameed yogurt, rice, almonds, pine nuts, parsley',
      dietaryTags: ['halal'],
      isTodaySpecial: true, availableUntil: '21:00',
      tags: ['mansaf', 'traditional', 'jordanian', 'lamb'],
      neighborhood: 'Rainbow Street',
    },
    {
      name: 'Falafel Wrap',
      description: 'Crispy homemade falafel wrapped in fresh taboon bread with tahini, pickles, and fresh vegetables.',
      price: 2.5, category: 'food', menuCategory: 'Wraps',
      prepTime: '10 min', servingSize: '1 person', calories: '450 kcal',
      dietaryTags: ['vegan', 'halal'],
      tags: ['falafel', 'wrap', 'vegan', 'street-food'],
      neighborhood: 'Rainbow Street',
    },
    {
      name: 'Kunafa',
      description: 'Golden crispy kunafa filled with sweet Nabulsi cheese, soaked in rose-scented sugar syrup. The perfect dessert.',
      price: 4, category: 'food', menuCategory: 'Desserts',
      prepTime: '15 min', servingSize: '2 persons', calories: '600 kcal',
      dietaryTags: ['vegetarian', 'halal'],
      tags: ['kunafa', 'dessert', 'cheese', 'sweet'],
      neighborhood: 'Rainbow Street',
    },
    {
      name: 'Fresh Mint Lemonade',
      description: 'Freshly squeezed lemonade with crushed mint leaves and a hint of rose water. Refreshing and cold.',
      price: 1.5, category: 'food', menuCategory: 'Drinks',
      prepTime: '5 min', servingSize: '1 glass', calories: '120 kcal',
      dietaryTags: ['vegan', 'halal'],
      tags: ['lemonade', 'mint', 'drink', 'fresh'],
      neighborhood: 'Rainbow Street',
    },
    {
      name: 'Hummus & Bread Platter',
      description: 'Creamy hummus topped with olive oil, paprika, and whole chickpeas. Served with warm taboon bread.',
      price: 3, category: 'food', menuCategory: 'Appetizers',
      prepTime: '5 min', servingSize: '2-3 persons', calories: '350 kcal',
      dietaryTags: ['vegan', 'halal'],
      tags: ['hummus', 'appetizer', 'mezze'],
      neighborhood: 'Rainbow Street',
    },
  ];

  for (const p of foodProducts) {
    await Product.create({ ...p, shop: foodShop._id, seller: foodSeller._id, acceptsOffers: false });
  }
  console.log('  Created: Amman Bites (Food) - 5 products');

  // === HANDCRAFT SHOP: Handmade Amman ===
  const craftShop = await Shop.create({
    owner: craftSeller._id,
    name: 'Handmade Amman',
    description: 'Artisan crafts celebrating Jordanian heritage. Every piece tells a story of tradition and love.',
    instagramHandle: 'handmadeamman',
    whatsappNumber: '+962799876543',
    category: 'handmade',
    neighborhood: 'Jabal Amman',
    isActive: true,
    isVerified: true,
    followers: [buyer._id],
    artisanStory: 'We are a family of artisans from Jabal Amman, carrying on three generations of traditional craftsmanship. Our hands shape clay, weave threads, and carve wood the way our grandparents taught us.',
    isEco: true,
  });

  const craftProducts = [
    {
      name: 'Hand-Painted Ceramic Bowl',
      description: 'Beautiful hand-painted ceramic bowl featuring traditional Jordanian geometric patterns in blue and white.',
      price: 12, category: 'handmade',
      materials: ['Ceramic', 'Natural pigments'],
      story: 'Each bowl is shaped on a pottery wheel by our master potter Khaled, then hand-painted by his daughter Rania with patterns passed down through generations.',
      process: 'Wheel-thrown, air-dried for 48 hours, painted by hand, kiln-fired at 1200°C',
      dimensions: '18cm diameter x 8cm height',
      isHandmade: true, isLocal: true, isEco: true,
      acceptsCustomOrders: true,
      tags: ['ceramic', 'bowl', 'hand-painted', 'traditional'],
      neighborhood: 'Jabal Amman',
    },
    {
      name: 'Olive Wood Cutting Board',
      description: 'Sustainably sourced olive wood cutting board with natural grain patterns. Each piece is unique.',
      price: 22, category: 'handmade',
      materials: ['Olive wood', 'Food-safe oil'],
      story: 'Carved from pruned olive trees in the Jordan Valley. No trees are cut down — we only use wood from seasonal pruning.',
      process: 'Hand-carved, sanded through 5 grits, finished with food-safe olive oil',
      dimensions: '35cm x 22cm x 2cm',
      isHandmade: true, isLocal: true, isEco: true,
      tags: ['olive-wood', 'kitchen', 'cutting-board', 'sustainable'],
      neighborhood: 'Jabal Amman',
    },
    {
      name: 'Woven Wall Hanging',
      description: 'Handwoven wall tapestry with desert-inspired colors and Bedouin patterns. Made with locally sourced wool.',
      price: 35, category: 'handmade',
      materials: ['Wool', 'Cotton thread', 'Wooden dowel'],
      story: 'Inspired by Bedouin weaving traditions. Our weaver Um Ahmad learned the craft from her mother in Wadi Rum.',
      process: 'Hand-dyed wool, woven on a traditional loom over 3 days',
      dimensions: '60cm x 90cm',
      isHandmade: true, isLocal: true, isEco: true,
      acceptsCustomOrders: true,
      tags: ['woven', 'wall-art', 'bedouin', 'wool', 'tapestry'],
      neighborhood: 'Jabal Amman',
    },
    {
      name: 'Dead Sea Salt Candle',
      description: 'Soy wax candle infused with Dead Sea minerals and scented with Jordanian jasmine. Burns for 40+ hours.',
      price: 9, category: 'handmade',
      materials: ['Soy wax', 'Dead Sea salt', 'Jasmine essential oil', 'Cotton wick'],
      story: 'We combine the healing minerals of the Dead Sea with the intoxicating scent of Jordanian jasmine fields.',
      process: 'Hand-poured in small batches, cured for 2 weeks',
      dimensions: '8cm x 10cm',
      isHandmade: true, isLocal: true, isEco: true,
      tags: ['candle', 'dead-sea', 'jasmine', 'aromatherapy'],
      neighborhood: 'Jabal Amman',
    },
  ];

  for (const p of craftProducts) {
    await Product.create({ ...p, shop: craftShop._id, seller: craftSeller._id, acceptsOffers: true });
  }
  console.log('  Created: Handmade Amman (Handcraft) - 4 products');

  // Add some likes
  const allProducts = await Product.find();
  for (const p of allProducts.slice(0, 5)) {
    p.likes.push(buyer._id);
    await p.save();
  }

  console.log(`\n  Total: 3 shops, ${allProducts.length} products, 4 users\n`);
}

startDemo().catch((err) => {
  console.error('Demo startup failed:', err);
  process.exit(1);
});
