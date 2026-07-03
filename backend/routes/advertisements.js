const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Configure Multer for Advertisement uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads/advertisements");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
});

const uploadAd = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif|svg/;
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);
        if (extName && mimeType) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only JPG, PNG, WebP, GIF, and SVG are allowed."));
        }
    }
});

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// GET all advertisements
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM advertisements ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching advertisements:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET active advertisement (for frontend)
router.get("/active", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM advertisements WHERE status = 'Active' LIMIT 1");
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.json(null); // Return 200 with null instead of 404 to prevent browser console errors
        }
    } catch (err) {
        console.error("Error fetching active advertisement:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// POST new advertisement
router.post("/", (req, res, next) => {
    uploadAd.single("image")(req, res, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Image file is required" });
        }

        const image_url = `${BACKEND_URL}/uploads/advertisements/${req.file.filename}`;

        // Begin transaction to ensure only one ad is active at a time
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Deactivate all existing ads
            await client.query("UPDATE advertisements SET status = 'Inactive'");
            
            // Insert the new ad as active
            const insertQuery = "INSERT INTO advertisements (image, status) VALUES ($1, 'Active') RETURNING *";
            const result = await client.query(insertQuery, [image_url]);
            
            await client.query('COMMIT');
            res.status(201).json({ message: "Advertisement added successfully", advertisement: result.rows[0] });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error adding advertisement:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// PATCH toggle advertisement status
router.patch("/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            if (status === 'Active') {
                // Deactivate all existing ads first
                await client.query("UPDATE advertisements SET status = 'Inactive'");
            }

            const query = "UPDATE advertisements SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *";
            const result = await client.query(query, [status, id]);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: "Advertisement not found" });
            }

            await client.query('COMMIT');
            res.json({ message: "Advertisement status updated successfully", advertisement: result.rows[0] });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error updating advertisement status:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// DELETE advertisement
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const fetchAd = await pool.query("SELECT image FROM advertisements WHERE id = $1", [id]);
        if (fetchAd.rows.length === 0) {
            return res.status(404).json({ error: "Advertisement not found" });
        }

        const ad = fetchAd.rows[0];
        
        // Delete image file from server
        if (ad.image) {
            try {
                const filename = ad.image.split('/uploads/advertisements/')[1];
                if (filename) {
                    const filePath = path.join(__dirname, "../uploads/advertisements", filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            } catch (err) {
                console.error("Error deleting image file:", err);
            }
        }

        await pool.query("DELETE FROM advertisements WHERE id = $1", [id]);
        res.json({ message: "Advertisement deleted successfully" });
    } catch (err) {
        console.error("Error deleting advertisement:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
