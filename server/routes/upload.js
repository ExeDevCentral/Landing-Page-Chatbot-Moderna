'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${timestamp}-${sanitizedOriginal}`);
  }
});

// File filter for images and PDFs by default
const fileFilter = (req, file, cb) => {
  const allowedMime = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ];
  if (allowedMime.includes(file.mimetype)) {
    return cb(null, true);
  }
  const error = new Error('Invalid file type');
  error.status = 400;
  cb(error);
};

// Limits: 10 MB per file, max 5 files
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }
});

// Single file example: field name 'file'
router.post('/single', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const relativePath = path.join('uploads', path.basename(req.file.path));
  res.status(201).json({
    message: 'File uploaded successfully',
    file: {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      filename: path.basename(req.file.path),
      url: `/uploads/${path.basename(req.file.path)}`,
      path: relativePath
    }
  });
});

// Multiple files example: field name 'files'
router.post('/multiple', upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const files = req.files.map(f => ({
    originalName: f.originalname,
    mimeType: f.mimetype,
    size: f.size,
    filename: path.basename(f.path),
    url: `/uploads/${path.basename(f.path)}`
  }));
  res.status(201).json({ message: 'Files uploaded successfully', files });
});

// Error handler for Multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'Upload error', message: err.message });
  }
  if (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: 'Upload error', message: err.message });
  }
  next();
});

module.exports = router;


