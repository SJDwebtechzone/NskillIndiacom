const express = require("express");
const router = express.Router();
const pool = require("../config/db");
// Using existing authMiddleware
const { authMiddleware, checkPermission } = require("../middleware/authMiddleware");

// List of modules and their corresponding tables for restore
const RESTORE_MODULES = [
  { name: "Enquiry", table: "student_enquiries", titleCol: "student_name" },
  { name: "Admission", table: "student_admissions", titleCol: "full_name" },
  { name: "User", table: "users", titleCol: "name" },
  { name: "Course", table: "courses", titleCol: "title" },
  { name: "Job", table: "jobs", titleCol: "title" },
  { name: "Associate", table: "career_counsellors", titleCol: "full_name" },
  { name: "Contact Location", table: "contact_locations", titleCol: "location_name" },
  { name: "Popup", table: "popups", titleCol: "title" },
  { name: "News", table: "latest_news", titleCol: "title" },
  { name: "Accreditation", table: "accreditations", titleCol: "title" },
  { name: "Background Image", table: "background_images", titleCol: "'Background Image'" }, // No title column
  { name: "Applied Job", table: "job_applications", titleCol: "name" },
  { name: "Placement", table: "student_placements", titleCol: "company_name" },
];

// 1. Fetch all deleted records
router.get("/", authMiddleware, checkPermission("NTSC Admin", "view"), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Temporarily allow seeing deleted records
    await client.query("SET LOCAL app.show_deleted = 'true'");

    let allDeleted = [];

    for (const mod of RESTORE_MODULES) {
      try {
        const query = `
          SELECT 
            id, 
            ${mod.titleCol} AS title,
            is_deleted,
            deleted_at,
            deleted_by,
            '${mod.name}' AS module_name,
            '${mod.table}' AS table_name
          FROM ${mod.table}
          WHERE is_deleted = true
        `;
        const result = await client.query(query);
        allDeleted = allDeleted.concat(result.rows);
      } catch (err) {
        console.error(`Error fetching deleted from ${mod.table}:`, err.message);
      }
    }

    await client.query("COMMIT");

    // Enhance with Days Remaining & Deleted By Name
    // We fetch user names for deleted_by
    const userIds = [...new Set(allDeleted.map(r => r.deleted_by).filter(Boolean))];
    let userMap = {};
    if (userIds.length > 0) {
      const usersRes = await pool.query(`SELECT id, name FROM users WHERE id = ANY($1)`, [userIds]);
      usersRes.rows.forEach(u => userMap[u.id] = u.name);
    }

    const now = new Date();
    const enriched = allDeleted.map(record => {
      const deletedAt = new Date(record.deleted_at);
      const diffTime = Math.abs(now - deletedAt);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, 30 - diffDays);

      return {
        ...record,
        deleted_by_name: userMap[record.deleted_by] || 'System',
        days_remaining: daysRemaining,
        status: daysRemaining === 0 ? 'Expired' : 'Pending Delete'
      };
    });

    // Sort by most recently deleted
    enriched.sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at));

    res.json(enriched);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Restore GET Error:", error);
    res.status(500).json({ error: "Failed to fetch deleted records" });
  } finally {
    client.release();
  }
});

// 2. Restore a record
router.post("/:table/:id", authMiddleware, checkPermission("NTSC Admin", "edit"), async (req, res) => {
  const { table, id } = req.params;
  const userId = req.user.id;

  // Validate table to prevent SQL injection
  const mod = RESTORE_MODULES.find(m => m.table === table);
  if (!mod) return res.status(400).json({ error: "Invalid table" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL app.show_deleted = 'true'");

    await client.query(`
      UPDATE ${table} 
      SET is_deleted = false, deleted_at = NULL, deleted_by = NULL 
      WHERE id = $1
    `, [id]);

    await client.query(`
      INSERT INTO audit_logs (user_id, action, module, record_id)
      VALUES ($1, 'RESTORE', $2, $3)
    `, [userId, mod.name, id]);

    await client.query("COMMIT");
    res.json({ message: "Record restored successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Restore POST Error:", error);
    res.status(500).json({ error: "Failed to restore record" });
  } finally {
    client.release();
  }
});

// 3. Permanently Delete a record
router.delete("/permanent/:table/:id", authMiddleware, checkPermission("NTSC Admin", "delete"), async (req, res) => {
  const { table, id } = req.params;
  const userId = req.user.id;

  const mod = RESTORE_MODULES.find(m => m.table === table);
  if (!mod) return res.status(400).json({ error: "Invalid table" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL app.show_deleted = 'true'");

    await client.query(`DELETE FROM ${table} WHERE id = $1`, [id]);

    await client.query(`
      INSERT INTO audit_logs (user_id, action, module, record_id)
      VALUES ($1, 'PERMANENT_DELETE', $2, $3)
    `, [userId, mod.name, id]);

    await client.query("COMMIT");
    res.json({ message: "Record permanently deleted" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Permanent DELETE Error:", error);
    res.status(500).json({ error: "Failed to permanently delete record" });
  } finally {
    client.release();
  }
});

module.exports = router;
