/**
 * Startup migration runner.
 * Runs any pending SQL migrations that have not yet been applied to the live DB.
 * Uses a simple `schema_migrations` tracking table so each migration is idempotent.
 *
 * Only runs when DATABASE_URL is set.  Failures are logged but do NOT crash the
 * server — the app can still start; only the features that depend on missing
 * schema will be broken.
 */

import pg from 'pg';

const { Pool } = pg;

// ─── Inline SQL for each migration ──────────────────────────────────────────
// Keep every migration as a single transaction so it's atomic.

const MIGRATIONS: { id: string; sql: string }[] = [
  {
    id: '006_document_grants_and_referrals',
    sql: `
      -- 1. referral_status enum (safe to re-run via DO block)
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'referral_status') THEN
          CREATE TYPE referral_status AS ENUM ('pending', 'accepted', 'declined', 'completed');
        END IF;
      END
      $$;

      -- 2. record_access_grants columns
      ALTER TABLE record_access_grants
        ADD COLUMN IF NOT EXISTS document_type TEXT,
        ADD COLUMN IF NOT EXISTS document_id   UUID,
        ADD COLUMN IF NOT EXISTS source        TEXT NOT NULL DEFAULT 'manual';

      CREATE INDEX IF NOT EXISTS idx_grants_document ON record_access_grants(document_type, document_id);
      CREATE INDEX IF NOT EXISTS idx_grants_source   ON record_access_grants(source);

      -- 3. referrals table
      CREATE TABLE IF NOT EXISTS referrals (
        id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referring_doctor_id   UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        referred_to_doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        patient_id            UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        reason                TEXT,
        status                referral_status NOT NULL DEFAULT 'pending',
        created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT referrals_no_self_referral CHECK (referring_doctor_id != referred_to_doctor_id)
      );

      CREATE INDEX IF NOT EXISTS idx_referrals_referring ON referrals(referring_doctor_id);
      CREATE INDEX IF NOT EXISTS idx_referrals_referred  ON referrals(referred_to_doctor_id);
      CREATE INDEX IF NOT EXISTS idx_referrals_patient   ON referrals(patient_id);
      CREATE INDEX IF NOT EXISTS idx_referrals_status    ON referrals(status);

      -- RLS enabled but no policies = service-role bypasses, anon/users blocked
      ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
    `,
  },
];

// ─── Runner ──────────────────────────────────────────────────────────────────

export async function runMigrations(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('[migrations] DATABASE_URL not set — skipping startup migrations.');
    return;
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  try {
    // Ensure tracking table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id         TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    for (const migration of MIGRATIONS) {
      const { rows } = await pool.query(
        'SELECT id FROM schema_migrations WHERE id = $1',
        [migration.id]
      );

      if (rows.length > 0) {
        console.log(`[migrations] ${migration.id} — already applied, skipping.`);
        continue;
      }

      console.log(`[migrations] Applying ${migration.id}...`);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(migration.sql);
        await client.query(
          'INSERT INTO schema_migrations (id) VALUES ($1)',
          [migration.id]
        );
        await client.query('COMMIT');
        console.log(`[migrations] ${migration.id} — applied successfully.`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
  } catch (err) {
    console.error('[migrations] Migration failed:', (err as Error).message);
    console.error('[migrations] The server will continue but referrals feature may not work.');
  } finally {
    await pool.end();
  }
}
