
const pool = require('./config/db');
async function run() {
  const courseName = 'basic refrigeration and air condition trainning';
  const result = await pool.query(
    'SELECT id, question FROM pretest_questions WHERE TRIM(LOWER(course_name)) = \ AND is_deleted = false',
    [courseName.trim().toLowerCase()]
  );
  console.log('QUESTIONS:', result.rows);
  process.exit(0);
}
run();

