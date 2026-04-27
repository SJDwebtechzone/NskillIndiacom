router.get('/my-profile', async (req, res) => {
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
    console.error('GET /student/my-profile error:', err);
    res.status(500).json({ error: err.message });
  }
});