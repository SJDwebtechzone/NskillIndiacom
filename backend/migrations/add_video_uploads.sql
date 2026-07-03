-- ============================================================
-- Schema Migration: Add video upload columns
-- Run this in your PostgreSQL database
-- ============================================================

-- 1. Add completion_video_url to student_google_reviews (for Google Review)
ALTER TABLE student_google_reviews
  ADD COLUMN IF NOT EXISTS completion_video_url TEXT DEFAULT NULL;

-- 2. Add testimonial_video_url to student_feedback (for Feedback & Testimonial)
ALTER TABLE student_feedback
  ADD COLUMN IF NOT EXISTS testimonial_video_url TEXT DEFAULT NULL;

-- Verify changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'student_google_reviews' AND column_name = 'completion_video_url';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'student_feedback' AND column_name = 'testimonial_video_url';
