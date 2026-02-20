-- ============================================================
-- OrangeScript — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ────────────────────────────────────────
-- 1. DOCTORS (1:1 with auth.users)
-- ────────────────────────────────────────
CREATE TABLE doctors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  specialty TEXT DEFAULT '',
  degrees TEXT DEFAULT '',
  mci TEXT UNIQUE,                    -- Registration number (unique across all doctors)
  clinic TEXT DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT UNIQUE NOT NULL,         -- Doctor's unique phone number
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Doctors can only read/write their own profile
CREATE POLICY "doctors_select_own" ON doctors FOR SELECT USING (auth.uid() = id);
CREATE POLICY "doctors_insert_own" ON doctors FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "doctors_update_own" ON doctors FOR UPDATE USING (auth.uid() = id);

-- ────────────────────────────────────────
-- 2. PATIENTS (globally unique)
-- ────────────────────────────────────────
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'M',
  dob DATE,
  age INT,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- A patient is unique by name + gender + dob + phone
  CONSTRAINT patients_unique_identity UNIQUE (name, gender, dob, phone)
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────
-- 3. DOCTOR ↔ PATIENT junction
-- ────────────────────────────────────────
CREATE TABLE doctor_patients (
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  first_visit TIMESTAMPTZ DEFAULT now(),
  last_visit TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (doctor_id, patient_id)
);

ALTER TABLE doctor_patients ENABLE ROW LEVEL SECURITY;

-- Doctors can see their own patient links
CREATE POLICY "dp_select_own" ON doctor_patients FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "dp_insert_own" ON doctor_patients FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "dp_update_own" ON doctor_patients FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "dp_delete_own" ON doctor_patients FOR DELETE USING (auth.uid() = doctor_id);

-- Patients: a doctor can see any patient they're linked to
CREATE POLICY "patients_select_linked" ON patients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM doctor_patients dp WHERE dp.patient_id = patients.id AND dp.doctor_id = auth.uid()
  ));
-- Any authenticated doctor can insert a patient (they might be new)
CREATE POLICY "patients_insert_auth" ON patients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Doctors can update patients they're linked to
CREATE POLICY "patients_update_linked" ON patients FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM doctor_patients dp WHERE dp.patient_id = patients.id AND dp.doctor_id = auth.uid()
  ));

-- ────────────────────────────────────────
-- 4. PRESCRIPTIONS (visible across doctors for shared patients)
-- ────────────────────────────────────────
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  sections JSONB DEFAULT '[]',        -- [{id, label, content}, ...]
  icd_codes JSONB DEFAULT '{}',       -- {sectionId: {code, desc}, ...}
  known_conditions TEXT DEFAULT '',
  test_values TEXT DEFAULT '',
  custom_sections JSONB DEFAULT '[]',
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- A doctor can see ALL prescriptions for patients they're linked to
-- (This is the key rule: Doctor B sees Doctor A's Rx for a shared patient)
CREATE POLICY "rx_select_linked_patient" ON prescriptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM doctor_patients dp WHERE dp.patient_id = prescriptions.patient_id AND dp.doctor_id = auth.uid()
  ));
-- Doctors can only create prescriptions as themselves
CREATE POLICY "rx_insert_own" ON prescriptions FOR INSERT WITH CHECK (auth.uid() = doctor_id);
-- Doctors can only update their own prescriptions
CREATE POLICY "rx_update_own" ON prescriptions FOR UPDATE USING (auth.uid() = doctor_id);

-- ────────────────────────────────────────
-- 5. TEMPLATES (private per doctor)
-- ────────────────────────────────────────
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sections JSONB DEFAULT '[]',
  test_values TEXT DEFAULT '',
  icd_codes JSONB DEFAULT '{}',
  custom_sections JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_select_own" ON templates FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "templates_insert_own" ON templates FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "templates_update_own" ON templates FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "templates_delete_own" ON templates FOR DELETE USING (auth.uid() = doctor_id);

-- ────────────────────────────────────────
-- 6. CUSTOM PHRASES (private per doctor)
-- ────────────────────────────────────────
CREATE TABLE custom_phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,           -- e.g. "symptoms", "rx", "diagnosis"
  phrase TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_phrase_per_doctor UNIQUE (doctor_id, section_id, phrase)
);

ALTER TABLE custom_phrases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "phrases_select_own" ON custom_phrases FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "phrases_insert_own" ON custom_phrases FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "phrases_delete_own" ON custom_phrases FOR DELETE USING (auth.uid() = doctor_id);

-- ────────────────────────────────────────
-- 7. PATIENT NOTES (per doctor, per patient)
-- ────────────────────────────────────────
CREATE TABLE patient_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;

-- Notes are private to the doctor who wrote them
CREATE POLICY "notes_select_own" ON patient_notes FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "notes_insert_own" ON patient_notes FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "notes_delete_own" ON patient_notes FOR DELETE USING (auth.uid() = doctor_id);

-- ────────────────────────────────────────
-- 8. HELPER FUNCTION: Upsert patient (find or create)
--    Returns the patient UUID. Matches on (name, gender, dob, phone).
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION upsert_patient(
  p_name TEXT,
  p_gender TEXT,
  p_dob DATE,
  p_age INT,
  p_phone TEXT,
  p_email TEXT DEFAULT ''
) RETURNS UUID AS $$
DECLARE
  patient_id UUID;
BEGIN
  -- Try to find existing patient
  SELECT id INTO patient_id FROM patients
    WHERE name = p_name AND gender = p_gender AND phone = p_phone
    AND (dob = p_dob OR (dob IS NULL AND p_dob IS NULL));

  IF patient_id IS NULL THEN
    -- Create new patient
    INSERT INTO patients (name, gender, dob, age, phone, email)
    VALUES (p_name, p_gender, p_dob, p_age, p_phone, p_email)
    RETURNING id INTO patient_id;
  ELSE
    -- Update age/email if changed
    UPDATE patients SET age = p_age, email = COALESCE(NULLIF(p_email, ''), email), updated_at = now()
    WHERE id = patient_id;
  END IF;

  RETURN patient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────
-- 9. HELPER FUNCTION: Link doctor to patient (idempotent)
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION link_doctor_patient(
  p_doctor_id UUID,
  p_patient_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO doctor_patients (doctor_id, patient_id)
  VALUES (p_doctor_id, p_patient_id)
  ON CONFLICT (doctor_id, patient_id) DO UPDATE SET last_visit = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────
-- 10. INDEXES for performance
-- ────────────────────────────────────────
CREATE INDEX idx_doctor_patients_doctor ON doctor_patients(doctor_id);
CREATE INDEX idx_doctor_patients_patient ON doctor_patients(patient_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_created ON prescriptions(created_at DESC);
CREATE INDEX idx_templates_doctor ON templates(doctor_id);
CREATE INDEX idx_custom_phrases_doctor ON custom_phrases(doctor_id, section_id);
CREATE INDEX idx_patient_notes_patient ON patient_notes(patient_id, doctor_id);
CREATE INDEX idx_patients_phone ON patients(phone);

-- ────────────────────────────────────────
-- 11. AUTO-UPDATE updated_at trigger
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
