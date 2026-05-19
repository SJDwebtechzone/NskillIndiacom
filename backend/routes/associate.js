// backend/routes/associate.js
const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const bcrypt  = require("bcryptjs");
const path    = require("path");
const fs      = require("fs");
const jwt     = require("jsonwebtoken"); // ✅ ADD THIS LINE
const pool    = require("../config/db");
const { authMiddleware, checkPermission } = require("../middleware/authMiddleware");

// ✅ Same SECRET as authMiddleware
const SECRET = process.env.JWT_SECRET || "mysecret";

// ── Multer ─────────────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const u = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${u}${path.extname(file.originalname)}`);
  },
});
const fileFilter = (req, file, cb) => {
  const ok = [".pdf", ".jpg", ".jpeg", ".png"];
  ok.includes(path.extname(file.originalname).toLowerCase())
    ? cb(null, true)
    : cb(new Error("Only PDF/JPG/PNG allowed"));
};
const upload    = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const docUpload = upload.fields([
  { name: "file_photo",           maxCount: 1 },
  { name: "file_aadhaar_copy",    maxCount: 1 },
  { name: "file_pan_copy",        maxCount: 1 },
  { name: "file_gst_certificate", maxCount: 1 },
  { name: "file_address_proof",   maxCount: 1 },
]);

// ── Safe helpers ───────────────────────────────────────────────────────────────
const arr  = v => { if (!v) return []; try { return JSON.parse(v); } catch { return []; } };
const int  = v => { const n = parseInt(v); return isNaN(n) ? null : n; };
const str  = v => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s !== "" ? s : null;
};
const bool = (v, y, n) => v === y ? true : v === n ? false : null;

// ── Credential generators ──────────────────────────────────────────────────────
function generatePassword() {
  const upper   = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower   = "abcdefghjkmnpqrstuvwxyz";
  const digits  = "23456789";
  const special = "@#$%&*!";
  const rand    = s => s[Math.floor(Math.random() * s.length)];
  const chars   = [
    rand(upper), rand(upper), rand(upper),
    rand(lower), rand(lower), rand(lower),
    rand(digits), rand(digits),
    rand(special),
    rand(upper + lower + digits),
  ];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. POST /api/associate  — public enrolment form (multipart, no auth needed)
// ══════════════════════════════════════════════════════════════════════════════
router.post("/", docUpload, async (req, res) => {
  const b = req.body;
  const f = req.files || {};

  if (!str(b.full_name) || !str(b.email) || !str(b.mobile_primary) || !str(b.gender) || !str(b.date_of_birth))
    return res.status(400).json({ error: "Required fields missing." });
  if (!b.consent_agreed || b.consent_agreed === "false")
    return res.status(400).json({ error: "Consent declaration must be agreed." });
  if (!f.file_aadhaar_copy) return res.status(400).json({ error: "Aadhaar card upload is required." });
  if (!f.file_pan_copy)     return res.status(400).json({ error: "PAN card upload is required." });

  const values = [
    str(b.full_name), str(b.date_of_birth), str(b.gender),
    str(b.mobile_primary), str(b.mobile_whatsapp), str(b.email),
    str(b.residential_address), str(b.city), str(b.district), str(b.state),
    str(b.pincode), str(b.legislative_assembly),
    str(b.current_profession), str(b.profession_other_specify),
    str(b.educational_qualification), str(b.special_skill),
    arr(b.specialisation), arr(b.languages_known), str(b.languages_other),
    str(b.total_experience), str(b.experience_career_counselling),
    arr(b.current_services_offered), str(b.years_of_operation),
    int(b.avg_students_per_month), int(b.students_last_3_years),
    int(b.students_2024_25), int(b.students_2023_24), int(b.students_2022_23),
    str(b.has_office), str(b.office_no_street), str(b.office_area_name),
    str(b.office_location), str(b.office_district), str(b.office_city),
    str(b.office_pincode), str(b.office_legislative_assembly),
    int(b.office_area_sqft), bool(b.has_separate_counselling_room, "Yes", "No"),
    int(b.no_of_staff), str(b.interested_in_setting_up_office),
    str(b.linkedin), str(b.instagram), str(b.facebook),
    arr(b.partnership_areas), int(b.expected_monthly_referrals),
    f.file_photo?.[0]?.filename           || null,
    f.file_aadhaar_copy?.[0]?.filename    || null,
    f.file_pan_copy?.[0]?.filename        || null,
    f.file_gst_certificate?.[0]?.filename || null,
    f.file_address_proof?.[0]?.filename   || null,
    str(b.bank_account_holder), str(b.bank_name_branch),
    str(b.account_number), b.ifsc_code ? b.ifsc_code.toUpperCase() : null,
    str(b.additional_info), true, str(b.consent_place), str(b.consent_date),
  ];

  try {
    const result = await pool.query(
      `INSERT INTO career_counsellors (
        full_name, date_of_birth, gender, mobile_primary, mobile_whatsapp,
        email, residential_address, city, district, state, pincode, legislative_assembly,
        current_profession, profession_other_specify, educational_qualification,
        special_skill, specialisation, languages_known, languages_other,
        total_experience, experience_career_counselling,
        current_services_offered, years_of_operation, avg_students_per_month,
        students_last_3_years, students_2024_25, students_2023_24, students_2022_23,
        has_office, office_no_street, office_area_name, office_location,
        office_district, office_city, office_pincode, office_legislative_assembly,
        office_area_sqft, has_separate_counselling_room, no_of_staff,
        interested_in_setting_up_office, linkedin, instagram, facebook,
        partnership_areas, expected_monthly_referrals,
        file_photo, file_aadhaar_copy, file_pan_copy, file_gst_certificate, file_address_proof,
        bank_account_holder, bank_name_branch, account_number, ifsc_code,
        additional_info, consent_agreed, consent_place, consent_date
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,
        $39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57,$58
      ) RETURNING id, full_name, email, created_at`,
      values
    );
    res.status(201).json({ message: "Enrolled successfully!", data: result.rows[0] });
  } catch (err) {
    console.error("❌ POST /:", err.message);
    if (err.code === "23505") return res.status(409).json({ error: "Email already exists." });
    res.status(500).json({ error: err.message, detail: err.detail, code: err.code });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. GET /api/associate  — list all (auth + permission required)
// ══════════════════════════════════════════════════════════════════════════════
router.get(
  "/",
  authMiddleware,
  checkPermission("Associate", "view"),
  async (req, res) => {
    try {
      const r = await pool.query(
        `SELECT id, full_name, email, mobile_primary, current_profession,
                city, district, state, status,
                (password_hash IS NOT NULL) AS has_password,
                created_at
         FROM career_counsellors ORDER BY created_at DESC`
      );
      res.json({ data: r.rows, total: r.rowCount });
    } catch (err) {
      console.error("❌ GET /:", err.message);
      res.status(500).json({ error: "Failed to fetch." });
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// 3. GET /api/associate/:id  — full single record (auth + permission required)
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// GET /api/associate/:id/files/:field  — serve uploaded file (token auth)
// ══════════════════════════════════════════════════════════════════════════════
router.get("/:id/files/:field", async (req, res) => {
  const allowedFields = [
    "file_photo", "file_aadhaar_copy", "file_pan_copy",
    "file_gst_certificate", "file_address_proof",
  ];

  const { id, field } = req.params;

  if (!allowedFields.includes(field))
    return res.status(400).json({ error: "Invalid field." });

  const token = req.query.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided." });

  try {
    // ✅ Use same SECRET as authMiddleware — fallback to "mysecret"
    const SECRET = process.env.JWT_SECRET || "mysecret";
    const decoded = jwt.verify(token, SECRET);

    const r = await pool.query(
      `SELECT ${field} FROM career_counsellors WHERE id = $1`,
      [id]
    );
    if (!r.rowCount) return res.status(404).json({ error: "Associate not found." });

    const filename = r.rows[0][field];
    if (!filename) return res.status(404).json({ error: "File not uploaded." });

    const filePath = path.join(__dirname, "../uploads", filename);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ error: "File not found on server." });

    res.sendFile(filePath);
  } catch (err) {
    console.error("❌ File route error:", err.name, err.message);
    res.status(401).json({ error: "Invalid or expired token." });
  }
});

router.get(
  "/:id",
  authMiddleware,
  checkPermission("Associate", "view"),
  async (req, res) => {
    try {
      const r = await pool.query(
        `SELECT
          id, full_name, date_of_birth, gender, mobile_primary, mobile_whatsapp,
          email, residential_address, city, district, state, pincode, legislative_assembly,
          current_profession, profession_other_specify, educational_qualification,
          special_skill, specialisation, languages_known, languages_other,
          total_experience, experience_career_counselling,
          current_services_offered, years_of_operation, avg_students_per_month,
          students_last_3_years, students_2024_25, students_2023_24, students_2022_23,
          has_office, office_no_street, office_area_name, office_location,
          office_district, office_city, office_pincode, office_legislative_assembly,
          office_area_sqft, has_separate_counselling_room, no_of_staff,
          interested_in_setting_up_office, linkedin, instagram, facebook,
          partnership_areas, expected_monthly_referrals,
          file_photo, file_aadhaar_copy, file_pan_copy, file_gst_certificate, file_address_proof,
          bank_account_holder, bank_name_branch, account_number, ifsc_code,
          additional_info, consent_agreed, consent_place, consent_date,
          status, (password_hash IS NOT NULL) AS has_password, created_at
         FROM career_counsellors WHERE id = $1`,
        [req.params.id]
      );
      if (!r.rowCount) return res.status(404).json({ error: "Not found." });
      res.json({ data: r.rows[0] });
    } catch (err) {
      console.error("❌ GET /:id:", err.message);
      res.status(500).json({ error: "Failed to fetch." });
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// 4. PATCH /api/associate/:id  — edit fields (auth + edit permission required)
// ══════════════════════════════════════════════════════════════════════════════
router.patch(
  "/:id",
  authMiddleware,
  checkPermission("Associate", "edit"),
  async (req, res) => {
    const b = req.body;
    const allowed = [
      "full_name", "email", "mobile_primary", "mobile_whatsapp", "gender", "date_of_birth",
      "residential_address", "city", "district", "state", "pincode", "legislative_assembly",
      "current_profession", "profession_other_specify", "educational_qualification",
      "special_skill", "total_experience", "experience_career_counselling",
      "years_of_operation", "has_office", "office_no_street", "office_area_name",
      "office_location", "office_district", "office_city", "office_pincode",
      "office_legislative_assembly", "office_area_sqft", "no_of_staff",
      "interested_in_setting_up_office", "linkedin", "instagram", "facebook",
      "expected_monthly_referrals", "bank_account_holder", "bank_name_branch",
      "account_number", "ifsc_code", "additional_info", "status",
      "consent_place", "consent_date",
    ];

    const sets = [], vals = [];
    let idx = 1;

    for (const key of allowed) {
      if (b[key] !== undefined) {
        sets.push(`${key} = $${idx++}`);
        vals.push(str(b[key]));
      }
    }

    if (b.consent_agreed !== undefined) {
      sets.push(`consent_agreed = $${idx++}`);
      vals.push(b.consent_agreed === true || b.consent_agreed === "true");
    }

    for (const key of ["specialisation", "languages_known", "current_services_offered", "partnership_areas"]) {
      if (b[key] !== undefined) {
        sets.push(`${key} = $${idx++}`);
        vals.push(Array.isArray(b[key]) ? b[key] : arr(b[key]));
      }
    }

    if (!sets.length) return res.status(400).json({ error: "Nothing to update." });
    vals.push(req.params.id);

    try {
      const r = await pool.query(
        `UPDATE career_counsellors SET ${sets.join(", ")} WHERE id = $${idx} RETURNING id, full_name, email, status`,
        vals
      );
      if (!r.rowCount) return res.status(404).json({ error: "Not found." });
      res.json({ message: "Updated.", data: r.rows[0] });
    } catch (err) {
      console.error("❌ PATCH /:id:", err.message, err.detail);
      if (err.code === "23505") return res.status(409).json({ error: "Email already exists." });
      res.status(500).json({ error: err.message });
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// 5. PATCH /api/associate/:id/status  — status only (auth + edit permission)
// ══════════════════════════════════════════════════════════════════════════════
router.patch(
  "/:id/status",
  authMiddleware,
  checkPermission("Associate", "edit"),
  async (req, res) => {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status))
      return res.status(400).json({ error: "Invalid status." });
    try {
      const r = await pool.query(
        "UPDATE career_counsellors SET status = $1 WHERE id = $2 RETURNING id, status",
        [status, req.params.id]
      );
      if (!r.rowCount) return res.status(404).json({ error: "Not found." });
      res.json({ message: "Status updated.", data: r.rows[0] });
    } catch (err) {
      console.error("❌ PATCH /:id/status:", err.message);
      res.status(500).json({ error: "Failed to update." });
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// 6. POST /api/associate/:id/credentials  — generate password (auth + edit)
// ══════════════════════════════════════════════════════════════════════════════
router.post(
  "/:id/credentials",
  authMiddleware,
  checkPermission("Associate", "edit"),
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT id, full_name, email FROM career_counsellors WHERE id = $1",
        [req.params.id]
      );
      if (!result.rowCount)
        return res.status(404).json({ error: "Associate not found." });

      const assoc       = result.rows[0];
      const username    = assoc.email;        // email IS the username
      const plainPwd    = generatePassword();
      const passwordHash = await bcrypt.hash(plainPwd, 10);

      // 1. Update career_counsellors table
      await pool.query(
        "UPDATE career_counsellors SET password_hash = $1 WHERE id = $2",
        [passwordHash, assoc.id]
      );

      // 2. Sync with users table for login
      // Get Associate role id
      const roleResult = await pool.query("SELECT id FROM roles WHERE name = $1", ["Associate"]);
      const roleId = roleResult.rows[0]?.id;

      if (roleId) {
        await pool.query(
          `INSERT INTO users (name, email, password, role_id, status)
           VALUES ($1, $2, $3, $4, 'Active')
           ON CONFLICT (email)
           DO UPDATE SET
             name     = EXCLUDED.name,
             password = EXCLUDED.password,
             role_id  = EXCLUDED.role_id,
             status   = 'Active'`,
          [assoc.full_name, assoc.email, passwordHash, roleId]
        );
      }

      res.json({
        message: "Credentials generated successfully.",
        credentials: { username, password: plainPwd },
      });
    } catch (err) {
      console.error("❌ POST /:id/credentials:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// 7. DELETE /api/associate/:id  — delete (auth + delete permission required)
// ══════════════════════════════════════════════════════════════════════════════
router.delete(
  "/:id",
  authMiddleware,
  checkPermission("Associate", "delete"),
  async (req, res) => {
    try {
      const r = await pool.query(
        "DELETE FROM career_counsellors WHERE id = $1 RETURNING id, full_name",
        [req.params.id]
      );
      if (!r.rowCount) return res.status(404).json({ error: "Not found." });
      res.json({ message: `${r.rows[0].full_name} deleted successfully.` });
    } catch (err) {
      console.error("❌ DELETE /:id:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
