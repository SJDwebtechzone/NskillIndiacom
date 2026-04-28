const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ GET all events
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM course_events ORDER BY start_date ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ CREATE event
router.post("/", async (req, res) => {
  try {
    const { title, description, course_name, start_date, end_date, event_type } =
      req.body;

    const result = await db.query(
      `INSERT INTO course_events 
       (title, description, course_name, start_date, end_date, event_type)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, description, course_name, start_date, end_date, event_type]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert error" });
  }
});

// ✅ UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, course_name, start_date, end_date, event_type } =
      req.body;

    const result = await db.query(
      `UPDATE course_events SET 
       title=$1, description=$2, course_name=$3,
       start_date=$4, end_date=$5, event_type=$6
       WHERE id=$7 RETURNING *`,
      [title, description, course_name, start_date, end_date, event_type, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Update error" });
  }
});

// ✅ DELETE
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM course_events WHERE id=$1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete error" });
  }
});

module.exports = router;