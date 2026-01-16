const express = require('express');
const app = express();

// Simple middleware to log requests
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Simple API is running.' });
});

// API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API test route works!' });
});

// Start server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Simple server is running on port ${PORT}.`);
});