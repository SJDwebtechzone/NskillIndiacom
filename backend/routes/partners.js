const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// Ensure upload directory exists
const partnersDir = "uploads/partners/";
if (!fs.existsSync(partnersDir)) {
    fs.mkdirSync(partnersDir, { recursive: true });
}

const partnersStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, partnersDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const uploadPartners = multer({ 
    storage: partnersStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only JPG, PNG, WebP, and SVG are allowed."));
        }
    }
});

// GET all partners
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, company_name, logo_url AS company_logo, website_url, created_at FROM partners ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching partners:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// POST add a partner
router.post("/", (req, res, next) => {
    uploadPartners.single("company_logo")(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        console.log("Add Partner Request Body:", req.body);
        console.log("Add Partner Request File:", req.file);

        const { company_name, website_url } = req.body;
        if (!company_name) return res.status(400).json({ message: "Company name is required." });
        if (!req.file) return res.status(400).json({ message: "Company logo is required." });

        const image_url = `${BACKEND_URL}/uploads/partners/${req.file.filename}`;

        const result = await pool.query(
            "INSERT INTO partners (company_name, logo_url, website_url) VALUES ($1, $2, $3) RETURNING id, company_name, logo_url AS company_logo, website_url",
            [company_name, image_url, website_url || null]
        );
        res.status(201).json({ message: "Partner added successfully", partner: result.rows[0] });
    } catch (err) {
        console.error("Error adding partner:", err.stack);
        res.status(500).json({ message: "Server error: " + err.message });
    }
});

// PUT update a partner
router.put("/:id", (req, res, next) => {
    uploadPartners.single("company_logo")(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        const { id } = req.params;
        const { company_name, website_url } = req.body;
        
        if (!company_name) return res.status(400).json({ message: "Company name is required." });

        let query, values;
        if (req.file) {
            const image_url = `${BACKEND_URL}/uploads/partners/${req.file.filename}`;
            query = "UPDATE partners SET company_name = $1, logo_url = $2, website_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, company_name, logo_url AS company_logo, website_url";
            values = [company_name, image_url, website_url || null, id];
        } else {
            query = "UPDATE partners SET company_name = $1, website_url = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, company_name, logo_url AS company_logo, website_url";
            values = [company_name, website_url || null, id];
        }

        const result = await pool.query(query, values);
        if (result.rows.length === 0) return res.status(404).json({ message: "Partner not found" });

        res.json({ message: "Partner updated successfully", partner: result.rows[0] });
    } catch (err) {
        console.error("Error updating partner:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE a partner
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM partners WHERE id = $1 RETURNING *", [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: "Partner not found" });

        res.json({ message: "Partner deleted successfully" });
    } catch (err) {
        console.error("Error deleting partner:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
