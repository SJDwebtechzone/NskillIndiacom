// backend/routes/dashboard.js
const express = require("express");
const router  = express.Router();
const pool    = require("../config/db");

// GET /api/dashboard/stats
router.get("/stats", async (req, res) => {
  try {

    // ── 1. Core counts ─────────────────────────────────────────────────────────
    const countsQuery = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM student_admissions)::int                                     AS total_students,
        (SELECT COUNT(*) FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE r.name = 'Associate')::int                                                  AS total_associates,
        (SELECT COUNT(*) FROM student_enquiries)::int                                      AS total_enquiries,
        (SELECT COUNT(*) FROM student_admissions)::int                                     AS total_admissions,
        (SELECT COUNT(*) FROM student_enquiries
         WHERE referred_by IS NULL OR TRIM(referred_by) = '')::int                         AS direct_enquiries,
        (SELECT COUNT(DISTINCT admission_id) FROM associate_referral_points)::int          AS associate_admissions,
        (SELECT COALESCE(SUM(paid_fees), 0)
         FROM student_admissions
         WHERE DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', NOW()))::numeric    AS revenue_this_month,
        (SELECT COUNT(*) FROM student_admissions WHERE balance_amount > 0)::int            AS pending_fees_count,
        (SELECT COALESCE(SUM(balance_amount), 0)
         FROM student_admissions WHERE balance_amount > 0)::numeric                        AS pending_fees_amount
    `);

    // ── 2. Student status ──────────────────────────────────────────────────────
    const statusQuery = await pool.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE batch_allotted IS NOT NULL
          AND TRIM(batch_allotted) != ''
          AND status != 'Completed'
        )::int AS ongoing,
        COUNT(*) FILTER (WHERE status = 'Completed')::int AS completed,
        COUNT(*) FILTER (
          WHERE batch_allotted IS NULL OR TRIM(batch_allotted) = ''
        )::int AS pending
      FROM student_admissions
    `);

    // ── 3. Monthly trends — last 6 months (fixed: renamed "asc" → "assoc") ────
    const monthlyQuery = await pool.query(`
      SELECT
        TO_CHAR(month_series, 'Mon YY')  AS month,
        TO_CHAR(month_series, 'YYYY-MM') AS month_key,
        COALESCE(adm.cnt,    0)::int     AS admissions,
        COALESCE(enq.cnt,    0)::int     AS enquiries,
        COALESCE(assoc.cnt,  0)::int     AS associates,
        COALESCE(rev.amount, 0)::numeric AS revenue
      FROM generate_series(
        DATE_TRUNC('month', NOW() - INTERVAL '5 months'),
        DATE_TRUNC('month', NOW()),
        INTERVAL '1 month'
      ) AS month_series

      LEFT JOIN (
        SELECT DATE_TRUNC('month', created_at) AS m, COUNT(*) AS cnt
        FROM student_admissions
        GROUP BY m
      ) adm ON adm.m = month_series

      LEFT JOIN (
        SELECT DATE_TRUNC('month', created_at) AS m, COUNT(*) AS cnt
        FROM student_enquiries
        GROUP BY m
      ) enq ON enq.m = month_series

      LEFT JOIN (
        SELECT DATE_TRUNC('month', u.created_at) AS m, COUNT(*) AS cnt
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE r.name = 'Associate'
        GROUP BY m
      ) assoc ON assoc.m = month_series

      LEFT JOIN (
        SELECT DATE_TRUNC('month', payment_date) AS m, SUM(paid_fees) AS amount
        FROM student_admissions
        WHERE payment_date IS NOT NULL
        GROUP BY m
      ) rev ON rev.m = month_series

      ORDER BY month_series ASC
    `);

    // ── 4. Pending fees list ───────────────────────────────────────────────────
    const pendingFeesQuery = await pool.query(`
      SELECT
        full_name,
        course_name,
        mobile_number,
        balance_amount,
        total_fees,
        paid_fees,
        payment_date,
        admission_number,
        batch_allotted
      FROM student_admissions
      WHERE balance_amount > 0
      ORDER BY balance_amount DESC
      LIMIT 20
    `);

    // ── 5. Students by course category ────────────────────────────────────────
    const categoryQuery = await pool.query(`
      SELECT
        course_interested AS category,
        COUNT(*)::int     AS count
      FROM student_admissions
      WHERE course_interested IS NOT NULL
        AND TRIM(course_interested) != ''
      GROUP BY course_interested
      ORDER BY count DESC
      LIMIT 10
    `);

    // ── 6. Recent bookings ─────────────────────────────────────────────────────
    const bookingsQuery = await pool.query(`
      SELECT
        b.name,
        b.phone,
        b.email,
        b.demo_date,
        b.demo_time,
        c.title AS course_name,
        b.created_at
      FROM bookings b
      LEFT JOIN courses c ON b.course_id = c.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    // ── 7. Recent leads ────────────────────────────────────────────────────────
    const leadsQuery = await pool.query(`
      SELECT
        l.name,
        l.phone,
        l.email,
        c.title AS course_name,
        l.created_at
      FROM leads l
      LEFT JOIN courses c ON l.course_id = c.id
      ORDER BY l.created_at DESC
      LIMIT 5
    `);

    // ── 8. Leads + bookings trend ──────────────────────────────────────────────
    const trendsQuery = await pool.query(`
      SELECT
        TO_CHAR(month_series, 'Mon YY') AS month,
        COALESCE(ld.cnt, 0)::int        AS leads,
        COALESCE(bk.cnt, 0)::int        AS bookings
      FROM generate_series(
        DATE_TRUNC('month', NOW() - INTERVAL '5 months'),
        DATE_TRUNC('month', NOW()),
        INTERVAL '1 month'
      ) AS month_series

      LEFT JOIN (
        SELECT DATE_TRUNC('month', created_at) AS m, COUNT(*) AS cnt
        FROM leads
        GROUP BY m
      ) ld ON ld.m = month_series

      LEFT JOIN (
        SELECT DATE_TRUNC('month', created_at) AS m, COUNT(*) AS cnt
        FROM bookings
        GROUP BY m
      ) bk ON bk.m = month_series

      ORDER BY month_series ASC
    `);

    // ── Respond ────────────────────────────────────────────────────────────────
    res.json({
      counts:                countsQuery.rows[0],
      student_status:        statusQuery.rows[0],
      monthly_trends:        monthlyQuery.rows,
      pending_fees_list:     pendingFeesQuery.rows,
      category_distribution: categoryQuery.rows,
      recent_bookings:       bookingsQuery.rows,
      recent_leads:          leadsQuery.rows,
      leads_bookings_trend:  trendsQuery.rows,
    });

  } catch (err) {
    console.error("GET /api/dashboard/stats error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

module.exports = router;
