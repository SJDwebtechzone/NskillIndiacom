-- NSKILL Database Complete Schema

-- Table: modules
CREATE TABLE IF NOT EXISTS modules (
  id INTEGER NOT NULL DEFAULT nextval('modules_id_seq'::regclass),
  name CHARACTER VARYING(100) NOT NULL,
  slug CHARACTER VARYING(100) NOT NULL
);

-- Table: roles
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER NOT NULL DEFAULT nextval('roles_id_seq'::regclass),
  name CHARACTER VARYING(100) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: permissions
CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER NOT NULL DEFAULT nextval('permissions_id_seq'::regclass),
  role_id INTEGER NOT NULL,
  module CHARACTER VARYING(100) NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_add BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false
);

-- Table: accreditations
CREATE TABLE IF NOT EXISTS accreditations (
  id INTEGER NOT NULL DEFAULT nextval('accreditations_id_seq'::regclass),
  name CHARACTER VARYING(255) NOT NULL,
  organization CHARACTER VARYING(255) NOT NULL,
  logo_url CHARACTER VARYING(500),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: banners
CREATE TABLE IF NOT EXISTS banners (
  id INTEGER NOT NULL DEFAULT nextval('banners_id_seq'::regclass),
  title CHARACTER VARYING(255) NOT NULL,
  image_url CHARACTER VARYING(500) NOT NULL,
  link_url CHARACTER VARYING(500),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: latest_news
CREATE TABLE IF NOT EXISTS latest_news (
  id INTEGER NOT NULL DEFAULT nextval('latest_news_id_seq'::regclass),
  title CHARACTER VARYING(255) NOT NULL,
  content TEXT NOT NULL,
  image_url CHARACTER VARYING(500),
  author CHARACTER VARYING(100),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: popups
CREATE TABLE IF NOT EXISTS popups (
  id INTEGER NOT NULL DEFAULT nextval('popups_id_seq'::regclass),
  title CHARACTER VARYING(255),
  description TEXT,
  course_id CHARACTER VARYING(255),
  video_url TEXT,
  image_url TEXT,
  video_placement CHARACTER VARYING(100),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  position CHARACTER VARYING(100),
  manual_override BOOLEAN DEFAULT false,
  placement CHARACTER VARYING(100)
);

-- Table: settings
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER NOT NULL DEFAULT nextval('settings_id_seq'::regclass),
  key_name CHARACTER VARYING(255) NOT NULL,
  value TEXT,
  description CHARACTER VARYING(500),
  category CHARACTER VARYING(100),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: chat_logs
CREATE TABLE IF NOT EXISTS chat_logs (
  id INTEGER NOT NULL DEFAULT nextval('chat_logs_id_seq'::regclass),
  user_id INTEGER,
  message TEXT NOT NULL,
  sender_type CHARACTER VARYING(50) NOT NULL,
  session_id CHARACTER VARYING(255),
  ip_address CHARACTER VARYING(45),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: student_enquiries
CREATE TABLE IF NOT EXISTS student_enquiries (
  id INTEGER NOT NULL DEFAULT nextval('student_enquiries_id_seq'::regclass),
  enquiry_id CHARACTER VARYING(20) NOT NULL,
  enquiry_date DATE DEFAULT CURRENT_DATE,
  mode_of_enquiry CHARACTER VARYING(50),
  student_name CHARACTER VARYING(255) NOT NULL,
  gender CHARACTER VARYING(20),
  age CHARACTER VARYING(10),
  dob DATE,
  mobile_number CHARACTER VARYING(20),
  whatsapp_number CHARACTER VARYING(20),
  email_id CHARACTER VARYING(255),
  perm_address TEXT,
  perm_city CHARACTER VARYING(100),
  perm_state CHARACTER VARYING(100),
  perm_pin CHARACTER VARYING(20),
  curr_address TEXT,
  curr_city CHARACTER VARYING(100),
  curr_state CHARACTER VARYING(100),
  curr_pin CHARACTER VARYING(20),
  highest_qualification CHARACTER VARYING(100),
  year_of_passing CHARACTER VARYING(50),
  institution_name CHARACTER VARYING(255),
  career_objective CHARACTER VARYING(100),
  preferred_country CHARACTER VARYING(100),
  expected_salary CHARACTER VARYING(100),
  willing_to_work_all_india CHARACTER VARYING(10),
  work_experience CHARACTER VARYING(100),
  company_name CHARACTER VARYING(255),
  position CHARACTER VARYING(255),
  salary CHARACTER VARYING(100),
  location CHARACTER VARYING(255),
  skills_trade TEXT,
  father_name CHARACTER VARYING(255),
  mother_name CHARACTER VARYING(255),
  parent_contact CHARACTER VARYING(20),
  parent_occupation CHARACTER VARYING(255),
  referred_by CHARACTER VARYING(50),
  counsellor_name CHARACTER VARYING(255),
  counsellor_code CHARACTER VARYING(100),
  will_attend_test CHARACTER VARYING(10),
  course_interested CHARACTER VARYING(255),
  level_of_course CHARACTER VARYING(50),
  training_mode CHARACTER VARYING(50),
  batch_timing CHARACTER VARYING(50),
  counselling_date DATE,
  counselling_done_by CHARACTER VARYING(100),
  interest_level CHARACTER VARYING(50),
  follow_up_date DATE,
  remarks TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by_id INTEGER
);

-- Table: student_admissions
CREATE TABLE IF NOT EXISTS student_admissions (
  id INTEGER NOT NULL DEFAULT nextval('student_admissions_id_seq'::regclass),
  enquiry_id CHARACTER VARYING(20),
  admission_date DATE DEFAULT CURRENT_DATE,
  full_name CHARACTER VARYING(255) NOT NULL,
  gender CHARACTER VARYING(20) NOT NULL,
  dob DATE NOT NULL,
  age CHARACTER VARYING(10) NOT NULL,
  aadhaar_number CHARACTER VARYING(20) NOT NULL,
  passport_number CHARACTER VARYING(50),
  passport_validity DATE,
  photo_url TEXT,
  mobile_number CHARACTER VARYING(20) NOT NULL,
  alt_mobile_number CHARACTER VARYING(20),
  whatsapp_number CHARACTER VARYING(20) NOT NULL,
  email_id CHARACTER VARYING(255) NOT NULL,
  residential_address TEXT NOT NULL,
  city CHARACTER VARYING(100) NOT NULL,
  state CHARACTER VARYING(100) NOT NULL,
  pin_code CHARACTER VARYING(10) NOT NULL,
  parent_name CHARACTER VARYING(255) NOT NULL,
  relationship CHARACTER VARYING(100) NOT NULL,
  parent_mobile CHARACTER VARYING(20) NOT NULL,
  occupation CHARACTER VARYING(100) NOT NULL,
  annual_income CHARACTER VARYING(50),
  highest_qualification CHARACTER VARYING(100) NOT NULL,
  year_of_passing CHARACTER VARYING(50) NOT NULL,
  institution_name CHARACTER VARYING(255) NOT NULL,
  board_university CHARACTER VARYING(255) NOT NULL,
  medium_of_study CHARACTER VARYING(100) NOT NULL,
  technical_background TEXT,
  total_experience CHARACTER VARYING(50),
  industry_experience TEXT,
  skills_known TEXT,
  course_interested CHARACTER VARYING(255) NOT NULL,
  course_level CHARACTER VARYING(50) NOT NULL,
  mode_of_training CHARACTER VARYING(50) NOT NULL,
  batch_preference CHARACTER VARYING(100),
  training_location CHARACTER VARYING(255),
  career_goal CHARACTER VARYING(100) NOT NULL,
  preferred_country CHARACTER VARYING(100),
  expected_salary CHARACTER VARYING(50),
  willing_to_relocate CHARACTER VARYING(10) NOT NULL,
  counsellor_name CHARACTER VARYING(255) NOT NULL,
  counsellor_code CHARACTER VARYING(50) NOT NULL,
  referral_source CHARACTER VARYING(100) NOT NULL,
  counselling_date DATE NOT NULL,
  course_name CHARACTER VARYING(255) NOT NULL,
  course_fees NUMERIC NOT NULL DEFAULT 0,
  total_fees NUMERIC NOT NULL DEFAULT 0,
  paid_fees NUMERIC NOT NULL DEFAULT 0,
  payment_mode CHARACTER VARYING(50) NOT NULL,
  payment_ref_no CHARACTER VARYING(100),
  payment_date DATE NOT NULL,
  instalment_1 NUMERIC DEFAULT 0,
  instalment_2 NUMERIC DEFAULT 0,
  balance_amount NUMERIC NOT NULL DEFAULT 0,
  has_aadhaar_file TEXT,
  has_edu_certs_file TEXT,
  has_passport_file TEXT,
  has_resume_file TEXT,
  has_address_proof_file TEXT,
  has_photos_file TEXT,
  student_declaration BOOLEAN NOT NULL DEFAULT false,
  parent_declaration BOOLEAN NOT NULL DEFAULT false,
  placement_ack BOOLEAN NOT NULL DEFAULT false,
  overseas_disclaimer BOOLEAN DEFAULT false,
  discipline_ack BOOLEAN NOT NULL DEFAULT false,
  photo_consent BOOLEAN NOT NULL DEFAULT false,
  refund_policy_ack BOOLEAN NOT NULL DEFAULT false,
  data_privacy_ack BOOLEAN NOT NULL DEFAULT false,
  final_undertaking BOOLEAN NOT NULL DEFAULT false,
  emergency_contact_name CHARACTER VARYING(255) NOT NULL,
  emergency_contact_number CHARACTER VARYING(20) NOT NULL,
  emergency_authorized BOOLEAN NOT NULL DEFAULT false,
  admission_number CHARACTER VARYING(100),
  batch_allotted CHARACTER VARYING(100),
  verified_by CHARACTER VARYING(255),
  authorized_signature_by CHARACTER VARYING(255),
  status CHARACTER VARYING(50) DEFAULT 'Approved'::character varying,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by_id INTEGER
);

-- Table: career_counsellors
CREATE TABLE IF NOT EXISTS career_counsellors (
  id INTEGER NOT NULL DEFAULT nextval('career_counsellors_id_seq'::regclass),
  full_name CHARACTER VARYING(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender CHARACTER VARYING(20) NOT NULL,
  mobile_primary CHARACTER VARYING(15) NOT NULL,
  mobile_whatsapp CHARACTER VARYING(15),
  email CHARACTER VARYING(255) NOT NULL,
  residential_address TEXT NOT NULL,
  city CHARACTER VARYING(100) NOT NULL,
  district CHARACTER VARYING(100) NOT NULL,
  state CHARACTER VARYING(100) NOT NULL,
  pincode CHARACTER VARYING(10) NOT NULL,
  legislative_assembly CHARACTER VARYING(150),
  current_profession CHARACTER VARYING(100) NOT NULL,
  profession_other_specify CHARACTER VARYING(255),
  educational_qualification CHARACTER VARYING(255) NOT NULL,
  special_skill TEXT,
  specialisation TEXT[],
  languages_known TEXT[],
  languages_other CHARACTER VARYING(100),
  total_experience CHARACTER VARYING(50),
  experience_career_counselling CHARACTER VARYING(50),
  current_services_offered TEXT[],
  years_of_operation CHARACTER VARYING(50),
  avg_students_per_month INTEGER,
  students_last_3_years INTEGER,
  students_2024_25 INTEGER,
  students_2023_24 INTEGER,
  students_2022_23 INTEGER,
  has_office CHARACTER VARYING(50),
  office_no_street CHARACTER VARYING(255),
  office_area_name CHARACTER VARYING(255),
  office_location CHARACTER VARYING(255),
  office_district CHARACTER VARYING(100),
  office_city CHARACTER VARYING(100),
  office_pincode CHARACTER VARYING(10),
  office_legislative_assembly CHARACTER VARYING(150),
  office_area_sqft INTEGER,
  has_separate_counselling_room BOOLEAN,
  no_of_staff INTEGER,
  interested_in_setting_up_office CHARACTER VARYING(50),
  linkedin CHARACTER VARYING(255),
  instagram CHARACTER VARYING(255),
  facebook CHARACTER VARYING(255),
  partnership_areas TEXT[],
  expected_monthly_referrals INTEGER,
  file_photo CHARACTER VARYING(255),
  file_aadhaar_copy CHARACTER VARYING(255),
  file_pan_copy CHARACTER VARYING(255),
  file_gst_certificate CHARACTER VARYING(255),
  file_address_proof CHARACTER VARYING(255),
  bank_account_holder CHARACTER VARYING(255),
  bank_name_branch CHARACTER VARYING(255),
  account_number CHARACTER VARYING(50),
  ifsc_code CHARACTER VARYING(20),
  additional_info TEXT,
  password_hash TEXT,
  consent_agreed BOOLEAN NOT NULL DEFAULT false,
  consent_place CHARACTER VARYING(100),
  consent_date DATE,
  status CHARACTER VARYING(30) DEFAULT 'pending'::character varying,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Table: attendance
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER NOT NULL DEFAULT nextval('attendance_id_seq'::regclass),
  admission_id INTEGER,
  date DATE NOT NULL,
  batch CHARACTER VARYING(50) NOT NULL,
  status CHARACTER VARYING(20) NOT NULL,
  punch_in TIME WITHOUT TIME ZONE,
  punch_out TIME WITHOUT TIME ZONE,
  remarks TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  marked_by_id INTEGER
);

-- Table: associate_referral_points
CREATE TABLE IF NOT EXISTS associate_referral_points (
  id INTEGER NOT NULL DEFAULT nextval('associate_referral_points_id_seq'::regclass),
  associate_id INTEGER,
  admission_id INTEGER,
  student_name CHARACTER VARYING(255),
  course_fee NUMERIC,
  points_earned NUMERIC,
  is_settled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: contact_info
CREATE TABLE IF NOT EXISTS contact_info (
  id INTEGER NOT NULL DEFAULT nextval('contact_info_id_seq'::regclass),
  company_name CHARACTER VARYING(255),
  address TEXT,
  primary_phone CHARACTER VARYING(50),
  secondary_phone CHARACTER VARYING(50),
  whatsapp_number CHARACTER VARYING(50),
  email CHARACTER VARYING(255),
  map_embed_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  name CHARACTER VARYING(100) NOT NULL,
  email CHARACTER VARYING(150) NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  role_id INTEGER,
  status CHARACTER VARYING(20) DEFAULT 'Active'::character varying,
  phone_number CHARACTER VARYING(20),
  dob DATE
);


-- Layer 1: Core User Identity
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name CHARACTER VARYING(100) NOT NULL,            -- "Full name"
    email CHARACTER VARYING(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone_number CHARACTER VARYING(20),             -- "Mobile number"
    dob DATE,                                       -- "Date of birth"
    role_id INTEGER,
    status CHARACTER VARYING(20) DEFAULT 'Active',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Layer 2: Extended Student Profile
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Personal Information
    gender CHARACTER VARYING(20),                   -- Male/Female/Transgender
    location CHARACTER VARYING(255),                -- "Current location"
    country CHARACTER VARYING(100) DEFAULT 'India', -- "Country"
    hometown CHARACTER VARYING(100),                -- "Hometown"
    
    -- Career Preferences
    preferred_job_type TEXT,                        -- "Preferred job type"
    availability TEXT,                              -- "Availability to work"
    preferred_location TEXT,                        -- "Preferred location"
    
    -- Assets
    photo_url TEXT,                                 -- Profile Picture ??
    resume_url TEXT,                                -- "Resume" file link
    
    -- Multi-Entry & Complex Sections (JSONB)
    -- These power all "+ Add" buttons and the nested Education fields
    
    -- 1. Education History (Includes Higher Ed, Class XII, Class X)
    -- Structure: { "degree": {...}, "class12": {...}, "class10": {...} }
    education_history JSONB DEFAULT '{
        "degree": {"course": "", "specialization": "", "college": "", "grading": "", "from_year": "", "to_year": "", "type": ""},
        "class12": {"board": "", "medium": "", "percentage": "", "passing_year": ""},
        "class10": {"board": "", "medium": "", "percentage": "", "passing_year": ""}
    }',

    -- 2. Professional & Academic History (Arrays of Objects)
    skills JSONB DEFAULT '[]',                -- "Key skills"
    languages JSONB DEFAULT '[]',             -- "Languages known"
    internships JSONB DEFAULT '[]',           -- "Internships" (+ Add)
    projects JSONB DEFAULT '[]',              -- "Projects" (+ Add)
    employment_history JSONB DEFAULT '[]',    -- "Employment details" (+ Add)
    certifications JSONB DEFAULT '[]',        -- "Accomplishments" (+ Add)
    
    -- 3. Profile Summary
    profile_summary TEXT,                     -- "Profile summary"
    
    -- Metadata
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Layer 3: Performance Indexes
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Layer 4: Auto-Update Timestamp Trigger
CREATE OR REPLACE FUNCTION sync_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_update_profile_time
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE sync_updated_at();
