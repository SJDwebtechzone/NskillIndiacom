const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── Use env variable for backend URL ──────────────────────────────────────────
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = "uploads/banners/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// --- Popups Video Storage ---
const popupStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = "uploads/popups/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const uploadPopup = multer({ storage: popupStorage });

// --- Banners ---

// Get all banners
router.get("/banners", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM banners ORDER BY display_order ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("[banners] DB error:", err.message);
        res.json([]);
    }
});

// Add a banner with image upload
router.post("/banners", upload.single("image"), async (req, res) => {
    try {
        const { title, display_order } = req.body;
        // ✅ FIXED — was hardcoded http://localhost:5000
        const image_url = req.file ? `${BACKEND_URL}/uploads/banners/${req.file.filename}` : "";

        const result = await pool.query(
            "INSERT INTO banners (image_url, title, display_order) VALUES ($1, $2, $3) RETURNING *",
            [image_url, title, display_order || 0]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Delete a banner
router.delete("/banners/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await pool.query("SELECT image_url FROM banners WHERE id = $1", [id]);
        if (banner.rows.length > 0 && banner.rows[0].image_url) {
            const filename = banner.rows[0].image_url.split('/').pop();
            const filepath = path.join(__dirname, '../uploads/banners', filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }
        await pool.query("DELETE FROM banners WHERE id = $1", [id]);
        res.json({ message: "Banner deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Update banner status
router.put("/banners/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        const result = await pool.query(
            "UPDATE banners SET is_active = $1 WHERE id = $2 RETURNING *",
            [is_active, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- Popups ---

// Get all popups
router.get("/popups", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, image_url, video_url, title, 
                   description, course_id, is_active, 
                   manual_override, placement 
            FROM popups 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("[popups] Fetch error:", err.message);
        res.status(200).json([]);
    }
});

// Add a popup with video upload
router.post("/popups", uploadPopup.single("video"), async (req, res) => {
    try {
        const { title, description, course_id, manual_override, placement } = req.body;
        // ✅ FIXED — was hardcoded http://localhost:5000
        const video_url = req.file ? `${BACKEND_URL}/uploads/popups/${req.file.filename}` : "";

        const result = await pool.query(
            "INSERT INTO popups (video_url, title, description, course_id, manual_override, placement) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [video_url, title, description, course_id, manual_override || false, placement || "Intro"]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("[popups] Create error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// Delete a popup
router.delete("/popups/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const popup = await pool.query("SELECT video_url FROM popups WHERE id = $1", [id]);
        if (popup.rows.length > 0 && popup.rows[0].video_url) {
            const filename = popup.rows[0].video_url.split('/').pop();
            const filepath = path.join(__dirname, '../uploads/popups', filename);
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        }
        await pool.query("DELETE FROM popups WHERE id = $1", [id]);
        res.json({ message: "Popup deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Update popup status
router.put("/popups/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        if (is_active) {
            await pool.query("UPDATE popups SET is_active = FALSE");
        }
        const result = await pool.query(
            "UPDATE popups SET is_active = $1 WHERE id = $2 RETURNING *",
            [is_active, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Update manual override
router.put("/popups/:id/override", async (req, res) => {
    try {
        const { id } = req.params;
        const { manual_override } = req.body;
        if (manual_override) {
            await pool.query("UPDATE popups SET manual_override = FALSE");
        }
        const result = await pool.query(
            "UPDATE popups SET manual_override = $1 WHERE id = $2 RETURNING *",
            [manual_override, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- Latest News ---
const newsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = "uploads/news/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const uploadNews = multer({ storage: newsStorage });

// Get all news
router.get("/news", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM latest_news ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("[news] DB error:", err.message);
        res.json([]);
    }
});

// Add a news item
router.post("/news", uploadNews.single("image"), async (req, res) => {
    try {
        const { title, content } = req.body;
        // ✅ FIXED — was hardcoded http://localhost:5000
        const image_url = req.file ? `${BACKEND_URL}/uploads/news/${req.file.filename}` : "";
        const result = await pool.query(
            "INSERT INTO latest_news (title, content, image_url) VALUES ($1, $2, $3) RETURNING *",
            [title, content, image_url]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Delete a news item
router.delete("/news/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const news = await pool.query("SELECT image_url FROM latest_news WHERE id = $1", [id]);
        if (news.rows.length > 0 && news.rows[0].image_url) {
            const filename = news.rows[0].image_url.split('/').pop();
            const filepath = path.join(__dirname, '../uploads/news', filename);
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        }
        await pool.query("DELETE FROM latest_news WHERE id = $1", [id]);
        res.json({ message: "News deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- Accreditations ---
const accreditationsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = "uploads/accreditations/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const uploadAccreditations = multer({ storage: accreditationsStorage });

router.get("/accreditations", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name as title, logo_url as image_url, created_at FROM accreditations ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("[accreditations] DB error:", err.message);
        res.json([]);
    }
});

router.post("/accreditations", uploadAccreditations.single("image"), async (req, res) => {
    try {
        const { title, organization } = req.body;
        // ✅ FIXED — was hardcoded http://localhost:5000
        const image_url = req.file ? `${BACKEND_URL}/uploads/accreditations/${req.file.filename}` : "";
        const result = await pool.query(
            "INSERT INTO accreditations (name, logo_url, organization) VALUES ($1, $2, $3) RETURNING id, name as title, logo_url as image_url, created_at",
            [title, image_url, organization || 'N/A']
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.delete("/accreditations/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const item = await pool.query("SELECT logo_url as image_url FROM accreditations WHERE id = $1", [id]);
        if (item.rows.length > 0 && item.rows[0].image_url) {
            const filename = item.rows[0].image_url.split('/').pop();
            const filepath = path.join(__dirname, '../uploads/accreditations', filename);
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        }
        await pool.query("DELETE FROM accreditations WHERE id = $1", [id]);
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- Contact Info ---

router.get("/contact-info", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM contact_info ORDER BY id LIMIT 1");
        res.json(result.rows[0] || {});
    } catch (err) {
        console.error("[contact-info] DB error:", err.message);
        res.json({});
    }
});

router.post("/contact-info", async (req, res) => {
    try {
        const {
            company_name, address, primary_phone, secondary_phone,
            whatsapp_number, email, map_embed_url,
            facebook_url, twitter_url, instagram_url, linkedin_url
        } = req.body;

        const check = await pool.query("SELECT id FROM contact_info LIMIT 1");

        if (check.rows.length === 0) {
            await pool.query(`
                INSERT INTO contact_info (
                    company_name, address, primary_phone, secondary_phone, whatsapp_number,
                    email, map_embed_url, facebook_url, twitter_url, instagram_url, linkedin_url
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
                [company_name, address, primary_phone, secondary_phone, whatsapp_number,
                 email, map_embed_url, facebook_url, twitter_url, instagram_url, linkedin_url]
            );
        } else {
            await pool.query(`
                UPDATE contact_info SET
                    company_name = $1, address = $2, primary_phone = $3,
                    secondary_phone = $4, whatsapp_number = $5, email = $6,
                    map_embed_url = $7, facebook_url = $8, twitter_url = $9,
                    instagram_url = $10, linkedin_url = $11,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $12`,
                [company_name, address, primary_phone, secondary_phone, whatsapp_number,
                 email, map_embed_url, facebook_url, twitter_url, instagram_url,
                 linkedin_url, check.rows[0].id]
            );
        }
        res.json({ message: "Contact info updated successfully" });
    } catch (err) {
        console.error("[contact-info] Update error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
