// // routes/auth.js
// const express = require("express");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const pool = require("../config/db");

// const router = express.Router();
// const SECRET = "mysecret";

// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   const user = await pool.query(
//     "SELECT * FROM users WHERE email=$1",
//     [email]
//   );

//   if (user.rows.length === 0)
//     return res.status(400).json({ message: "User not found" });

//   const valid = await bcrypt.compare(
//     password,
//     user.rows[0].password
//   );

//   if (!valid)
//     return res.status(400).json({ message: "Invalid password" });

//   const token = jwt.sign(
//     { id: user.rows[0].id, role: user.rows[0].role },
//     SECRET,
//     { expiresIn: "1h" }
//   );

//   res.json({ token });
// });

// module.exports = router;

const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const pool    = require("../config/db");

const SECRET = process.env.JWT_SECRET || "mysecret";
console.log("✅ auth.js loaded successfully");

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/auth/login
// ══════════════════════════════════════════════════════════════════════════════
router.post("/login", async (req, res) => {
  try {
    console.log("🔍 Login attempt:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 1. Find user + role name
    console.log("🔍 Querying DB for:", email);
    const userResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.status,
              r.id   AS role_id,
              r.name AS role_name,
              sa.admission_number, sa.enquiry_id
       FROM   users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN student_admissions sa ON sa.email_id = u.email
       WHERE  u.email = $1
       LIMIT 1`,
      [email]
    );

    // 2. User not found
    console.log("🔍 User found:", userResult.rows.length > 0 ? "YES" : "NO");
    if (userResult.rows.length === 0)
      return res.status(401).json({ message: "Invalid email or password" });

    const user = userResult.rows[0];
    console.log("🔍 Status:", user.status, "| Role:", user.role_name);
    console.log("🔍 Hash preview:", user.password?.slice(0, 10));

    // 3. Check account status
    if (user.status !== "Active")
      return res.status(403).json({ message: "Account is inactive. Contact admin." });

    // 4. Compare password
    console.log("🔍 Comparing password...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password match:", isMatch);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    // 5. Fetch permissions for this role
    console.log("🔍 Fetching permissions for role_id:", user.role_id);
    const permResult = await pool.query(
      `SELECT module, can_view, can_add, can_edit, can_delete
       FROM   permissions
       WHERE  role_id = $1`,
      [user.role_id]
    );

    console.log("🔍 Permissions found:", permResult.rows.length);

    // 6. Convert permissions array → object map
    // { "Dashboard": { view: true, add: true, edit: true, delete: true }, ... }
    const permissions = {};
    permResult.rows.forEach((p) => {
      permissions[p.module] = {
        view:   p.can_view,
        add:    p.can_add,
        edit:   p.can_edit,
        delete: p.can_delete,
      };
    });

    // 7. Sign JWT
    const token = jwt.sign(
      {
        id:       user.id,
        roleId:   user.role_id,
        roleName: user.role_name,
      },
      SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ Login success:", email);

    // 8. Send response
    res.json({
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role_name,
        admission_number: user.admission_number || user.enquiry_id,
      },
      permissions,
    });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({
      message: "Server error",
      detail:  err.message   // ← now shows in Thunder Client
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/auth/me
// ══════════════════════════════════════════════════════════════════════════════
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);

    const userResult = await pool.query(
      `SELECT u.id, u.name AS full_name, u.email AS email_id, u.phone_number, u.dob AS date_of_birth,
              sp.gender, sp.location, sp.country, sp.hometown, sp.college_name, sp.degree AS course_name, sp.photo_url, sp.resume_url,
              sp.internships, sp.projects, sp.employment_history, sp.certifications, sp.preferred_job_type, sp.availability, sp.preferred_location, sp.education_history
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (userResult.rows.length === 0) return res.status(404).json({ message: "User not found" });

    res.json({ user: userResult.rows[0] });
  } catch (err) {
    console.error("Auth me error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PUT /api/auth/profile
// ══════════════════════════════════════════════════════════════════════════════
router.put("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);

    const { 
      full_name, gender, dob, location, country, hometown, mobile,
      skills, languages, academic_achievements, profile_summary, photo_url, resume_url,
      education, internships, projects, employments, certifications, preferences
    } = req.body;

    // Start a transaction
    await pool.query("BEGIN");

    // Update users table (basic info)
    await pool.query(
      "UPDATE users SET name = $1, phone_number = $2, dob = $3 WHERE id = $4",
      [full_name, mobile, dob, decoded.id]
    );

    // Upsert student_profiles table (extended info)
    // Map education.degree fields if present
    const degree = education?.degree?.course || "";
    const college = education?.degree?.college || "";

    await pool.query(
      `INSERT INTO student_profiles (
         user_id, gender, location, country, hometown, date_of_birth, phone_number,
         skills, languages, academic_achievements, profile_summary, photo_url, resume_url,
         degree, college_name, internships, projects, employment_history, certifications, preferred_job_type, availability, preferred_location, education_history
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         gender = EXCLUDED.gender,
         location = EXCLUDED.location,
         country = EXCLUDED.country,
         hometown = EXCLUDED.hometown,
         date_of_birth = EXCLUDED.date_of_birth,
         phone_number = EXCLUDED.phone_number,
         skills = EXCLUDED.skills,
         languages = EXCLUDED.languages,
         academic_achievements = EXCLUDED.academic_achievements,
         profile_summary = EXCLUDED.profile_summary,
         photo_url = EXCLUDED.photo_url,
          resume_url = EXCLUDED.resume_url,
         degree = EXCLUDED.degree,
         college_name = EXCLUDED.college_name,
          internships = EXCLUDED.internships,
          projects = EXCLUDED.projects,
          employment_history = EXCLUDED.employment_history,
          certifications = EXCLUDED.certifications,
          preferred_job_type = EXCLUDED.preferred_job_type,
          availability = EXCLUDED.availability,
          preferred_location = EXCLUDED.preferred_location,
          education_history = EXCLUDED.education_history,
         updated_at = CURRENT_TIMESTAMP`,
      [
        decoded.id, gender, location, country, hometown, dob, mobile,
        JSON.stringify(skills || []), 
        JSON.stringify(languages || []), 
        JSON.stringify(academic_achievements || []),
        profile_summary, photo_url, resume_url,
        degree, college,
        JSON.stringify(internships || []),
        JSON.stringify(projects || []),
        JSON.stringify(employments || []),
        JSON.stringify(certifications || []),
        preferences?.job_type || "Full Time",
        preferences?.availability || "Immediately",
        preferences?.location || "",
        JSON.stringify(education || {})
      ]
    );

    await pool.query("COMMIT");

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error", detail: err.message });
  }
});

module.exports = router;
