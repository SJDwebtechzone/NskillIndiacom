const pool = require('../config/db');

// ─── GET ALL MODULES ───────────────────────────────────────
const getModules = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description FROM modules ORDER BY id'
    );
    res.json({ modules: result.rows });
  } catch (err) {
    console.error('getModules error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET ALL QUESTIONS FOR A MODULE ───────────────────────
const getQuestions = async (req, res) => {
  const { moduleId } = req.params;
  try {
    const moduleResult = await pool.query(
      'SELECT name FROM modules WHERE id = $1',
      [moduleId]
    );
    const questions = await pool.query(
      'SELECT * FROM pretest_questions WHERE module_id = $1 ORDER BY id',
      [moduleId]
    );
    res.json({
      moduleName: moduleResult.rows[0]?.name || '',
      questions: questions.rows,
    });
  } catch (err) {
    console.error('getQuestions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET SINGLE QUESTION ───────────────────────────────────
const getQuestionById = async (req, res) => {
  const { qId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM pretest_questions WHERE id = $1',
      [qId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ question: result.rows[0] });
  } catch (err) {
    console.error('getQuestionById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── ADD QUESTION ──────────────────────────────────────────
const addQuestion = async (req, res) => {
  const { moduleId } = req.params;
  const { question, option_a, option_b, option_c, option_d, correct_ans } = req.body;

  if (!question || !option_a || !option_b || !option_c || !option_d || !correct_ans) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check max 20 questions
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM pretest_questions WHERE module_id = $1',
      [moduleId]
    );
    if (parseInt(countResult.rows[0].count) >= 20) {
      return res.status(400).json({ message: 'Maximum 20 questions allowed per module' });
    }

    const result = await pool.query(
      `INSERT INTO pretest_questions 
        (module_id, question, option_a, option_b, option_c, option_d, correct_ans)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [moduleId, question, option_a, option_b, option_c, option_d, correct_ans]
    );
    res.status(201).json({ question: result.rows[0] });
  } catch (err) {
    console.error('addQuestion error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── UPDATE QUESTION ───────────────────────────────────────
const updateQuestion = async (req, res) => {
  const { qId } = req.params;
  const { question, option_a, option_b, option_c, option_d, correct_ans } = req.body;

  try {
    const result = await pool.query(
      `UPDATE pretest_questions
       SET question=$1, option_a=$2, option_b=$3, option_c=$4, option_d=$5, correct_ans=$6
       WHERE id=$7
       RETURNING *`,
      [question, option_a, option_b, option_c, option_d, correct_ans, qId]
    );
    res.json({ question: result.rows[0] });
  } catch (err) {
    console.error('updateQuestion error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── DELETE QUESTION ───────────────────────────────────────
const deleteQuestion = async (req, res) => {
  const { qId } = req.params;
  try {
    await pool.query('DELETE FROM pretest_questions WHERE id = $1', [qId]);
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('deleteQuestion error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET CONFIG ────────────────────────────────────────────
const getConfig = async (req, res) => {
  const { moduleId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM pretest_config WHERE module_id = $1',
      [moduleId]
    );
    res.json({ config: result.rows[0] || null });
  } catch (err) {
    console.error('getConfig error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── SAVE CONFIG (INSERT or UPDATE) ───────────────────────
const saveConfig = async (req, res) => {
  const { moduleId } = req.params;
  const { total_qs, pass_percent, time_limit } = req.body;

  try {
    // Check if config already exists
    const existing = await pool.query(
      'SELECT id FROM pretest_config WHERE module_id = $1',
      [moduleId]
    );

    if (existing.rows.length > 0) {
      // Update
      await pool.query(
        `UPDATE pretest_config
         SET total_qs=$1, pass_percent=$2, time_limit=$3
         WHERE module_id=$4`,
        [total_qs, pass_percent, time_limit, moduleId]
      );
    } else {
      // Insert
      await pool.query(
        `INSERT INTO pretest_config (module_id, total_qs, pass_percent, time_limit)
         VALUES ($1, $2, $3, $4)`,
        [moduleId, total_qs, pass_percent, time_limit]
      );
    }

    res.json({ message: 'Config saved successfully' });
  } catch (err) {
    console.error('saveConfig error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getModules,
  getQuestions,
  getQuestionById,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getConfig,
  saveConfig,
};