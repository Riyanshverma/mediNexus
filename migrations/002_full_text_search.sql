-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: Full-Text Search — GIN indexes + tsvector columns + RPC
-- Run this entire file in the Supabase SQL editor.
--
-- KEY FIX: If search_vector exists as a GENERATED column (e.g. on medicines),
-- we drop and recreate it as a plain tsvector so triggers + manual UPDATEs work.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Helper: drop a column only if it is a generated column ───────────────────
-- We check pg_attribute.attgenerated; if it is not empty the column is generated.

DO $$
BEGIN
  -- hospitals
  IF EXISTS (
    SELECT 1 FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    WHERE c.relname = 'hospitals'
      AND a.attname = 'search_vector'
      AND a.attgenerated <> ''
  ) THEN
    ALTER TABLE hospitals DROP COLUMN search_vector;
  END IF;

  -- doctors
  IF EXISTS (
    SELECT 1 FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    WHERE c.relname = 'doctors'
      AND a.attname = 'search_vector'
      AND a.attgenerated <> ''
  ) THEN
    ALTER TABLE doctors DROP COLUMN search_vector;
  END IF;

  -- hospital_services
  IF EXISTS (
    SELECT 1 FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    WHERE c.relname = 'hospital_services'
      AND a.attname = 'search_vector'
      AND a.attgenerated <> ''
  ) THEN
    ALTER TABLE hospital_services DROP COLUMN search_vector;
  END IF;

  -- medicines  ← this is the one that was generated
  IF EXISTS (
    SELECT 1 FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    WHERE c.relname = 'medicines'
      AND a.attname = 'search_vector'
      AND a.attgenerated <> ''
  ) THEN
    ALTER TABLE medicines DROP COLUMN search_vector;
  END IF;
END $$;

-- ── 1. hospitals ─────────────────────────────────────────────────────────────

ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION hospitals_search_vector_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.city, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.state, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.address, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.type::text, '')), 'D');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trig_hospitals_search_vector ON hospitals;
CREATE TRIGGER trig_hospitals_search_vector
  BEFORE INSERT OR UPDATE ON hospitals
  FOR EACH ROW EXECUTE FUNCTION hospitals_search_vector_update();

-- Backfill existing rows by triggering an in-place UPDATE
UPDATE hospitals SET name = name;

CREATE INDEX IF NOT EXISTS idx_hospitals_fts ON hospitals USING GIN(search_vector);

-- ── 2. doctors ───────────────────────────────────────────────────────────────

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION doctors_search_vector_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.full_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.specialisation, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.department, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.qualifications, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.bio, '')), 'D');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trig_doctors_search_vector ON doctors;
CREATE TRIGGER trig_doctors_search_vector
  BEFORE INSERT OR UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION doctors_search_vector_update();

UPDATE doctors SET full_name = full_name;

CREATE INDEX IF NOT EXISTS idx_doctors_fts ON doctors USING GIN(search_vector);

-- ── 3. hospital_services ─────────────────────────────────────────────────────

ALTER TABLE hospital_services ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION hospital_services_search_vector_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.service_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.department, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.service_type, '')), 'C');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trig_hospital_services_search_vector ON hospital_services;
CREATE TRIGGER trig_hospital_services_search_vector
  BEFORE INSERT OR UPDATE ON hospital_services
  FOR EACH ROW EXECUTE FUNCTION hospital_services_search_vector_update();

UPDATE hospital_services SET service_name = service_name;

CREATE INDEX IF NOT EXISTS idx_hospital_services_fts ON hospital_services USING GIN(search_vector);

-- ── 4. medicines ─────────────────────────────────────────────────────────────
-- The column was previously a GENERATED column and has been dropped above.
-- Re-add it as a plain tsvector.

ALTER TABLE medicines ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION medicines_search_vector_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.medicine_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.therapeutic_class, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.uses, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'D') ||
    setweight(to_tsvector('english', coalesce(NEW.composition, '')), 'D');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trig_medicines_search_vector ON medicines;
CREATE TRIGGER trig_medicines_search_vector
  BEFORE INSERT OR UPDATE ON medicines
  FOR EACH ROW EXECUTE FUNCTION medicines_search_vector_update();

-- Backfill by touching the trigger column
UPDATE medicines SET medicine_name = medicine_name;

CREATE INDEX IF NOT EXISTS idx_medicines_fts ON medicines USING GIN(search_vector);

-- ── 5. search_hospitals RPC ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION search_hospitals(
  search_query      TEXT  DEFAULT NULL,
  filter_city       TEXT  DEFAULT NULL,
  filter_speciality TEXT  DEFAULT NULL,
  result_limit      INT   DEFAULT 50
)
RETURNS TABLE (
  id          uuid,
  name        text,
  type        text,
  address     text,
  city        text,
  state       text,
  is_approved boolean,
  rank        real
)
LANGUAGE sql STABLE AS $$
  SELECT
    h.id,
    h.name,
    h.type::text,
    h.address,
    h.city,
    h.state,
    h.is_approved,
    GREATEST(
      COALESCE(ts_rank(h.search_vector,
        websearch_to_tsquery('english', NULLIF(search_query, ''))), 0),
      COALESCE((
        SELECT MAX(ts_rank(d.search_vector,
          websearch_to_tsquery('english', NULLIF(search_query, ''))))
        FROM doctors d
        WHERE d.hospital_id = h.id AND d.verified = true
      ), 0),
      COALESCE((
        SELECT MAX(ts_rank(s.search_vector,
          websearch_to_tsquery('english', NULLIF(search_query, ''))))
        FROM hospital_services s
        WHERE s.hospital_id = h.id AND s.is_available = true
      ), 0)
    ) AS rank
  FROM hospitals h
  WHERE
    h.is_approved = true
    AND (
      filter_city IS NULL OR filter_city = ''
      OR h.city ILIKE '%' || filter_city || '%'
    )
    AND (
      filter_speciality IS NULL OR filter_speciality = ''
      OR EXISTS (
        SELECT 1 FROM doctors d
        WHERE d.hospital_id = h.id
          AND d.verified = true
          AND d.search_vector @@ websearch_to_tsquery('english', filter_speciality)
      )
      OR EXISTS (
        SELECT 1 FROM hospital_services s
        WHERE s.hospital_id = h.id
          AND s.is_available = true
          AND s.search_vector @@ websearch_to_tsquery('english', filter_speciality)
      )
    )
    AND (
      search_query IS NULL OR search_query = ''
      OR h.search_vector @@ websearch_to_tsquery('english', search_query)
      OR EXISTS (
        SELECT 1 FROM doctors d
        WHERE d.hospital_id = h.id
          AND d.verified = true
          AND d.search_vector @@ websearch_to_tsquery('english', search_query)
      )
      OR EXISTS (
        SELECT 1 FROM hospital_services s
        WHERE s.hospital_id = h.id
          AND s.is_available = true
          AND s.search_vector @@ websearch_to_tsquery('english', search_query)
      )
    )
  ORDER BY rank DESC, h.name ASC
  LIMIT result_limit;
$$;
