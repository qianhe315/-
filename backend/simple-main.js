const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Simple CORS configuration (allow all origins for testing)
app.use(cors({
  origin: '*',
  credentials: true,
}));

// Parse JSON requests
app.use(express.json());

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Simple middleware to log requests
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Simplified main API is running.' });
});

// API routes
app.get('/api/direct-test', (req, res) => {
  res.json({ message: 'Direct test route works!' });
});

// Import and use carousel routes
const carouselRoutes = require('./routes/carouselRoutes');
app.use('/api/carousels', carouselRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Simplified main server is running on port ${PORT}.`);
});