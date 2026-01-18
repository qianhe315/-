const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Configure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../', process.env.UPLOAD_PATH);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images only!'));
    }
  }
});

// Get all carousel items
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    let query = `SELECT * FROM carousels`;
    const queryParams = [];
    
    if (active) {
      query += ` WHERE is_active = ?`;
      queryParams.push(active === 'true' || active === true);
    }
    
    query += ` ORDER BY sort_order ASC, created_at DESC`;
    
    const [rows] = await pool.execute(query, queryParams);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching carousel items:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single carousel item
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM carousels WHERE id = ?`,
      [req.params.id]
    );
    
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Carousel item not found' });
    }
  } catch (error) {
    console.error('Error fetching carousel item:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create carousel item
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, buttonText, buttonLink, sortOrder, isActive, existing_image } = req.body;
    let image = req.file ? `/uploads/${req.file.filename}` : null;
    
    // If no file is uploaded, check if existing_image is provided
    if (!image && existing_image) {
      image = existing_image;
    }
    
    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO carousels (title, description, image_url, button_text, button_link, sort_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, image, buttonText, buttonLink, sortOrder || 0, isActive === 'true' || isActive === true]
    );
    
    const [newItem] = await pool.execute(
      `SELECT * FROM carousels WHERE id = ?`,
      [result.insertId]
    );
    
    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error('Error creating carousel item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update carousel item
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, buttonText, buttonLink, sortOrder, isActive, existing_image } = req.body;
    
    // Check if carousel item exists
    const [existingItems] = await pool.execute(
      `SELECT * FROM carousels WHERE id = ?`,
      [id]
    );
    
    if (existingItems.length === 0) {
      return res.status(404).json({ message: 'Carousel item not found' });
    }
    
    // Get existing image if no new image is uploaded
    const currentImage = existingItems[0].image_url;
    let image = req.file ? `/uploads/${req.file.filename}` : null;
    
    // If no file is uploaded, check if existing_image is provided, otherwise use current image
    if (!image) {
      image = existing_image || currentImage;
    }
    
    // Update carousel item
    await pool.execute(
      `UPDATE carousels 
       SET title = ?, description = ?, image_url = ?, button_text = ?, button_link = ?, sort_order = ?, is_active = ? 
       WHERE id = ?`,
      [title, description, image, buttonText, buttonLink, sortOrder || 0, isActive === 'true' || isActive === true, id]
    );
    
    // Get updated item
    const [updatedItems] = await pool.execute(
      `SELECT * FROM carousels WHERE id = ?`,
      [id]
    );
    
    res.json(updatedItems[0]);
  } catch (error) {
    console.error('Error updating carousel item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Add a special route for testing without file upload
router.post('/test', async (req, res) => {
  try {
    const { title, description, image, buttonText, buttonLink, sortOrder, isActive } = req.body;
    
    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO carousels (title, description, image_url, button_text, button_link, sort_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, image, buttonText, buttonLink, sortOrder || 0, isActive === 'true' || isActive === true]
    );
    
    const [newItem] = await pool.execute(
      `SELECT * FROM carousels WHERE id = ?`,
      [result.insertId]
    );
    
    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error('Error creating carousel item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete carousel item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if carousel item exists
    const [existingItems] = await pool.execute(
      `SELECT * FROM carousels WHERE id = ?`,
      [id]
    );
    
    if (existingItems.length === 0) {
      return res.status(404).json({ message: 'Carousel item not found' });
    }
    
    // Delete carousel item
    await pool.execute(
      `DELETE FROM carousels WHERE id = ?`,
      [id]
    );
    
    res.json({ message: 'Carousel item deleted' });
  } catch (error) {
    console.error('Error deleting carousel item:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;