# MediNexus MVP - Complete Project Documentation

## Project Overview

**MediNexus** is a healthcare platform MVP focused on two core pillars:

**Pillar 1 - Smart Slot Booking Engine**: Real-time appointment booking with soft-lock overbooking prevention, automated waitlist filling on cancellation, and live slot availability broadcast to all connected clients.

**Pillar 2 - Unified Patient Health Passport**: A patient-controlled, persistent medical record that aggregates prescriptions, reports, and history across every hospital and clinic on the platform, with cross-hospital record sharing using explicit patient consent and time-limited access grants.

**Technology Stack**: React (Vite) for frontend, Express.js (Node.js) for backend API, PostgreSQL via Supabase for database, with Supabase Auth for authentication.

**Three User Entities**:
- **Hospital Admin**: Onboards hospitals, manages doctor rosters, configures service catalogues, generates appointment slots
- **Doctor**: Manages schedules, runs appointment queues, issues digital prescriptions, views shared patient records
- **Patient**: Discovers hospitals, books appointments, manages health passport, controls cross-hospital record sharing

**Out of Scope for MVP**: AI chatbot, walk-in queue management, no-show ML prediction, multilingual UI, telemedicine, pharmacy integration, drug interaction checker, ABDM/ABHA integration, super-admin UI.

***

## Entity 1: Hospital Admin Features

### 1.1 Hospital Registration & Onboarding

**Process**:
The hospital submits a registration form containing:
- Hospital name
- Type (hospital / clinic / solo practitioner)
- Complete address
- City and state
- Registration number
- Primary admin contact details

**Technical Implementation**:
- Creates a row in the `hospitals` table with `is_approved = false`
- A platform admin toggles approval manually (no separate UI for MVP)
- Upon approval, the Hospital Admin receives credentials via Supabase invitation email
- Supabase Auth creates the admin user automatically
- Row-Level Security (RLS) policy ensures Hospital Admin can only read and write their own hospital row by matching `admin_id = auth.uid()`

### 1.2 Doctor Roster Management

**Process**:
Hospital Admin adds doctors to their roster by providing:
- Doctor's full name
- Specialization
- Department
- Consultation fee
- Default slot duration in minutes

**Technical Implementation**:
- Express.js endpoint: `POST /hospitals/{id}/doctors/invite`
- Creates a pending doctor record in the database
- Triggers Supabase invitation email to the doctor
- When doctor accepts and completes signup, a post-signup trigger automatically links `doctors.user_id = auth.uid()`
- Doctor row is linked to hospital via `hospital_id` foreign key

### 1.3 Service Catalogue Management

**Purpose**: Define all services available at the hospital. For MVP, scope is limited to doctor consultations only.

**Data Structure**:
Each entry in `hospital_services` table contains:
- Service name
- Department
- Linked doctor
- Default duration in minutes
- Fee amount
- Pay-at-counter boolean flag

**Search Functionality**:
- PostgreSQL full-text search (tsvector) added on `service_name` and `department`
- Patients can search terms like "cardiologist" or "fever" and find relevant services
- Uses GIN index for fast text search performance

### 1.4 Slot Generation for Doctors

**Process**:
Hospital Admin configures a doctor's availability by specifying:
- Working days (array of days: 0=Sunday, 1=Monday, etc.)
- Start time (e.g., 09:00)
- End time (e.g., 17:00)
- Slot duration in minutes (e.g., 30 minutes)

**Technical Implementation**:
The system generates individual slot rows for the next 30 days in the `appointment_slots` table using a PostgreSQL function:

```sql
CREATE OR REPLACE FUNCTION generate_doctor_slots(
  p_doctor_id UUID,
  p_start_time TIME,
  p_end_time TIME,
  p_duration_mins INT,
  p_working_days INT[],
  p_days_ahead INT
) RETURNS void AS $$
DECLARE
  curr_date DATE := CURRENT_DATE;
  slot_time TIMESTAMPTZ;
BEGIN
  FOR i IN 0..p_days_ahead LOOP
    IF EXTRACT(DOW FROM curr_date + i) = ANY(p_working_days) THEN
      slot_time := (curr_date + i + p_start_time);
      WHILE slot_time < (curr_date + i + p_end_time) LOOP
        INSERT INTO appointment_slots
          (id, doctor_id, slot_start, slot_end, status)
        VALUES
          (gen_random_uuid(), p_doctor_id, slot_time,
           slot_time + (p_duration_mins || ' minutes')::interval,
           'available')
        ON CONFLICT (doctor_id, slot_start) DO NOTHING;
        slot_time := slot_time + (p_duration_mins || ' minutes')::interval;
      END LOOP;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

**Key Features**:
- Generates slots in a single database call (efficient)
- `UNIQUE(doctor_id, slot_start)` constraint prevents duplicate slots even if function called multiple times
- `ON CONFLICT DO NOTHING` safely handles re-runs

### 1.5 Appointment Dashboard

**Purpose**: Operational view for monitoring appointments across the hospital.

**Features**:
- Today's appointment count per doctor
- Upcoming appointments for the week
- Cancelled and no-show records
- Read-only view (no editing capabilities)

**Technical Implementation**:
- Express.js endpoint: `GET /hospitals/{id}/appointments?date=today`
- Returns paginated response
- Aggregates data from appointments table with joins to doctors and patients tables

***

## Entity 2: Doctor Features

### 2.1 Authentication & Profile Setup

**Process**:
1. Doctor receives invitation email from hospital admin
2. Clicks invitation link
3. Sets password via Supabase Auth
4. Completes profile setup

**Profile Information**:
- Bio / description
- Consultation fee confirmation
- Prescription template preference (default or custom with clinic header)

### 2.2 Schedule & Availability Management

**Calendar View**: Doctor sees all generated slots in a visual calendar interface.

**Slot Management Actions**:

**Block Individual Slots**:
- Doctor can mark specific slots as unavailable
- Technical: `PATCH /slots/{id}` sets `status = 'blocked'`
- Used for personal appointments, meetings, etc.

**Mark Full Day as Leave**:
- Bulk operation to block all slots on a specific date
- SQL query:
```sql
UPDATE appointment_slots
SET status = 'blocked'
WHERE doctor_id = $doctor_id
  AND slot_start::date = $leave_date
  AND status = 'available';
```
- All patients with booked appointments on that day are automatically notified via Supabase Email + SMS
- Notification handled through Express.js background task

### 2.3 Daily Appointment Queue

**Purpose**: Doctor's main working view for managing daily consultations.

**Display Format**:
- All booked appointments for today in chronological order
- Each appointment card shows:
  - Patient name
  - Patient age
  - Appointment type (new / follow-up)
  - "View Health Passport" button (if patient granted access)

**Status Management**:
Doctor updates appointment through workflow:
- `waiting` → Patient has arrived
- `in_consultation` → Consultation in progress
- `completed` → Consultation finished
- `no_show` → Patient didn't arrive

**No-Show Tracking**:
- Marking `no_show` increments `no_show_count` on patient record
- Used for future analytics and policy enforcement

### 2.4 Prescription Builder (Integrated CuraRx Module)

**Activation**: Triggered when doctor completes a consultation.

**Complete Workflow**:

**Step 1: Medicine Search**
Two search methods available:

**A) Symptom Search**:
- Doctor types symptoms (e.g., "fever", "headache", "diabetes")
- PostgreSQL full-text search queries the medicines table
- Returns top 25 ranked results using ts_rank

Technical implementation:
```sql
-- Computed stored tsvector column
ALTER TABLE medicines ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  to_tsvector('english',
    coalesce(medicine_name, '') || ' ' ||
    coalesce(medicine_uses::text, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(therapeutic_class, ''))
) STORED;

CREATE INDEX medicines_fts_idx ON medicines USING GIN(search_vector);

-- Ranked symptom search (top 25)
SELECT id, medicine_name, composition, therapeutic_class,
       side_effects, substitutes, uses,
       ts_rank(search_vector, query) AS rank
FROM medicines,
     websearch_to_tsquery('english', $1) AS query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 25;
```

**B) Medicine Name Search**:
- Direct lookup by brand name or generic name
- Exact match search for known medications

**Step 2: Drag and Drop Interface**:
- Search results displayed as cards
- Doctor drags selected medicines into prescription panel
- Visual, intuitive interface for building prescription

**Step 3: Dosage Details**:
For each medicine, doctor specifies:
- **Dosage**: e.g., "500mg", "2 tablets"
- **Frequency**: e.g., "twice daily", "after meals"
- **Duration**: e.g., "7 days", "2 weeks"
- **Doctor's Comment**: Additional instructions or warnings

**Step 4: PDF Generation**:
- Express.js uses Puppeteer or pdfkit to render HTML template to PDF
- Prescription includes:
  - Doctor name, hospital, date
  - Patient details
  - All medicines with dosage instructions
  - Doctor's signature/clinic header (if custom template)
- PDF uploaded to Supabase Storage
- Returns signed, time-limited URL for download

**Step 5: Delivery & Storage**:
- PDF automatically emailed to patient
- SMS sent to patient with download link
- Prescription row created in database:
  - Linked to `appointment_id`
  - Linked to `patient_id`
  - Automatically appears in patient's Health Passport
  - Each medicine stored in `prescription_items` table with full details

**Optional Enhancement**:
- If full-text search returns fewer than 10 results, optional OpenRouter LLM call can re-rank and suggest additional medicines
- Can be disabled for MVP demo

### 2.5 Patient Health Passport Access

**Access Control**:
When doctor clicks "View Health Passport" for a patient:

1. Express.js endpoint: `GET /patients/{id}/passport`
2. Checks `record_access_grants` table for valid grant:
   - `granted_to_doctor_id = auth.uid()` (current doctor)
   - `valid_until > now()` (grant not expired)
3. If valid grant exists, returns aggregated data:
   - All prescriptions from all hospitals
   - All lab/imaging reports
   - Patient profile (allergies, blood group, conditions)

**Security**:
- Row-Level Security (RLS) at database level enforces access independently of application code
- Doctor cannot access records without explicit patient grant
- All queries automatically filtered by RLS policies

***

## Entity 3: Patient Features

### 3.1 Authentication & Profile Setup

**Sign-Up Methods**:
All handled through Supabase Auth:
- Email + Password
- Google OAuth
- Phone + OTP (One-Time Password)

**Profile Completion**:
After authentication, patient provides:
- Full name
- Date of birth
- Blood group
- Known allergies (free text field)
- Language preference

**Technical**:
- Creates `patients` row linked to `auth.uid()`
- Profile stored securely with RLS ensuring patient can only access own data

### 3.2 Hospital & Doctor Discovery

**Search Functionality**:
Patient can search by:
- Hospital name
- City/location
- Medical speciality (e.g., "cardiology", "pediatrics")
- Service type (e.g., "consultation", "checkup")

**Technical Implementation**:

Uses PostgreSQL materialized view combining hospital and service data:

```sql
CREATE MATERIALIZED VIEW hospital_search_view AS
SELECT
  h.id AS hospital_id,
  h.name,
  h.city,
  h.address,
  h.type,
  to_tsvector('english',
    h.name || ' ' || h.city || ' ' || h.state || ' ' ||
    string_agg(hs.service_name || ' ' ||
               coalesce(hs.department,''), ' ')
  ) AS search_vector
FROM hospitals h
LEFT JOIN hospital_services hs ON hs.hospital_id = h.id
WHERE h.is_approved = true
GROUP BY h.id;

CREATE INDEX hospital_search_idx
ON hospital_search_view USING GIN(search_vector);
```

**View Refresh**:
- Materialized view refreshed via `REFRESH MATERIALIZED VIEW CONCURRENTLY`
- Express.js calls refresh whenever hospital or service record updated
- Ensures search results always current

**Real-Time Availability**:
- Search results include "slots available today" boolean
- Computed by checking for any available slot with `slot_start::date = CURRENT_DATE` for hospital's doctors
- Helps patients find immediate availability

### 3.3 Slot Booking with Soft-Lock

**This is the most critical flow in the MVP** - prevents double-booking and race conditions.

**Complete Booking Flow**:
1. Patient selects hospital and doctor
2. Views available slots in calendar/list view
3. Clicks on desired slot
4. 3-minute soft lock activates immediately
5. Patient reviews details and confirms
6. Slot status becomes 'booked'
7. Confirmation sent via email + SMS

**Technical Implementation - Two-Step Process**:

**Step 1: Acquire Soft Lock (Atomic Operation)**:

```sql
BEGIN;

UPDATE appointment_slots
SET
  status = 'soft_locked',
  locked_by = $patient_id,
  locked_until = now() + interval '3 minutes'
WHERE id = $slot_id
  AND status = 'available'  -- only if truly available
RETURNING id, slot_start, slot_end, doctor_id;

COMMIT;
```

**Results**:
- **0 rows returned**: Slot already taken by another patient → Return HTTP 409 Conflict
- **1 row returned**: Lock successfully acquired → Return slot details + countdown timer

**Why Atomic?**:
- `UPDATE WHERE status = 'available'` ensures only one patient can lock the slot
- PostgreSQL transaction guarantees no race conditions
- If two patients click simultaneously, only one UPDATE succeeds

**Step 2: Confirm Booking (Within 3 Minutes)**:

```sql
BEGIN;

-- Re-verify lock still held by this patient
SELECT id FROM appointment_slots
WHERE id = $slot_id
  AND status = 'soft_locked'
  AND locked_by = $patient_id
  AND locked_until > now()
FOR UPDATE;

-- If no row returned: lock expired → Return HTTP 410 Gone

-- Create appointment record
INSERT INTO appointments
  (id, slot_id, patient_id, doctor_id, hospital_id,
   service_id, status)
VALUES
  (gen_random_uuid(), $slot_id, $patient_id, $doctor_id,
   $hospital_id, $service_id, 'booked');

-- Mark slot as booked
UPDATE appointment_slots
SET status = 'booked',
    locked_by = NULL,
    locked_until = NULL
WHERE id = $slot_id;

COMMIT;
```

**Error Handling**:
- If lock expired: Patient sees "Slot no longer available, please select another"
- Patient must restart booking process with new slot

**Lock Expiry Cleanup**:

Automated cleanup runs every 60 seconds via pg_cron or Express node-cron:

```sql
UPDATE appointment_slots
SET status = 'available',
    locked_by = NULL,
    locked_until = NULL
WHERE status = 'soft_locked'
  AND locked_until < now();
```

**Frontend Countdown Timer**:
- React receives `locked_until` timestamp from Express API
- Renders visual countdown (e.g., "2:45 remaining")
- If timer expires before confirmation, UI shows "Slot no longer available"
- Patient can call `PATCH /slots/{id}/release` to free lock early if they change mind

### 3.4 Real-Time Slot Availability via PostgreSQL LISTEN/NOTIFY and SSE

**Purpose**: When patient browses slots, availability updates live without page refresh - no polling required.

**Technical Architecture**:

**Database Trigger**:
PostgreSQL trigger fires on every slot status change:

```sql
CREATE OR REPLACE FUNCTION notify_slot_change()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('slot_updates',
    json_build_object(
      'slot_id', NEW.id,
      'doctor_id', NEW.doctor_id,
      'status', NEW.status,
      'slot_start', NEW.slot_start
    )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_slot_status_change
AFTER UPDATE OF status ON appointment_slots
FOR EACH ROW EXECUTE FUNCTION notify_slot_change();
```

**Express.js SSE Server**:
- Maintains persistent connection to PostgreSQL using `pg` library
- Listens on 'slot_updates' channel
- When notification received, broadcasts to all connected React clients via Server-Sent Events (SSE)
- Sends `: keepalive` comment every 30 seconds to prevent connection timeout

**React Frontend**:
- Uses `EventSource` to subscribe to SSE endpoint
- Receives real-time updates when any slot status changes
- Updates slot grid immediately without refresh
- Shows visual feedback (slot turns gray when booked, green when available again)

**Example Flow**:
1. Patient A views Dr. Smith's slots on Monday 9 AM page
2. Patient B books Monday 10:30 AM slot
3. Database trigger fires, sends pg_notify
4. Express receives notification, pushes via SSE
5. Patient A's browser receives update via EventSource
6. Monday 10:30 AM slot instantly shows as "Booked" on Patient A's screen

### 3.5 Cancellation & Waitlist Auto-Fill

**Cancellation Rules**:
- Patient can cancel from their dashboard
- Configurable threshold before appointment time (e.g., 2 hours minimum notice)
- Prevents last-minute cancellations that waste doctor time

**Automated Waitlist Flow**:

When patient cancels appointment:

**Step 1: Release Slot**
```sql
UPDATE appointments SET status = 'cancelled';
UPDATE appointment_slots SET status = 'available';
```

**Step 2: Query Waitlist**
```sql
SELECT * FROM slot_waitlist
WHERE slot_id = $slot_id
  AND status = 'waiting'
ORDER BY queued_at ASC
LIMIT 1;
```

**Step 3: Offer to First in Queue**
```sql
UPDATE slot_waitlist
SET status = 'offered',
    offer_expires_at = now() + interval '10 minutes'
WHERE id = $waitlist_id;
```

**Step 4: Send Notification**
- Supabase Email sent with appointment details
- Supabase SMS sent with one-click acceptance deep link
- Patient clicks link to instantly confirm

**Step 5: Cascade if Not Accepted**
- If patient doesn't accept within 10 minutes:
  - Express background task marks offer as `expired`
  - Automatically cascades to next patient in queue
  - Process repeats until slot filled or waitlist exhausted

**Waitlist Benefits**:
- Maximizes doctor utilization
- Reduces wasted appointment slots
- Gives patients access to previously full schedules
- Fully automated - no manual intervention

### 3.6 Patient Health Passport

**Purpose**: Centralized, patient-owned medical record aggregating all healthcare interactions across hospitals.

**Interface Structure - Three Tabs**:

**Tab 1: Prescriptions**
- Shows all prescriptions from all doctors on the platform
- Sorted newest first (most recent at top)
- Each entry displays:
  - Doctor name
  - Hospital name
  - Date issued
  - List of medicines prescribed
  - Full prescription downloadable as PDF via signed Supabase Storage URL
- Click to view detailed medicine information (dosage, frequency, duration)

**Tab 2: Reports**
- All lab and imaging reports uploaded by hospital staff
- Each entry shows:
  - Report name (e.g., "Blood Test - CBC", "X-Ray Chest")
  - Report type (lab / imaging / pathology)
  - Hospital name
  - Date uploaded
  - Download link (secured via Supabase Storage)
- Reports uploaded by authorized hospital staff only

**Tab 3: Profile & Conditions**
- **Blood Group**: Displayed prominently
- **Known Allergies**: Free text from patient profile
- **Ongoing Medications**: Automatically extracted from active (recent) prescriptions
- **Emergency Contact**: Phone number for emergencies
- Patient can update profile information anytime

**Technical Implementation**:
- Single Express endpoint: `GET /patients/{id}/passport`
- Runs three parallel PostgreSQL queries for performance:
  1. Fetch all prescriptions with joins to doctors and medicines
  2. Fetch all reports with hospital details
  3. Fetch profile data and extract ongoing medications
- Uses async/parallel execution for minimal response time
- All queries automatically filtered by RLS (patient can only see own data)

### 3.7 Cross-Hospital Record Sharing

**Problem Solved**: Patient visiting new hospital has medical history scattered across previous hospitals.

**Solution**: Patient-controlled, time-limited access grants.

**User Flow**:

**Step 1: Consent Prompt**
- When patient books appointment at a new hospital (first time)
- System shows consent prompt: "Share your medical records with [Hospital Name]?"
- Explains what will be shared (prescriptions, reports)
- Patient can accept or decline

**Step 2: Grant Creation**
If patient confirms, Express creates access grant:

```sql
INSERT INTO record_access_grants
  (id, patient_id, granted_to_hospital_id,
   record_types, valid_until)
VALUES
  (gen_random_uuid(), $patient_id, $hospital_id,
   ARRAY['prescriptions', 'reports'],
   now() + interval '30 days');
```

**Grant Properties**:
- **Duration**: 30 days by default (configurable)
- **Scope**: Specific record types (prescriptions, reports)
- **Hospital-level**: All doctors at granted hospital can access
- **Time-limited**: Automatically expires after 30 days

**Step 3: Doctor Access**
- When doctor at granted hospital opens appointment
- "View Health Passport" button becomes available
- Doctor sees full patient history from all hospitals
- Access enforced by RLS policy at database level

**RLS Policy Example**:
```sql
CREATE POLICY doctor_sees_shared_records ON prescriptions
FOR SELECT TO doctor_role
USING (
  patient_id IN (
    SELECT rag.patient_id
    FROM record_access_grants rag
    JOIN doctors d ON d.hospital_id = rag.granted_to_hospital_id
    WHERE d.user_id = auth.uid()
      AND 'prescriptions' = ANY(rag.record_types)
      AND rag.valid_until > now()
  )
  OR doctor_id = (SELECT id FROM doctors WHERE user_id = auth.uid())
);
```

**Policy Logic**:
- Doctor can see prescriptions if:
  - Active grant exists for their hospital, OR
  - They issued the prescription themselves

**Step 4: Grant Management**
- Patient can view all active grants in settings
- Shows: Hospital name, records shared, expiry date
- One-tap revoke: `DELETE /record-access-grants/{id}`
- Revocation immediate - doctor loses access instantly
- Patient maintains full control over their data

**Security Features**:
- Explicit patient consent required
- Time-limited access (not permanent)
- Granular control (can share prescriptions but not reports)
- Audit trail maintained (all access logged)
- RLS enforced at database level (cannot be bypassed by application bugs)

***

## PostgreSQL as Full Infrastructure

MediNexus leverages PostgreSQL for nearly all backend logic, minimizing application code complexity.

### PostgreSQL Capabilities Used:

**1. Full-Text Search**
- **Mechanism**: tsvector, GIN index, ts_rank, websearch_to_tsquery
- **Usage**: Medicine symptom search, hospital/service discovery
- **Performance**: GIN index enables millisecond search on millions of records
- **Language**: English stemming and ranking

**2. Overbooking Prevention**
- **Mechanism**: Atomic `UPDATE WHERE status='available'` + `UNIQUE(doctor_id, slot_start)` constraint
- **Why**: Database-level constraint guarantees no double-booking regardless of application bugs
- **Concurrent Safety**: Transaction isolation prevents race conditions

**3. Soft-Lock Expiry**
- **Mechanism**: pg_cron job calling `UPDATE WHERE locked_until < now()` every 60 seconds
- **Fallback**: Express node-cron if pg_cron unavailable
- **Reliability**: Automatic cleanup even if application crashes

**4. Real-Time Slot Updates**
- **Mechanism**: pg_notify trigger on status change + pg LISTEN in Express → SSE to React
- **Efficiency**: Push-based (no polling), low latency
- **Scalability**: Single database notification fans out to many clients

**5. Access Control**
- **Mechanism**: Row-Level Security (RLS) policies per role
- **Enforcement**: Query-level filtering independent of application code
- **Security**: Impossible to bypass (even with SQL injection or application bugs)
- **Roles**: Hospital admin, doctor, patient each have distinct policies

**6. Search Result Caching**
- **Mechanism**: `search_cache` table with `query_hash` (MD5) and `expires_at`
- **Upsert**: `ON CONFLICT DO UPDATE` for atomic cache refresh
- **No Redis**: Pure PostgreSQL caching, one less system to manage

```sql
CREATE TABLE search_cache (
  query_hash TEXT PRIMARY KEY,
  results JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Check cache
SELECT results FROM search_cache
WHERE query_hash = $1 AND expires_at > now();

-- Insert or update
INSERT INTO search_cache (query_hash, results, expires_at)
VALUES ($1, $2::jsonb, now() + interval '5 minutes')
ON CONFLICT (query_hash) DO UPDATE
SET results = EXCLUDED.results,
    cached_at = now(),
    expires_at = EXCLUDED.expires_at;
```

**7. Hospital Search Index**
- **Mechanism**: Materialized view combining hospital + services data with GIN index
- **Refresh**: `REFRESH MATERIALIZED VIEW CONCURRENTLY` on data changes
- **Performance**: Pre-computed joins, instant search results

**8. Audit Trail**
- **Mechanism**: Insert-only `appointment_status_log` table
- **Trigger**: Populates automatically on every appointment status change
- **Use**: Compliance, debugging, analytics
- **Immutable**: Historical records never updated or deleted

***

## Express.js Layer Responsibilities

Express handles only what PostgreSQL cannot:

### 1. PDF Generation
- **Library**: Puppeteer (headless Chrome) or pdfkit (lightweight)
- **Process**: 
  - Renders prescription HTML template to PDF
  - Includes doctor logo, clinic header, patient details, medicines
  - Uploads to Supabase Storage
  - Returns signed, time-limited URL (expires in 24 hours)
- **Performance**: Puppeteer cached, reused for multiple PDFs

### 2. Background Tasks
- **Scheduler**: node-cron or agenda.js for recurring tasks
- **Jobs**:
  - **Slot lock expiry**: Every 60 seconds, release expired soft-locks
  - **Waitlist cascade**: 10-minute timer for offer expiry, move to next patient
  - **Leave notifications**: Bulk email/SMS when doctor marks leave day

### 3. SSE Connection Management
- **Setup**: Persistent `pg` client connection with LISTEN on 'slot_updates'
- **Fan-out**: When notification received, broadcast to all connected patients viewing that doctor's slots
- **Keepalive**: Send comment every 30 seconds to prevent timeout
- **Cleanup**: Remove disconnected clients from connection pool

### 4. Notification Dispatch
- **Triggers**: After successful database transactions
- **Methods**:
  - Supabase Email for confirmations, prescriptions, verification
  - Supabase SMS for OTPs, booking confirmations, waitlist offers
- **Template**: Dynamic email/SMS templates with patient/appointment data
- **Async**: Non-blocking dispatch, doesn't slow down API response

### 5. LLM Integration (Optional)
- **Service**: OpenRouter API for medicine re-ranking
- **Trigger**: When PostgreSQL FTS returns fewer than 10 results
- **Process**: Send symptom text to LLM, get enhanced medicine suggestions
- **Fallback**: Can be disabled entirely for MVP demo
- **Cost Control**: Only called when FTS insufficient

***

## Complete Database Schema

### Core Tables:

**hospitals**
- `id` UUID PRIMARY KEY
- `name` TEXT NOT NULL
- `type` TEXT (hospital / clinic / solo)
- `address` TEXT
- `city` TEXT
- `state` TEXT
- `registration_number` TEXT UNIQUE
- `admin_id` UUID REFERENCES auth.users
- `is_approved` BOOLEAN DEFAULT false
- `created_at` TIMESTAMPTZ DEFAULT now()

**hospital_services**
- `id` UUID PRIMARY KEY
- `hospital_id` UUID REFERENCES hospitals
- `service_type` TEXT
- `service_name` TEXT NOT NULL
- `department` TEXT
- `default_duration_mins` INT
- `fee` DECIMAL
- `pay_at_counter` BOOLEAN
- `is_available` BOOLEAN DEFAULT true

**doctors**
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES auth.users UNIQUE
- `hospital_id` UUID REFERENCES hospitals
- `full_name` TEXT NOT NULL
- `specialisation` TEXT
- `prescription_template` TEXT
- `verified` BOOLEAN DEFAULT false
- `created_at` TIMESTAMPTZ DEFAULT now()

**patients**
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES auth.users UNIQUE
- `full_name` TEXT NOT NULL
- `phone_number` TEXT
- `email` TEXT
- `dob` DATE
- `blood_group` TEXT
- `known_allergies` TEXT
- `language_preference` TEXT
- `no_show_count` INT DEFAULT 0
- `created_at` TIMESTAMPTZ DEFAULT now()

**appointment_slots**
- `id` UUID PRIMARY KEY
- `doctor_id` UUID REFERENCES doctors
- `slot_start` TIMESTAMPTZ NOT NULL
- `slot_end` TIMESTAMPTZ NOT NULL
- `status` TEXT (available / soft_locked / booked / blocked)
- `locked_by` UUID REFERENCES patients
- `locked_until` TIMESTAMPTZ
- `UNIQUE(doctor_id, slot_start)` -- prevents duplicate slots

**appointments**
- `id` UUID PRIMARY KEY
- `slot_id` UUID REFERENCES appointment_slots
- `patient_id` UUID REFERENCES patients
- `doctor_id` UUID REFERENCES doctors
- `hospital_id` UUID REFERENCES hospitals
- `service_id` UUID REFERENCES hospital_services
- `booking_type` TEXT (new / follow_up)
- `status` TEXT (booked / waiting / in_consultation / completed / cancelled / no_show)
- `notes` TEXT
- `created_at` TIMESTAMPTZ DEFAULT now()

**slot_waitlist**
- `id` UUID PRIMARY KEY
- `slot_id` UUID REFERENCES appointment_slots
- `patient_id` UUID REFERENCES patients
- `queued_at` TIMESTAMPTZ DEFAULT now()
- `notified_at` TIMESTAMPTZ
- `offer_expires_at` TIMESTAMPTZ
- `status` TEXT (waiting / offered / accepted / expired)

**medicines**
- `id` UUID PRIMARY KEY
- `medicine_name` TEXT NOT NULL
- `composition` TEXT
- `therapeutic_class` TEXT
- `chemical_class` TEXT
- `uses` TEXT
- `side_effects` TEXT
- `substitutes` TEXT
- `description` TEXT
- `image_url` TEXT
- `search_vector` tsvector GENERATED (for FTS)

**prescriptions**
- `id` UUID PRIMARY KEY
- `appointment_id` UUID REFERENCES appointments
- `doctor_id` UUID REFERENCES doctors
- `patient_id` UUID REFERENCES patients
- `illness_description` TEXT
- `issued_at` TIMESTAMPTZ DEFAULT now()
- `pdf_url` TEXT (Supabase Storage URL)

**prescription_items**
- `id` UUID PRIMARY KEY
- `prescription_id` UUID REFERENCES prescriptions
- `medicine_id` UUID REFERENCES medicines
- `dosage` TEXT
- `frequency` TEXT
- `duration` TEXT
- `doctor_comment` TEXT

**patient_reports**
- `id` UUID PRIMARY KEY
- `patient_id` UUID REFERENCES patients
- `hospital_id` UUID REFERENCES hospitals
- `report_type` TEXT (lab / imaging / pathology)
- `report_name` TEXT NOT NULL
- `report_url` TEXT (Supabase Storage URL)
- `uploaded_by` UUID REFERENCES auth.users
- `uploaded_at` TIMESTAMPTZ DEFAULT now()

**record_access_grants**
- `id` UUID PRIMARY KEY
- `patient_id` UUID REFERENCES patients
- `granted_to_hospital_id` UUID REFERENCES hospitals
- `granted_to_doctor_id` UUID REFERENCES doctors (nullable, hospital-wide if NULL)
- `record_types` TEXT[] (array: ['prescriptions', 'reports'])
- `valid_until` TIMESTAMPTZ NOT NULL
- `created_at` TIMESTAMPTZ DEFAULT now()

**search_cache**
- `query_hash` TEXT PRIMARY KEY (MD5 of search string)
- `results` JSONB NOT NULL
- `cached_at` TIMESTAMPTZ DEFAULT now()
- `expires_at` TIMESTAMPTZ NOT NULL

**appointment_status_log** (audit trail)
- `id` UUID PRIMARY KEY
- `appointment_id` UUID REFERENCES appointments
- `old_status` TEXT
- `new_status` TEXT
- `changed_by` UUID REFERENCES auth.users
- `changed_at` TIMESTAMPTZ DEFAULT now()

***

## Complete Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React (Vite) | All three portals, role-based routing, SSE client via EventSource |
| **Backend API** | Express.js (Node.js) | REST + SSE APIs, scheduling engine, PDF generation |
| **Database** | PostgreSQL (Supabase) | All data, FTS, LISTEN/NOTIFY, RLS, pg_cron |
| **Database Client** | pg or postgres.js | Connection pooling, parameterized queries, LISTEN |
| **Auth** | Supabase Auth | Email/password, Google OAuth, Phone OTP, JWT with role claims |
| **Email** | Supabase Email | Booking confirmations, prescriptions, verification emails |
| **SMS** | Supabase Phone | OTP codes, booking SMS, waitlist offers |
| **PDF Generation** | Puppeteer or pdfkit | Prescription PDF rendering from HTML templates |
| **Storage** | Supabase Storage | PDFs, reports, doctor profile images, hospital logos |
| **Background Jobs** | node-cron or agenda.js | Lock expiry cleanup, waitlist cascade, leave notifications |
| **Real-Time** | Server-Sent Events (SSE) | Live slot updates pushed from server to React clients |
| **LLM (Optional)** | OpenRouter | Medicine suggestion re-ranking when FTS insufficient |

***

## MVP Build Order - 6 Phases

### Phase 1: Week 1 - Foundation
**Deliverables**:
- Supabase project setup and configuration
- All database table schemas created with proper constraints
- Row-Level Security (RLS) policies for all three roles
- Supabase Auth configured for email/password, Google OAuth, phone OTP
- Express.js project skeleton
- Database connection pool setup with `pg` library
- Basic Express routing structure for three portals

**Success Criteria**: Can create users for all three roles, database enforces RLS

### Phase 2: Week 1-2 - Hospital & Doctor Management
**Deliverables**:
- Hospital registration form and approval workflow
- Doctor roster management (invite, add, list doctors)
- Service catalogue CRUD operations
- Slot generation PostgreSQL function implementation
- Calendar UI renders generated slots correctly
- Hospital admin can view and manage their roster

**Success Criteria**: Hospital admin can invite doctors and generate 30-day slot schedules

### Phase 3: Week 2 - Core Booking Flow
**Deliverables**:
- Soft-lock booking implementation (atomic UPDATE transactions)
- Booking confirmation flow with lock verification
- Cancellation logic (release slots, update status)
- Waitlist insertion when slots full
- Concurrent booking stress tests (multiple patients, same slot)
- Email/SMS confirmations via Supabase

**Success Criteria**: No double-bookings under concurrent load, locks expire properly

### Phase 4: Week 2-3 - Discovery & Real-Time Updates
**Deliverables**:
- Hospital/doctor full-text search with materialized view
- Service catalogue public view for patients
- Booking UI with slot grid/calendar
- Countdown timer for soft-locked slots
- PostgreSQL LISTEN/NOTIFY trigger setup
- Express SSE endpoint for slot updates
- React EventSource integration for real-time updates

**Success Criteria**: Patient sees live slot updates without refresh when others book

### Phase 5: Week 3 - Health Passport & Prescriptions
**Deliverables**:
- Patient profile completion and editing
- Prescription builder UI in doctor interface (symptom search, drag-drop)
- PDF generation with Puppeteer/pdfkit
- Report upload interface for hospital staff
- Cross-hospital access grant creation
- Health passport three-tab view (prescriptions, reports, profile)
- RLS policies for record sharing

**Success Criteria**: Doctor issues prescription, patient sees it in passport, PDF downloads

### Phase 6: Week 3-4 - Automation & Polish
**Deliverables**:
- Waitlist auto-fill via Supabase SMS/email
- Background job for waitlist 10-minute offer expiry
- PDF prescription generation fully integrated
- Hospital admin appointment dashboard with stats
- No-show marking increments patient counter
- Leave day notification system
- Final testing and bug fixes

**Success Criteria**: Cancelled slot auto-offers to waitlist, prescriptions delivered via SMS/email

***

## Medicines CSV → Supabase (Exact Column Mapping)

If your CSV includes a `search_vector` column, do **not** insert it directly into `medicines` because this column is generated by PostgreSQL.

### Recommended import flow

1. Create a staging table with all CSV columns as text.
2. Import CSV into staging (Dashboard CSV import or `COPY`).
3. Insert from staging into `medicines` while excluding `search_vector`.

```sql
CREATE TABLE IF NOT EXISTS medicines_import_staging (
  id TEXT,
  medicine_name TEXT,
  composition TEXT,
  therapeutic_class TEXT,
  chemical_class TEXT,
  uses TEXT,
  side_effects TEXT,
  substitutes TEXT,
  description TEXT,
  image_url TEXT,
  search_vector TEXT
);

INSERT INTO medicines (
  id,
  medicine_name,
  composition,
  therapeutic_class,
  chemical_class,
  uses,
  side_effects,
  substitutes,
  description,
  image_url
)
SELECT
  id::uuid,
  medicine_name,
  composition,
  therapeutic_class,
  chemical_class,
  uses,
  side_effects,
  substitutes,
  description,
  image_url
FROM medicines_import_staging
ON CONFLICT (id) DO UPDATE SET
  medicine_name     = EXCLUDED.medicine_name,
  composition       = EXCLUDED.composition,
  therapeutic_class = EXCLUDED.therapeutic_class,
  chemical_class    = EXCLUDED.chemical_class,
  uses              = EXCLUDED.uses,
  side_effects      = EXCLUDED.side_effects,
  substitutes       = EXCLUDED.substitutes,
  description       = EXCLUDED.description,
  image_url         = EXCLUDED.image_url;
```

After insert/update, PostgreSQL automatically recomputes `search_vector` and keeps the GIN index query-ready.

***

## Three-Portal Architecture

MediNexus serves all three user types from a **single React codebase** using role-based routing.

### Authentication Flow:
1. User logs in via Supabase Auth (any method)
2. Supabase returns JWT token
3. JWT contains user's role in claims: `hospital_admin`, `doctor`, or `patient`
4. React reads role from JWT
5. React Router redirects to appropriate portal automatically

### URL Structure:

**Patient Portal**: `/app/*`
- `/app/discover` - Hospital and doctor search
- `/app/book/:doctorId` - Slot booking interface
- `/app/appointments` - My appointments list
- `/app/passport` - Health passport (prescriptions, reports, profile)
- `/app/sharing` - Manage record access grants

**Hospital Admin Portal**: `/hospital/*`
- `/hospital/onboarding` - Hospital registration (first-time)
- `/hospital/dashboard` - Appointment stats and overview
- `/hospital/doctors` - Doctor roster management
- `/hospital/services` - Service catalogue configuration
- `/hospital/slots/:doctorId` - Slot generation and management

**Doctor Portal**: `/doctor/*`
- `/doctor/schedule` - Calendar view, block slots, mark leave
- `/doctor/queue` - Today's appointment queue
- `/doctor/consultation/:appointmentId` - Active consultation view
- `/doctor/prescribe/:appointmentId` - Prescription builder (CuraRx)
- `/doctor/passport/:patientId` - View shared patient records

### Route Guards:
- Express middleware verifies JWT on every API call
- React router checks role before rendering components
- Unauthorized access redirects to login
- Wrong role (e.g., patient accessing `/hospital/*`) redirects to correct portal

### Shared Components:
- Header/Navigation (adapts to role)
- Supabase Auth wrapper
- Common UI components (buttons, forms, modals)
- SSE connection manager (for real-time updates)

***

## Key Technical Innovations

### 1. Soft-Lock Booking System
**Problem**: Race conditions when multiple patients book same slot simultaneously
**Solution**: Three-minute soft-lock with atomic database transaction
**Innovation**: No distributed locks needed - PostgreSQL MVCC handles concurrency

### 2. PostgreSQL-Centric Architecture
**Problem**: Complex booking logic typically requires Redis, message queues, etc.
**Solution**: Leverage PostgreSQL features (FTS, LISTEN/NOTIFY, RLS, materialized views)
**Innovation**: Single database does work of 4-5 systems, reduces operational complexity

### 3. Server-Sent Events for Real-Time
**Problem**: WebSockets complex, require connection management, load balancing
**Solution**: SSE over HTTP, simpler protocol, works with standard infrastructure
**Innovation**: PostgreSQL trigger → Express LISTEN → SSE fan-out, no separate real-time service

### 4. Patient-Controlled Data Sharing
**Problem**: Medical records siloed in hospitals, no patient control
**Solution**: Explicit consent-based grants with time limits, enforced by RLS
**Innovation**: Database-level security, impossible to bypass, patient maintains ownership

### 5. Unified Health Passport
**Problem**: Patients repeat medical history at every hospital visit
**Solution**: Platform-wide prescription and report aggregation
**Innovation**: Cross-hospital visibility with patient consent, single source of truth

***

## Security & Privacy Features

**Authentication**: Supabase Auth with JWT, multiple methods (email, OAuth, phone)
**Authorization**: Row-Level Security policies enforce access at database query level
**Data Encryption**: TLS in transit, Supabase encryption at rest
**Audit Logging**: Immutable status change log for all appointments
**Consent Management**: Explicit patient grants required for record access
**Time-Limited Access**: Grants expire automatically after 30 days
**Revocation**: Patient can instantly revoke access to any hospital
**No Data Leakage**: RLS prevents doctors seeing records without valid grants
**SQL Injection Protected**: Parameterized queries throughout Express layer

***

This is the complete technical specification for MediNexus MVP. The system is designed for 3-4 week implementation, focusing on core booking and health passport functionality while deferring advanced features to future versions.