const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../config/db");

// ─── Ensure Upload Folder Exists ─────────────────────────────
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads", { recursive: true });
}

// ─── Multer Storage ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// ─── File Filter ─────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/ogg",
  ];

  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only images and videos allowed"), false);
};

// ─── Multer Config ───────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

// ─── UPLOAD API ──────────────────────────────────────────────
router.post("/upload", upload.array("media", 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    for (const file of req.files) {
      const isVideo = file.mimetype.startsWith("video/");
      const fileUrl = `http://localhost:5000/uploads/${file.filename}`;

      await pool.query( // ✅ FIXED (db → pool)
        "INSERT INTO media (file_name, file_type, file_url) VALUES ($1, $2, $3)",
        [file.originalname, isVideo ? "video" : "photo", fileUrl]
      );
    }

    res.json({
      success: true,
      count: req.files.length,
      message: `${req.files.length} file(s) uploaded`,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({
      error: "Upload failed",
      details: err.message,
    });
  }
});

// ─── GET ALL MEDIA ───────────────────────────────────────────
router.get("/media", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM media ORDER BY uploaded_at DESC"
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ─── DELETE MEDIA ────────────────────────────────────────────
router.delete("/media/:id", async (req, res) => {
  try {
    const result = await pool.query( // ✅ FIXED
      "SELECT * FROM media WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    // delete file from folder
    const filePath =
      "./uploads/" + result.rows[0].file_url.split("/uploads/")[1];

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query( // ✅ FIXED
      "DELETE FROM media WHERE id = $1",
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;