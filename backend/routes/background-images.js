// routes/background-images.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Multer config ─────────────────────────────────────────────────────────────
const { handleSingleUpload } = require('../utils/fileUpload');

// GET /api/background-images — get all images
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM background_images ORDER BY created_at DESC`
    );
    res.json({ images: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/background-images/active — get active image for ID card
router.get('/active', async (req, res) => {
  try {
    const { category } = req.query;
    let result;

    if (category) {
      // Get active image for specific category
      result = await pool.query(
        `SELECT * FROM background_images 
         WHERE is_active = true AND LOWER(category) = LOWER($1) LIMIT 1`,
        [category]
      );
      // Fallback to any image in that category
      if (result.rows.length === 0) {
        result = await pool.query(
          `SELECT * FROM background_images 
           WHERE LOWER(category) = LOWER($1) 
           ORDER BY created_at DESC LIMIT 1`,
          [category]
        );
      }
    } else {
      // No category — get global active
      result = await pool.query(
        `SELECT * FROM background_images WHERE is_active = true LIMIT 1`
      );
      if (result.rows.length === 0) {
        result = await pool.query(
          `SELECT * FROM background_images ORDER BY created_at DESC LIMIT 1`
        );
      }
    }

    res.json({ image: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/background-images — upload new image
router.post('/', handleSingleUpload('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image file is required' });
    const { name, category } = req.body;
    const image_url = `/uploads/background-images/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO background_images (name, category, image_url)
       VALUES ($1, $2, $3) RETURNING *`,
      [name || req.file.originalname, category || 'General', image_url]
    );
    res.status(201).json({ image: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/background-images/:id/set-active — set as active background
router.patch('/:id/set-active', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the category of the selected image
    const imgResult = await pool.query(
      `SELECT category FROM background_images WHERE id = $1`,
      [id]
    );
    if (imgResult.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    const category = imgResult.rows[0].category;

    // Deactivate only images in the SAME category
    await pool.query(
      `UPDATE background_images SET is_active = false WHERE category = $1`,
      [category]
    );

    // Activate selected image
    await pool.query(
      `UPDATE background_images SET is_active = true WHERE id = $1`,
      [id]
    );

    res.json({ message: `Background image set as active for ${category}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/background-images/:id — delete image
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Get file path before deleting
    const result = await pool.query(
      `SELECT image_url FROM background_images WHERE id = $1`,
      [id]
    );
    if (result.rows.length > 0) {
      const filePath = path.join(__dirname, '..', result.rows[0].image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await pool.query(`UPDATE background_images SET is_deleted = true, deleted_at = NOW() WHERE id = $1`, [id]);
    res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
