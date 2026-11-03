-- ============================================================================
-- GovAssist PostgreSQL-Compatible Database Schema (Separated Domains)
-- TODO [PRODUCTION DATABASE INTEGRATION]:
-- Connect server/adapters/databaseAdapter.ts to a managed PostgreSQL instance
-- (e.g., Cloud SQL for PostgreSQL / Supabase / Neon) using connection pooling
-- and column-level encryption for citizen tables.
-- Guest sessions MUST NOT be written to persistent tables; use Redis / memory
-- with a short TTL (e.g., 30 minutes).
-- ============================================================================

-- 1. User Accounts & Profiles (Strictly separated from Admin & Analytics)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY,
  masked_phone VARCHAR(20) NOT NULL,
  state_code VARCHAR(10) NOT NULL DEFAULT 'TN',
  district VARCHAR(100),
  age INTEGER,
  residence_type VARCHAR(20),
  occupation VARCHAR(50),
  annual_household_income_inr INTEGER,
  marital_vulnerability VARCHAR(40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Family Members (Household > Persons; never copies parent's category to child)
CREATE TABLE IF NOT EXISTS family_members (
  member_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  relation VARCHAR(30) NOT NULL,
  label VARCHAR(100) NOT NULL,
  age INTEGER,
  is_student BOOLEAN,
  education_level VARCHAR(40),
  independent_disability_status VARCHAR(40),
  independent_community_category VARCHAR(40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Scheme Catalogue
CREATE TABLE IF NOT EXISTS scheme_catalogue (
  scheme_id VARCHAR(80) PRIMARY KEY,
  scheme_code VARCHAR(40) UNIQUE NOT NULL,
  is_sample_placeholder BOOLEAN NOT NULL DEFAULT TRUE,
  level VARCHAR(20) NOT NULL,
  state_code VARCHAR(20) NOT NULL,
  applicable_locations TEXT NOT NULL,
  department_json JSONB NOT NULL,
  title_json JSONB NOT NULL,
  short_summary_json JSONB NOT NULL,
  benefits_json JSONB NOT NULL,
  requires_departmental_inspection BOOLEAN NOT NULL DEFAULT FALSE,
  inspection_note_json JSONB,
  official_link TEXT NOT NULL,
  official_source_url TEXT NOT NULL,
  last_verified_date DATE NOT NULL,
  next_review_due_date DATE NOT NULL,
  verification_status VARCHAR(30) NOT NULL,
  workflow_status VARCHAR(20) NOT NULL DEFAULT 'draft',
  last_edited_by_staff_id VARCHAR(120) NOT NULL,
  last_approved_by_staff_id VARCHAR(120),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Structured Eligibility Rules (Deterministic, No Free-Text Rules)
CREATE TABLE IF NOT EXISTS eligibility_rules (
  rule_id VARCHAR(80) PRIMARY KEY,
  scheme_id VARCHAR(80) NOT NULL REFERENCES scheme_catalogue(scheme_id) ON DELETE CASCADE,
  field_key VARCHAR(60) NOT NULL,
  operator VARCHAR(20) NOT NULL,
  expected_value_json JSONB NOT NULL,
  label_json JSONB NOT NULL,
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  why_we_ask_note_json JSONB,
  requires_official_verification BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. Documents & Application Guidance
CREATE TABLE IF NOT EXISTS documents_and_guidance (
  doc_id VARCHAR(80) NOT NULL,
  scheme_id VARCHAR(80) NOT NULL REFERENCES scheme_catalogue(scheme_id) ON DELETE CASCADE,
  name_json JSONB NOT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  issuing_authority TEXT NOT NULL,
  how_to_get_json JSONB,
  application_routes_json JSONB NOT NULL,
  PRIMARY KEY (doc_id, scheme_id)
);

-- 6. Saved Schemes
CREATE TABLE IF NOT EXISTS saved_schemes (
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  scheme_id VARCHAR(80) NOT NULL REFERENCES scheme_catalogue(scheme_id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, scheme_id)
);

-- 7. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'ta',
  preferred_input_mode VARCHAR(10) NOT NULL DEFAULT 'voice',
  lite_mode BOOLEAN NOT NULL DEFAULT FALSE,
  dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
  text_scale VARCHAR(10) NOT NULL DEFAULT '100',
  opt_in_sms_reminders BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Consent Records (Stored with Timestamp, Text Version, and Language)
CREATE TABLE IF NOT EXISTS consent_records (
  consent_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  policy_version VARCHAR(30) NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  consented_items_json JSONB NOT NULL,
  consent_statement_text TEXT NOT NULL
);

-- 9. Follow-Up & Reminder Info
CREATE TABLE IF NOT EXISTS follow_up_info (
  follow_up_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  scheme_id VARCHAR(80) NOT NULL,
  reminder_channel VARCHAR(20) NOT NULL DEFAULT 'sms_placeholder',
  scheduled_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
);

-- 10. Anonymous Analytics & Citizen Problem Reports (No Personal Identifiers)
CREATE TABLE IF NOT EXISTS anonymous_feedback_reports (
  report_id UUID PRIMARY KEY,
  scheme_id VARCHAR(80) NOT NULL,
  scheme_code VARCHAR(40) NOT NULL,
  issue_type VARCHAR(40) NOT NULL,
  comment TEXT NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'open'
);

-- 11. Admin & Verification Audit Records (Maker-Checker Governance)
CREATE TABLE IF NOT EXISTS admin_verification_records (
  audit_id UUID PRIMARY KEY,
  scheme_id VARCHAR(80) NOT NULL,
  action VARCHAR(40) NOT NULL,
  staff_id VARCHAR(120) NOT NULL,
  previous_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  official_source_url TEXT NOT NULL,
  verified_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
