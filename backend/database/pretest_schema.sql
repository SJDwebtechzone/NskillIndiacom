-- =============================================
-- PRETEST MODULE - DATABASE SCHEMA
-- =============================================

-- Step 1A: Pretest Config (pass mark + timer per module)
CREATE TABLE IF NOT EXISTS pretest_config (
  id           SERIAL PRIMARY KEY,
  module_id    INT REFERENCES modules(id) ON DELETE CASCADE,
  total_qs     INT DEFAULT 20,
  pass_percent INT DEFAULT 60,      -- 60% = 12/20 to pass
  time_limit   INT DEFAULT 1200,    -- 1200 seconds = 20 mins
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Step 1B: Questions Table
CREATE TABLE IF NOT EXISTS pretest_questions (
  id           SERIAL PRIMARY KEY,
  module_id    INT REFERENCES modules(id) ON DELETE CASCADE,
  question     TEXT NOT NULL,
  option_a     VARCHAR(255) NOT NULL,
  option_b     VARCHAR(255) NOT NULL,
  option_c     VARCHAR(255) NOT NULL,
  option_d     VARCHAR(255) NOT NULL,
  correct_ans  VARCHAR(1) NOT NULL CHECK (correct_ans IN ('A','B','C','D')),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Step 1C: Attempts Table (one per user per module)
CREATE TABLE IF NOT EXISTS pretest_attempts (
  id           SERIAL PRIMARY KEY,
  user_id      INT REFERENCES users(id) ON DELETE CASCADE,
  module_id    INT REFERENCES modules(id) ON DELETE CASCADE,
  score        INT DEFAULT 0,
  total        INT DEFAULT 20,
  passed       BOOLEAN DEFAULT FALSE,
  time_taken   INT,                  -- seconds taken to complete
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Step 1D: Answers Table (each question response per attempt)
CREATE TABLE IF NOT EXISTS pretest_answers (
  id           SERIAL PRIMARY KEY,
  attempt_id   INT REFERENCES pretest_attempts(id) ON DELETE CASCADE,
  question_id  INT REFERENCES pretest_questions(id),
  selected_ans VARCHAR(1),           -- NULL means skipped
  is_correct   BOOLEAN DEFAULT FALSE
);