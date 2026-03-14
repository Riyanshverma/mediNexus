-- Migration: 001_doctor_profile_columns
-- Adds proper first-class columns to the doctors table for profile data
-- that was previously crammed into the prescription_template JSON field.
--
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).

ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS qualifications        TEXT,
  ADD COLUMN IF NOT EXISTS registration_number   TEXT,
  ADD COLUMN IF NOT EXISTS experience_years      INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS consultation_fee      NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS department            TEXT,
  ADD COLUMN IF NOT EXISTS bio                   TEXT,
  ADD COLUMN IF NOT EXISTS available_from        TEXT,   -- HH:MM e.g. "09:00"
  ADD COLUMN IF NOT EXISTS available_to          TEXT,   -- HH:MM e.g. "17:00"
  ADD COLUMN IF NOT EXISTS slot_duration_mins    INTEGER DEFAULT 15;

-- Optional: add a comment so it's clear what the columns represent
COMMENT ON COLUMN doctors.qualifications       IS 'e.g. MBBS, MD - Cardiology';
COMMENT ON COLUMN doctors.registration_number  IS 'Medical council registration number';
COMMENT ON COLUMN doctors.experience_years     IS 'Years of professional experience';
COMMENT ON COLUMN doctors.consultation_fee     IS 'Default consultation fee in local currency';
COMMENT ON COLUMN doctors.department           IS 'Primary department, e.g. Cardiology';
COMMENT ON COLUMN doctors.bio                  IS 'Short professional biography (max ~500 chars)';
COMMENT ON COLUMN doctors.available_from       IS 'Default shift start time HH:MM';
COMMENT ON COLUMN doctors.available_to         IS 'Default shift end time HH:MM';
COMMENT ON COLUMN doctors.slot_duration_mins   IS 'Default appointment slot length in minutes';
