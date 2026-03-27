require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/products', require('./routes/products'));
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SOUQ AMMAN DIGITAL API is running' });
});

// Multer error handler
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

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('typing', ({ to }) => {
    io.to(to).emit('typing', { from: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SOUQ AMMAN DIGITAL server running on port ${PORT}`);
});
