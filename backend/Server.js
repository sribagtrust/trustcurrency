// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import your models
const User = require('./models/User');
const Plan = require('./models/Plan');
const Transaction = require('./models/Transaction');
const Store = require('./models/Store');

// Import your routes
const authRoutes = require('./routes/auth'); // <-- ADD THIS LINE
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transaction');
const adminRoutes = require('./routes/admin');
const app = express();

// CORS Configuration for production and development
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://trustcurrency.com'||'https://www.trustcurrency.com'||'https://d1o6n27q1nzv65.cloudfront.net', // Production frontend URL
  'http://localhost:5173', // Local development
  'http://localhost:3000', // Alternative local dev port
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // This makes the images public to the Admin

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to the Trust Database'))
  .catch((err) => console.error('Database connection error:', err));

// Route Middlewares
app.use('/api/auth', authRoutes); // <-- ADD THIS LINE
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

// A simple test route
app.get('/', (req, res) => {
  res.send('TrustCoin API is running!');
});

// Start the server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});