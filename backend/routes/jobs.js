const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const multer = require("multer");
const path = require("path");

// ── Multer Config ─────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX files are allowed"));
    }
  },
});

// ✅ GET ALL JOBS
router.get("/jobs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM jobs ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching jobs" });
  }
});

// ✅ ADD JOB
router.post("/add-job", async (req, res) => {
  const { title, company, location, salary, job_type, skills, experience, description } = req.body;
  try {
    await pool.query(
      `INSERT INTO jobs (title, company, location, salary, job_type, skills, experience, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [title, company, location, salary, job_type, skills, experience, description]
    );
    res.json({ message: "Job added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert failed" });
  }
});

// ✅ DELETE JOB
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM jobs WHERE id = $1", [id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// ✅ APPLY FOR JOB
router.post("/apply", upload.single("resume"), async (req, res) => {
  try {
    const { job_id, name, email, location, qualification, skills, experience } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    await pool.query(
      `INSERT INTO job_applications 
        (job_id, name, email, location, qualification, skills, experience, resume_filename, resume_data, resume_mimetype)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        job_id, name, email, location, qualification, skills, experience,
        req.file.originalname,
        req.file.buffer,
        req.file.mimetype,
      ]
    );

    res.status(201).json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error("POST /apply error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ALL APPLICATIONS (admin)
router.get("/applications", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ja.id, ja.job_id, ja.name, ja.email, ja.location, ja.qualification, ja.skills, ja.experience, 
              ja.resume_filename, ja.resume_mimetype, ja.applied_at, j.title as job_title
       FROM job_applications ja
       LEFT JOIN jobs j ON ja.job_id = j.id
       ORDER BY ja.applied_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /applications error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DOWNLOAD RESUME
router.get("/resume/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT resume_filename, resume_data, resume_mimetype FROM job_applications WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const { resume_filename, resume_data, resume_mimetype } = result.rows[0];
    res.setHeader("Content-Type", resume_mimetype || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${resume_filename}"`);
    res.send(resume_data);
  } catch (err) {
    console.error("GET /resume/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE APPLICATION
router.delete("/application/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM job_applications WHERE id = $1", [id]);
    res.json({ message: "Application deleted" });
  } catch (err) {
    console.error("DELETE /application/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
