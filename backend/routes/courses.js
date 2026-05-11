// routes/courses.js
const express = require("express");
const router  = express.Router();
const pool    = require("../config/db");
const { authMiddleware } = require('../middleware/authMiddleware');

// GET /api/courses — all courses
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let query  = `SELECT id, title, slug, category, duration, eligibility,
                         certification, delivery_method, is_active,
                         thumbnail_url, gallery
                  FROM courses ORDER BY category, title`;
    let params = [];
    if (category) {
      query  = `SELECT id, title, slug, category, duration, eligibility,
                       certification, delivery_method, is_active,
                       thumbnail_url, gallery
                FROM courses WHERE LOWER(category) = LOWER($1) ORDER BY title`;
      params = [category];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/courses error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/courses/all — fetch all courses with trainer_id
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, trainer_id FROM courses ORDER BY title`
    );
    res.json({ courses: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// PUT /api/courses/:id/assign-trainer
router.put('/:id/assign-trainer', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { trainer_id } = req.body;
  try {
    await pool.query(
      `UPDATE courses SET trainer_id = $1 WHERE id = $2`,
      [trainer_id, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign trainer' });
  }
});

// GET /api/courses/slug/:slug — MUST be before /:id
router.get("/slug/:slug", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM courses WHERE slug = $1",
      [req.params.slug]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Course not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/courses/slug/:slug error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/courses/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const result = await pool.query(
      "SELECT * FROM courses WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Course not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/courses/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/courses — create new course
router.post("/", async (req, res) => {
  try {
    const {
      title, slug, category, duration, eligibility, certification,
      delivery_method, content, career_opportunities, videos,
      extra_sections, brochure_url, thumbnail_url, gallery, is_active,
    } = req.body;

    if (!title || !slug || !category) {
      return res.status(400).json({ error: "title, slug and category are required" });
    }

    const result = await pool.query(
      `INSERT INTO courses
         (title, slug, category, duration, eligibility, certification,
          delivery_method, content, career_opportunities, videos,
          extra_sections, brochure_url, thumbnail_url, gallery, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id, slug`,
      [
        title,
        slug,
        category,
        duration             || null,
        eligibility          || null,
        certification        || "Govt. Approved Certified",
        delivery_method      || "Offline",
        content              || "",
        career_opportunities || [],
        JSON.stringify(videos         || []),
        JSON.stringify(extra_sections || []),
        brochure_url         || null,
        thumbnail_url        || null,
        JSON.stringify(gallery        || []),  // ← $14
        is_active !== undefined ? is_active : true,
      ]
    );

    res.status(201).json({
      success: true,
      id:   result.rows[0].id,
      slug: result.rows[0].slug,
    });
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Slug already exists — choose a different one" });
    console.error("POST /api/courses error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/courses/:id — update existing course
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const {
      title, slug, category, duration, eligibility, certification,
      delivery_method, content, career_opportunities, videos,
      extra_sections, brochure_url, thumbnail_url, gallery, is_active,
    } = req.body;

    const result = await pool.query(
      `UPDATE courses SET
         title                = $1,
         slug                 = $2,
         category             = $3,
         duration             = $4,
         eligibility          = $5,
         certification        = $6,
         delivery_method      = $7,
         content              = $8,
         career_opportunities = $9,
         videos               = $10,
         extra_sections       = $11,
         brochure_url         = $12,
         thumbnail_url        = $13,
         gallery              = $14,
         is_active            = $15,
         updated_at           = NOW()
       WHERE id = $16
       RETURNING id`,
      [
        title,
        slug,
        category,
        duration             || null,
        eligibility          || null,
        certification        || "Govt. Approved Certified",
        delivery_method      || "Offline",
        content              || "",
        career_opportunities || [],
        JSON.stringify(videos         || []),
        JSON.stringify(extra_sections || []),
        brochure_url         || null,
        thumbnail_url        || null,
        JSON.stringify(gallery        || []),  // ← $14
        is_active !== undefined ? is_active : true,
        id,                                    // ← $16
      ]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Course not found" });
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Slug already exists" });
    console.error("PUT /api/courses/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/courses/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const result = await pool.query(
      "DELETE FROM courses WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Course not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/courses/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
