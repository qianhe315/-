const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Media = require('../models/Media');
require('dotenv').config();

// Configure file uploads
const uploadPath = path.join(__dirname, '..', process.env.UPLOAD_PATH);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
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
    const allowedTypes = /jpeg|jpg|png|gif|svg|pdf|doc|docx|xls|xlsx|mp4|mp3/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Invalid file type!');
    }
  }
});

// Get all media
router.get('/', async (req, res) => {
  try {
    const media = await Media.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single media
router.get('/:id', async (req, res) => {
  try {
    const media = await Media.findByPk(req.params.id);
    if (media) {
      res.json(media);
    } else {
      res.status(404).json({ message: 'Media not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload media file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const media = await Media.create({
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      size: req.file.size,
      description: req.body.description || ''
    });

    res.status(201).json(media);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create media (without file upload)
router.post('/', async (req, res) => {
  try {
    const media = await Media.create(req.body);
    res.status(201).json(media);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update media
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Media.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedMedia = await Media.findByPk(req.params.id);
      res.json(updatedMedia);
    } else {
      res.status(404).json({ message: 'Media not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete media
router.delete('/:id', async (req, res) => {
  try {
    const media = await Media.findByPk(req.params.id);
    if (media) {
      // Delete file from server
      const filePath = path.join(uploadPath, media.filePath.split('/').pop());
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      // Delete from database
      await media.destroy();
      res.json({ message: 'Media deleted' });
    } else {
      res.status(404).json({ message: 'Media not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
