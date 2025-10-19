// server/server.js
console.log('DBG: starting server.js');

require('dotenv').config();
console.log('DBG: dotenv loaded');

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const tasksRouter = require('./routes/tasks'); // ✅ important

console.log('DBG: about to connect to DB');
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ✅ mount tasks router
app.use('/api/tasks', tasksRouter);

app.use((err, req, res, next) => {
  console.error('Error middleware caught:', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Express server listening on port ${PORT}`);
});
