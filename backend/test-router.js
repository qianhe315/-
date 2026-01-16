const express = require('express');
const app = express();

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

// Test route with router
const testRouter = express.Router();
testRouter.get('/', (req, res) => {
  res.json({ message: 'Test router works!' });
});

app.use('/api/test-router', testRouter);

// Start server
app.listen(3002, () => {
  console.log('Test server running on port 3002!');
});