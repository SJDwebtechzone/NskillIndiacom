const pool = require('./config/db');

const query = `
-- 1. Main Profile Extension 
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    degree VARCHAR(255),
    college_name VARCHAR(255),
    location VARCHAR(255),
    gender VARCHAR(20),
    date_of_birth DATE,
    phone_number VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    profile_summary TEXT,
    resume_file_url VARCHAR(255),
    resume_uploaded_at TIMESTAMP WITHOUT TIME ZONE,
    profile_completion_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS career_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    preferred_job_type VARCHAR(255),
    availability VARCHAR(255),
    preferred_locations TEXT
);

CREATE TABLE IF NOT EXISTS education_details (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    education_level VARCHAR(50),
    degree_name VARCHAR(255),
    institution_name VARCHAR(255),
    location VARCHAR(255),
    passing_year INTEGER,
    score_percentage NUMERIC(5,2),
    is_full_time BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    skill_name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    language_name VARCHAR(100),
    proficiency VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS internships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    duration_text VARCHAR(100),
    start_date DATE,
    end_date DATE
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    project_title VARCHAR(255),
    duration_text VARCHAR(100),
    description TEXT
);

CREATE TABLE IF NOT EXISTS accomplishments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    type VARCHAR(50),
    title VARCHAR(255),
    issuer_or_institution VARCHAR(255),
    validity_or_date VARCHAR(255),
    description TEXT
);

CREATE TABLE IF NOT EXISTS employment_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    job_title VARCHAR(255),
    company_name VARCHAR(255),
    duration_text VARCHAR(100),
    description TEXT
);
`;

const migrate = async () => {
    try {
        await pool.query(query);
        console.log("Student Profile schema successfully imported into database!");
        process.exit(0);
    } catch (err) {
        console.error("Error migrating schema:", err);
        process.exit(1);
    }
};

migrate();
