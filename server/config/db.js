// server/config/db.js (CommonJS + debug preview)
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const preview = uri ? (uri.length > 60 ? uri.slice(0, 40) + '...' : uri) : 'none';
  console.log('DEBUG: process.env.MONGODB_URI preview ->', preview);

  if (!uri) {
    console.error('? No MONGODB_URI found in environment. Please create server/.env or set the env var.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('? MongoDB connected');
  } catch (err) {
    console.error('? MongoDB connection error:', err && err.message ? err.message : err);
    process.exit(1);
  }
};

module.exports = connectDB;
