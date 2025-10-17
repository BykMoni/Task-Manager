// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const tasksRouter = require('./routes/tasks');

// connect to DB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// routes
app.use('/api/tasks', tasksRouter);

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
