--student reviews and feedback--

ALTER TABLE student_google_reviews ADD COLUMN IF NOT EXISTS completion_video_url TEXT DEFAULT NULL;
ALTER TABLE student_feedback ADD COLUMN IF NOT EXISTS testimonial_video_url TEXT DEFAULT NULL;

ALTER TABLE student_google_reviews 
ADD COLUMN youtube_subscribed BOOLEAN DEFAULT FALSE;

-- ============================================================
-- SQL Schema Update: Alter Existing POSTTEST Tables
-- Run this in your PostgreSQL database
-- ============================================================

-- 1. Alter posttest_questions to allow it to act as an upload request
ALTER TABLE posttest_questions ADD COLUMN IF NOT EXISTS is_upload BOOLEAN DEFAULT FALSE;
ALTER TABLE posttest_questions ADD COLUMN IF NOT EXISTS upload_type TEXT;

-- Since upload requests won't have options, drop NOT NULL from MCQ columns
ALTER TABLE posttest_questions ALTER COLUMN option_a DROP NOT NULL;
ALTER TABLE posttest_questions ALTER COLUMN option_b DROP NOT NULL;
ALTER TABLE posttest_questions ALTER COLUMN option_c DROP NOT NULL;
ALTER TABLE posttest_questions ALTER COLUMN option_d DROP NOT NULL;
ALTER TABLE posttest_questions ALTER COLUMN correct_ans DROP NOT NULL;

-- 2. Alter posttest_attempts to store the uploaded file
ALTER TABLE posttest_attempts ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE posttest_attempts ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE posttest_attempts ADD COLUMN IF NOT EXISTS review_note TEXT;
ALTER TABLE posttest_attempts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Verify the columns were added successfully:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('posttest_questions', 'posttest_attempts')
  AND column_name IN ('is_upload', 'upload_type', 'file_url', 'file_type', 'review_note', 'status');

  -- Schema for Just Dial Reviews

CREATE TABLE IF NOT EXISTS student_justdial_reviews (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_admissions(id) ON DELETE CASCADE,
    course_name VARCHAR(255),
    rating INTEGER DEFAULT 5,
    review_text TEXT,
    justdial_review_url TEXT,
    photo_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
--student reviews and feedback--

ALTER TABLE student_google_reviews ADD COLUMN IF NOT EXISTS completion_video_url TEXT DEFAULT NULL;
ALTER TABLE student_feedback ADD COLUMN IF NOT EXISTS testimonial_video_url TEXT DEFAULT NULL;

ALTER TABLE student_google_reviews 
ADD COLUMN youtube_subscribed BOOLEAN DEFAULT FALSE;

-- ============================================================
-- SQL Schema Update: Alter Existing POSTTEST Tables
-- Run this in your PostgreSQL database
-- ============================================================

-- 1. Alter posttest_questions to allow it to act as an upload request
ALTER TABLE posttest_questions ADD COLUMN IF NOT EXISTS is_upload BOOLEAN DEFAULT FALSE;
ALTER TABLE posttest_questions ADD COLUMN IF NOT EXISTS upload_type TEXT;

-- Since upload requests won't have options, drop NOT NULL from MCQ columns
ALTER TABLE posttest_questions ALTER COLUMN option_a DROP NOT NULL;
ALTER TABLE posttest_questions ALTER COLUMN option_b DROP NOT NULL;
ALTER TABLE posttest_questions ALTER COLUMN option_c DROP NOT NULL;
ALTER TABLE posttest_questions ALTER COLUMN option_d DROP NOT NULL;
ALTER TABLE posttest_questions ALTER COLUMN correct_ans DROP NOT NULL;

-- 2. Alter posttest_attempts to store the uploaded file
ALTER TABLE posttest_attempts ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE posttest_attempts ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE posttest_attempts ADD COLUMN IF NOT EXISTS review_note TEXT;
ALTER TABLE posttest_attempts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Verify the columns were added successfully:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('posttest_questions', 'posttest_attempts')
  AND column_name IN ('is_upload', 'upload_type', 'file_url', 'file_type', 'review_note', 'status');

  -- Schema for Just Dial Reviews

CREATE TABLE IF NOT EXISTS student_justdial_reviews (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_admissions(id) ON DELETE CASCADE,
    course_name VARCHAR(255),
    rating INTEGER DEFAULT 5,
    review_text TEXT,
    justdial_review_url TEXT,
    photo_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_video_url TEXT
);

------------------------------
-------------ADMISSION FORM----------------------
ALTER TABLE student_admissions 
ADD COLUMN other_or_miscellaneous VARCHAR(255);

ALTER TABLE student_admissions 
ADD COLUMN district VARCHAR(255);

ALTER TABLE student_admissions 
ADD COLUMN qualification_course_name VARCHAR(255);

ALTER TABLE student_admissions
ADD COLUMN discount_fee NUMERIC(10,2) DEFAULT 0,
ADD COLUMN discount_remark TEXT;

----------------------------------------
------------------ENQUIRIES FORM----------------------

ALTER TABLE student_enquiries 
ADD COLUMN district VARCHAR(255);

ALTER TABLE student_enquiries 
ADD COLUMN qualification_course_name VARCHAR(255);

----------------------------------------
------------------PARTNERS FORM----------------------
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_logo TEXT NOT NULL,
    website_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-----------------------------------------------------
-------------Advertisement Form----------------------
CREATE TABLE IF NOT EXISTS advertisements (
    id SERIAL PRIMARY KEY,
    image VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Extend the jobs table for dynamic mail templates
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS use_default_email BOOLEAN DEFAULT TRUE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS thank_you_template_id INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS reminder_template_id INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS enable_reminder BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS event_date DATE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS event_time VARCHAR(50);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS event_location VARCHAR(255);

-- Optional: Add Foreign Key constraints if you want strict referential integrity
-- ALTER TABLE jobs ADD CONSTRAINT fk_thank_you_template FOREIGN KEY (thank_you_template_id) REFERENCES mail_templates(id) ON DELETE SET NULL;
-- ALTER TABLE jobs ADD CONSTRAINT fk_reminder_template FOREIGN KEY (reminder_template_id) REFERENCES mail_templates(id) ON DELETE SET NULL;