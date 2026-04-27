const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authMiddleware } = require("../middleware/authMiddleware");

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/admissions';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

const uploadFields = upload.fields([
    { name: 'photo_file', maxCount: 1 },
    { name: 'has_aadhaar_file', maxCount: 1 },
    { name: 'has_edu_certs_file', maxCount: 1 },
    { name: 'has_passport_file', maxCount: 1 },
    { name: 'has_resume_file', maxCount: 1 },
    { name: 'has_address_proof_file', maxCount: 1 },
    { name: 'has_photos_file', maxCount: 1 },
]);

// Helper to add referral points
const addReferralPoints = async (admissionData) => {
    try {
        const userId = admissionData.created_by_id;
        if (!userId) return;

        // Check if creator is Associate
        const userRes = await pool.query(`
            SELECT r.name as role_name 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = $1`, 
        [userId]);
        
        if (userRes.rows.length === 0 || userRes.rows[0].role_name !== "Associate") return;

        const balance = parseFloat(admissionData.balance_amount) || 0;
        const totalFees = parseFloat(admissionData.total_fees) || 0;
        
        // As requested: points are 0 if balance not cleared, 10% if cleared
        const points = (balance <= 0 && totalFees > 0) ? (totalFees * 0.10) : 0;

        const check = await pool.query("SELECT id, is_settled FROM associate_referral_points WHERE admission_id = $1", [admissionData.id]);
        
        if (check.rows.length === 0) {
            await pool.query(
                `INSERT INTO associate_referral_points (associate_id, admission_id, student_name, course_fee, points_earned)
                 VALUES ($1, $2, $3, $4, $5)`,
                [userId, admissionData.id, (admissionData.full_name || admissionData.student_name), totalFees, points]
            );
        } else {
            // Only update if not yet settled by Admin
            if (!check.rows[0].is_settled) {
                await pool.query(
                    `UPDATE associate_referral_points 
                     SET points_earned = $1, student_name = $2, course_fee = $3 
                     WHERE admission_id = $4`,
                    [points, (admissionData.full_name || admissionData.student_name), totalFees, admissionData.id]
                );
            }
        }
    } catch (err) {
        console.error("Error adding referral points:", err.message);
    }
};

// ─── STATIC / SPECIFIC ROUTES FIRST ──────────────────────────────────────────

// Create new admission
router.post("/", authMiddleware, uploadFields, async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;
        const userId = req.user.id;

        const toDate    = v => (v && v.trim() !== "" ? v : null);
        const toNum     = v => {
            const parsed = parseFloat(v);
            return isNaN(parsed) ? 0 : parsed;
        };
        const toBool    = v => (v === true || v === "true");
        const toStr     = v => (v !== undefined && v !== null ? v.toString() : null);

        const phoneRegex = /^\d{10}$/;
        if (data.mobile_number && !phoneRegex.test(data.mobile_number)) {
            return res.status(400).json({ error: "Mobile number must be exactly 10 digits" });
        }
        if (!data.full_name) return res.status(400).json({ error: "Full name is required" });

        const dob              = toDate(data.dob);
        const payment_date     = toDate(data.payment_date);
        const counselling_date = toDate(data.counselling_date);

        if (!dob)              return res.status(400).json({ error: "Date of Birth is required" });
        if (!payment_date)     return res.status(400).json({ error: "Payment date is required" });
        if (!counselling_date) return res.status(400).json({ error: "Counselling date is required" });

        const getFilePath = (fieldName) => (files && files[fieldName]) ? files[fieldName][0].path : null;

        const query = `
            INSERT INTO student_admissions (
                enquiry_id, full_name, gender, dob, age, aadhaar_number, passport_number, passport_validity, photo_url,
                mobile_number, alt_mobile_number, whatsapp_number, email_id, residential_address, city, state, pin_code,
                parent_name, relationship, parent_mobile, occupation, annual_income,
                highest_qualification, year_of_passing, institution_name, board_university, medium_of_study,
                technical_background, total_experience, industry_experience, skills_known,
                course_interested, course_level, mode_of_training, batch_preference, training_location,
                career_goal, preferred_country, expected_salary, willing_to_relocate,
                counsellor_name, counsellor_code, referral_source, counselling_date,
                course_name, course_fees, total_fees, paid_fees, payment_mode, payment_ref_no, payment_date,
                instalment_1, instalment_2, balance_amount,
                has_aadhaar_file, has_edu_certs_file, has_passport_file, has_resume_file, has_address_proof_file, has_photos_file,
                student_declaration, parent_declaration, placement_ack, overseas_disclaimer,
                discipline_ack, photo_consent, refund_policy_ack, data_privacy_ack, final_undertaking,
                emergency_contact_name, emergency_contact_number, emergency_authorized,
                admission_number, batch_allotted, verified_by, authorized_signature_by,
                created_by_id
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
                $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
                $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
                $51, $52, $53, $54, $55, $56, $57, $58, $59, $60,
                $61, $62, $63, $64, $65, $66, $67, $68, $69, $70,
                $71, $72, $73, $74, $75, $76, $77
            ) RETURNING *`;

        const values = [
            toStr(data.enquiry_id), data.full_name, data.gender, dob, toStr(data.age) || "0", data.aadhaar_number, toStr(data.passport_number), toDate(data.passport_validity), getFilePath('photo_file') || toStr(data.photo_url),
            data.mobile_number, toStr(data.alt_mobile_number), data.whatsapp_number, data.email_id, data.residential_address, data.city, data.state, data.pin_code,
            data.parent_name, data.relationship, data.parent_mobile, data.occupation, toStr(data.annual_income),
            data.highest_qualification, data.year_of_passing, data.institution_name, data.board_university, data.medium_of_study,
            toStr(data.technical_background), toStr(data.total_experience), toStr(data.industry_experience), toStr(data.skills_known),
            data.course_interested, data.course_level || "Basic", data.mode_of_training || "Classroom", toStr(data.batch_preference), toStr(data.training_location),
            data.career_goal, toStr(data.preferred_country), toStr(data.expected_salary), data.willing_to_relocate || "Yes",
            data.counsellor_name, data.counsellor_code, data.referral_source || "Career Counsellor", counselling_date,
            data.course_name, toNum(data.course_fees), toNum(data.total_fees), toNum(data.paid_fees), data.payment_mode || "Cash", toStr(data.payment_ref_no), payment_date,
            toNum(data.instalment_1), toNum(data.instalment_2), toNum(data.balance_amount),
            getFilePath('has_aadhaar_file'), getFilePath('has_edu_certs_file'), getFilePath('has_passport_file'), getFilePath('has_resume_file'), getFilePath('has_address_proof_file'), getFilePath('has_photos_file'),
            toBool(data.student_declaration), toBool(data.parent_declaration), toBool(data.placement_ack), toBool(data.overseas_disclaimer),
            toBool(data.discipline_ack), toBool(data.photo_consent), toBool(data.refund_policy_ack), toBool(data.data_privacy_ack), toBool(data.final_undertaking),
            data.emergency_contact_name, data.emergency_contact_number, toBool(data.emergency_authorized),
            toStr(data.admission_number || data.enquiry_id), toStr(data.batch_allotted), toStr(data.verified_by), toStr(data.authorized_signature_by),
            userId
        ];

        const fs = require('fs');
        fs.writeFileSync('scripts/query_log.txt', `QUERY: ${query}\n\nVALUES: ${JSON.stringify(values, null, 2)}`);
        const result = await pool.query(query, values);
        const newAdmission = result.rows[0];
        await addReferralPoints(newAdmission);
        res.status(201).json(newAdmission);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: "Admission already exists for this enquiry ID" });
        }
        const fs = require('fs');
        fs.appendFileSync('scripts/error_log.txt', `[${new Date().toISOString()}] Admission Error: ${err.message}\n${err.stack}\n\n`);
        res.status(500).json({ error: `Server Error: ${err.message}`, detail: err.detail, details: err.message });
    }
});

// Get all admissions (filtered by role)
router.get("/", authMiddleware, async (req, res) => {
    try {
        console.log(`[admissions] GET request from user ID: ${req.user.id}, Role: ${req.user.roleName}`);
        let query = `
            SELECT sa.*, u.name as associate_name 
            FROM student_admissions sa
            LEFT JOIN users u ON sa.created_by_id = u.id
        `;
        let params = [];
        if (req.user.roleName === "Associate") {
            query += " WHERE sa.created_by_id = $1";
            params.push(req.user.id);
        }
        query += " ORDER BY sa.created_at DESC";
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error("[admissions] List error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// Get referral points for the logged-in associate (MUST be before /:id)
router.get("/referral-points/my", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT rp.*, sa.admission_number, sa.enquiry_id, sa.photo_url
            FROM associate_referral_points rp
            LEFT JOIN student_admissions sa ON sa.id = rp.admission_id
            WHERE rp.associate_id = $1 
            ORDER BY rp.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// Get ALL referral points — Super Admin only (MUST be before /:id)
router.get("/referral-points/all", authMiddleware, async (req, res) => {
    try {
        if (req.user.roleName !== "Admin" && req.user.roleName !== "Super Admin") {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }
        const result = await pool.query(`
            SELECT rp.*, u.name as associate_name, u.email as associate_email, sa.admission_number, sa.enquiry_id, sa.photo_url
            FROM associate_referral_points rp
            LEFT JOIN users u ON u.id = rp.associate_id
            LEFT JOIN student_admissions sa ON sa.id = rp.admission_id
            ORDER BY rp.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// Mark a referral point settled — Admin only (MUST be before /:id)
router.patch("/referral-points/:id/settle", authMiddleware, async (req, res) => {
    try {
        if (req.user.roleName !== "Admin" && req.user.roleName !== "Super Admin") {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }
        const result = await pool.query(
            "UPDATE associate_referral_points SET is_settled = true WHERE id = $1 RETURNING *",
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Record not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Settle referral error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// Get admission by enquiry_id (MUST be before /:id)
router.get("/by-enquiry/:enquiry_id", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM student_admissions WHERE enquiry_id = $1", [req.params.enquiry_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Admission not found" });
        }
        if (req.user.roleName === "Associate" && result.rows[0].created_by_id !== req.user.id) {
            return res.status(403).json({ error: "Access denied" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// Get admissions that do not have user credentials yet
router.get("/no-credential", authMiddleware, async (req, res) => {
    try {
        // Only Admin/Super Admin
        if (req.user.roleName !== "Admin" && req.user.roleName !== "Super Admin") {
            return res.status(403).json({ error: "Access denied." });
        }
        
        // Find admissions whose email_id is NOT in the users table
        const result = await pool.query(`
            SELECT id, full_name, email_id, mobile_number, course_interested 
            FROM student_admissions 
            WHERE email_id NOT IN (SELECT email FROM users)
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching admissions without credentials:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// ─── DYNAMIC /:id ROUTES LAST ─────────────────────────────────────────────────

// Update admission (PATCH /:id)
router.patch("/:id", authMiddleware, uploadFields, async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body || {};
        const files = req.files || {};
        
        const fields = Object.keys(data).filter(f => !['id', 'created_at', 'created_by_id', 'associate_name', 'student_name', 'photo_file', 'has_aadhaar_file', 'has_edu_certs_file', 'has_passport_file', 'has_resume_file', 'has_address_proof_file', 'has_photos_file'].includes(f));
        
        // Handle files in PATCH too
        const fileFields = Object.keys(files);
        if (fields.length === 0 && fileFields.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        const setClauseParts = fields.map((f, i) => `${f} = $${i + 1}`);
        const numericFields = ['course_fees', 'total_fees', 'paid_fees', 'instalment_1', 'instalment_2', 'balance_amount', 'age'];
        const values = fields.map(f => {
            if (numericFields.includes(f)) {
                const p = parseFloat(data[f]);
                return isNaN(p) ? 0 : p;
            }
            return data[f];
        });
        
        // Add file updates to the query if any
        let counter = values.length + 1;
        fileFields.forEach(fieldName => {
            const filePath = files[fieldName][0].path;
            const dbColumn = fieldName === 'photo_file' ? 'photo_url' : fieldName;
            setClauseParts.push(`${dbColumn} = $${counter}`);
            values.push(filePath);
            counter++;
        });

        values.push(id);
        const fs = require('fs');
        const queryStr = `UPDATE student_admissions SET ${setClauseParts.join(", ")} WHERE id = $${values.length} RETURNING *`;
        fs.writeFileSync('scripts/patch_query_log.txt', `QUERY: ${queryStr}\n\nVALUES: ${JSON.stringify(values, null, 2)}`);
        const result = await pool.query(queryStr, values);
        if (result.rows.length === 0) return res.status(404).json({ error: "Admission not found" });

        const updated = result.rows[0];
        await addReferralPoints(updated);
        res.json(updated);
    } catch (err) {
        console.error("Update admission error:", err.message);
        const fs = require('fs');
        fs.appendFileSync('scripts/error_log.txt', `[${new Date().toISOString()}] PATCH Error: ${err.message}\n${err.stack}\n\n`);
        res.status(500).json({ error: `Server Error: ${err.message}`, detail: err.detail, details: err.message });
    }
});

// Delete admission — Admin only (DELETE /:id)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.roleName !== "Admin" && req.user.roleName !== "Super Admin") {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }
        const { id } = req.params;
        await pool.query("DELETE FROM associate_referral_points WHERE admission_id = $1", [id]);
        const result = await pool.query("DELETE FROM student_admissions WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Admission not found" });
        res.json({ message: "Admission deleted successfully", deleted: result.rows[0] });
    } catch (err) {
        console.error("Delete admission error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});
// GET /my-profile — get logged in student's profile for ID card
router.get("/my-profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');

    const userResult = await pool.query(
      `SELECT email FROM users WHERE id = $1 LIMIT 1`,
      [decoded.id]
    );
    const email = userResult.rows[0]?.email;
    if (!email) return res.status(404).json({ error: 'User not found' });

    const studentResult = await pool.query(
      `SELECT id, full_name, admission_number, dob, mobile_number, 
              course_name, batch_allotted, photo_url, admission_date, email_id
       FROM student_admissions 
       WHERE LOWER(email_id) = LOWER($1) LIMIT 1`,
      [email]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json({ student: studentResult.rows[0] });
  } catch (err) {
    console.error('GET /my-profile error:', err);
    res.status(500).json({ error: err.message });
  }
});
// Add this route to admissions.js before module.exports = router;

// GET /fees-receipt — get logged in student's fee receipt data
router.get("/fees-receipt", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');

    // Get email from users table
    const userResult = await pool.query(
      `SELECT email FROM users WHERE id = $1 LIMIT 1`,
      [decoded.id]
    );
    const email = userResult.rows[0]?.email;
    if (!email) return res.status(404).json({ error: 'User not found' });

    // Get student fee details
    const studentResult = await pool.query(
      `SELECT 
        id, full_name, admission_number, course_name, batch_allotted,
        mobile_number, email_id, admission_date,
        course_fees, total_fees, paid_fees, balance_amount,
        payment_mode, payment_ref_no, payment_date,
        instalment_1, instalment_2
       FROM student_admissions 
       WHERE LOWER(email_id) = LOWER($1) LIMIT 1`,
      [email]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ student: studentResult.rows[0] });
  } catch (err) {
    console.error('GET /fees-receipt error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add this route to admissions.js before module.exports = router;

// GET /course-fees-details — get logged in student's course and fees details
router.get("/course-fees-details", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');

    // Get email from users table
    const userResult = await pool.query(
      `SELECT email FROM users WHERE id = $1 LIMIT 1`,
      [decoded.id]
    );
    const email = userResult.rows[0]?.email;
    if (!email) return res.status(404).json({ error: 'User not found' });

    // Get student + course + trainer details
    const result = await pool.query(
      `SELECT 
        sa.full_name, sa.admission_number, sa.admission_date,
        sa.course_name, sa.course_level, sa.mode_of_training,
        sa.batch_allotted, sa.training_location,
        sa.course_fees, sa.total_fees, sa.paid_fees, sa.balance_amount,
        sa.payment_mode, sa.payment_date, sa.payment_ref_no,
        sa.instalment_1, sa.instalment_2,
        c.duration,
        u.name AS trainer_name
       FROM student_admissions sa
       LEFT JOIN courses c ON LOWER(c.title) = LOWER(sa.course_name)
       LEFT JOIN users u ON u.id = c.trainer_id
       WHERE LOWER(sa.email_id) = LOWER($1)
       LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('GET /course-fees-details error:', err);
    res.status(500).json({ error: err.message });
  }
});
// Add these routes to admissions.js before module.exports = router;

// GET /certificate-status — check all conditions for certificate
router.get("/certificate-status", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');

    // Get email from users
    const userResult = await pool.query(
      `SELECT email FROM users WHERE id = $1 LIMIT 1`,
      [decoded.id]
    );
    const email = userResult.rows[0]?.email;
    if (!email) return res.status(404).json({ error: 'User not found' });

    // Get student
    const studentResult = await pool.query(
      `SELECT id, full_name, course_name, balance_amount, admission_number,
              batch_allotted, admission_date
       FROM student_admissions 
       WHERE LOWER(email_id) = LOWER($1) LIMIT 1`,
      [email]
    );
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const student = studentResult.rows[0];
    const studentId = student.id;
    const courseName = student.course_name;

    // ── Check all conditions ──────────────────────────────────────────────────

    // 1. Fees cleared
    const feesCleared = parseFloat(student.balance_amount) <= 0;

    // 2. Pre-test passed
    const pretestResult = await pool.query(
      `SELECT passed FROM pretest_attempts 
       WHERE student_id = $1 AND course_name = $2 
       ORDER BY submitted_at DESC LIMIT 1`,
      [studentId, courseName]
    );
    const pretestPassed = pretestResult.rows.length > 0 && pretestResult.rows[0].passed;

    // 3. Post-test passed
    const posttestResult = await pool.query(
      `SELECT passed FROM finaltest_attempts 
       WHERE student_id = $1 AND course_name = $2 
       ORDER BY submitted_at DESC LIMIT 1`,
      [studentId, courseName]
    );
    const posttestPassed = posttestResult.rows.length > 0 && posttestResult.rows[0].passed;

    // 4. Weekly test attempted
    const weeklyResult = await pool.query(
      `SELECT id FROM posttest_attempts 
       WHERE student_id = $1 AND course_name = $2 LIMIT 1`,
      [studentId, courseName]
    );
    const weeklyDone = weeklyResult.rows.length > 0;

    // 5. Assessment submitted
    const assessmentResult = await pool.query(
      `SELECT id FROM assessment_submissions 
       WHERE student_id = $1 LIMIT 1`,
      [studentId]
    );
    const assessmentDone = assessmentResult.rows.length > 0;

    // 6. Practical video verified
    const practicalResult = await pool.query(
      `SELECT id FROM practical_submissions 
       WHERE student_id = $1 AND status = 'verified' LIMIT 1`,
      [studentId]
    );
    const practicalDone = practicalResult.rows.length > 0;

    // 7. Google review submitted
    const reviewResult = await pool.query(
      `SELECT id FROM student_google_reviews 
       WHERE student_id = $1 LIMIT 1`,
      [studentId]
    );
    const reviewDone = reviewResult.rows.length > 0;

    // 8. Feedback submitted
    const feedbackResult = await pool.query(
      `SELECT id FROM student_feedback 
       WHERE student_id = $1 LIMIT 1`,
      [studentId]
    );
    const feedbackDone = feedbackResult.rows.length > 0;

    // 9. Attendance 75%+
    const attendanceResult = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'Present') as present_count,
         COUNT(*) FILTER (WHERE status IS NOT NULL AND status != '') as total_count
       FROM attendance WHERE admission_id = $1`,
      [studentId]
    );
    const { present_count, total_count } = attendanceResult.rows[0];
    const attendancePercent = total_count > 0 ? Math.round((present_count / total_count) * 100) : 0;
    const attendanceDone = attendancePercent >= 75;

    // 10. Placement details uploaded
    const placementResult = await pool.query(
      `SELECT id FROM student_placements 
       WHERE student_id = $1 LIMIT 1`,
      [studentId]
    );
    const placementDone = placementResult.rows.length > 0;

    // ── Build conditions list ─────────────────────────────────────────────────
    const conditions = [
      { key: "fees", label: "Fees Cleared", passed: feesCleared, message: feesCleared ? "No balance due" : "Clear your pending balance" },
      { key: "pretest", label: "Pre-Test", passed: pretestPassed, message: pretestPassed ? "Passed" : "Take and pass the pre-test" },
      { key: "posttest", label: "Post-Test", passed: posttestPassed, message: posttestPassed ? "Passed" : "Take and pass the post-test" },
      { key: "weekly", label: "Weekly Test", passed: weeklyDone, message: weeklyDone ? "Completed" : "Complete the weekly test" },
      { key: "assessment", label: "Assessment", passed: assessmentDone, message: assessmentDone ? "Submitted" : "Submit your assessment" },
      { key: "practical", label: "Practical Video", passed: practicalDone, message: practicalDone ? "Verified" : "Submit and get practical video verified" },
      { key: "review", label: "Google Review", passed: reviewDone, message: reviewDone ? "Submitted" : "Submit your Google review" },
      { key: "feedback", label: "Feedback & Testimonial", passed: feedbackDone, message: feedbackDone ? "Submitted" : "Submit your feedback" },
      { key: "attendance", label: `Attendance (${attendancePercent}%)`, passed: attendanceDone, message: attendanceDone ? `${attendancePercent}% attendance` : `Need 75%+ attendance (current: ${attendancePercent}%)` },
      { key: "placement", label: "Placement Details", passed: placementDone, message: placementDone ? "Uploaded" : "Upload your placement details" },
    ];

    const allPassed = conditions.every(c => c.passed);
    const passedCount = conditions.filter(c => c.passed).length;

    res.json({
      student,
      conditions,
      allPassed,
      passedCount,
      totalConditions: conditions.length,
    });
  } catch (err) {
    console.error('GET /certificate-status error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
