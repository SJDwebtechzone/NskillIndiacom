const express = require("express");
const router  = express.Router();
const pool    = require("../config/db");
const { authMiddleware } = require("../middleware/authMiddleware");

// GET /api/roles — all roles
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM roles WHERE is_deleted = false ORDER BY created_at DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/roles/:id/permissions — role + all modules with permissions
router.get("/:id/permissions", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const roleRes = await pool.query(
      "SELECT * FROM roles WHERE id = $1 AND is_deleted = false", [id]
    );
    if (!roleRes.rows.length)
      return res.status(404).json({ success: false, message: "Role not found" });

    const { rows } = await pool.query(
      `SELECT
         m.id   AS module_id,
         m.name AS module_name,
         m.slug,
         COALESCE(p.can_view,   false) AS can_view,
         COALESCE(p.can_add,    false) AS can_add,
         COALESCE(p.can_edit,   false) AS can_edit,
         COALESCE(p.can_delete, false) AS can_delete
       FROM modules m
       LEFT JOIN permissions p
         ON p.module = m.slug AND p.role_id = $1 AND p.is_deleted = false
       WHERE m.is_deleted = false
       ORDER BY m.name`,
      [id]
    );

    res.json({
      success: true,
      data: { role: roleRes.rows[0], permissions: rows }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/roles — create role
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ success: false, message: "Name required" });

    const { rows } = await pool.query(
      "INSERT INTO roles (name) VALUES ($1) RETURNING *",
      [name.trim()]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ success: false, message: "Role already exists" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/roles/:id — update role name
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const { rows } = await pool.query(
      "UPDATE roles SET name = $1 WHERE id = $2 RETURNING *",
      [name, req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/roles/:id/permissions — save permissions
router.put("/:id/permissions", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    await client.query("BEGIN");
    await client.query("UPDATE permissions SET is_deleted = true, deleted_at = NOW() WHERE role_id = $1", [id]);

    // Deduplicate permissions array by module_slug to prevent Postgres constraint violations
    const uniquePermissions = [];
    const seenModules = new Set();
    for (const p of permissions) {
        if (!p.module_slug || p.module_slug.trim() === '') continue;
        if (!seenModules.has(p.module_slug)) {
            seenModules.add(p.module_slug);
            uniquePermissions.push(p);
        }
    }

    for (const p of uniquePermissions) {
      if (p.can_view || p.can_add || p.can_edit || p.can_delete) {
        await client.query(
          `INSERT INTO permissions (role_id, module, can_view, can_add, can_edit, can_delete, is_deleted, deleted_at)
           VALUES ($1, $2, $3, $4, $5, $6, false, NULL)
           ON CONFLICT (role_id, module)
           DO UPDATE SET
             can_view = EXCLUDED.can_view,
             can_add = EXCLUDED.can_add,
             can_edit = EXCLUDED.can_edit,
             can_delete = EXCLUDED.can_delete,
             is_deleted = EXCLUDED.is_deleted,
             deleted_at = EXCLUDED.deleted_at`,
          [id, p.module_slug, !!p.can_view, !!p.can_add, !!p.can_edit, !!p.can_delete]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "Permissions saved" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;