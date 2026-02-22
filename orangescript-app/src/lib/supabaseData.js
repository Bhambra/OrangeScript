import { supabase } from "./supabase.js";

// ============================================================
// PATIENTS
// ============================================================

/** Fetch all patients linked to this doctor (with last_visit from junction) */
export async function fetchDoctorPatients(doctorId) {
  const { data, error } = await supabase
    .from("doctor_patients")
    .select("patient_id, last_visit, patients(*)")
    .eq("doctor_id", doctorId)
    .order("last_visit", { ascending: false });

  if (error) { console.error("fetchDoctorPatients error:", error); return []; }

  return (data || []).map((row) => ({
    id: row.patients.id,
    name: row.patients.name,
    gender: row.patients.gender,
    dob: row.patients.dob || "",
    age: row.patients.age || 0,
    phone: row.patients.phone || "",
    email: row.patients.email || "",
    lastVisit: row.last_visit
      ? new Date(row.last_visit).toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata",
        })
      : "",
    conditions: [],
    notes: "",
  }));
}

/** Create or find a patient, link to doctor. Returns the patient UUID. */
export async function createPatient(doctorId, p) {
  // Use the upsert_patient RPC function
  const { data: patientId, error: upsertErr } = await supabase.rpc("upsert_patient", {
    p_name: p.name,
    p_gender: p.gender || "M",
    p_dob: p.dob || null,
    p_age: p.age || 0,
    p_phone: p.phone,
    p_email: p.email || "",
  });

  if (upsertErr) { console.error("upsert_patient error:", upsertErr); throw upsertErr; }

  // Link doctor to patient
  const { error: linkErr } = await supabase.rpc("link_doctor_patient", {
    p_doctor_id: doctorId,
    p_patient_id: patientId,
  });

  if (linkErr) { console.error("link_doctor_patient error:", linkErr); throw linkErr; }

  return patientId;
}

/** Update patient fields */
export async function updatePatient(patientId, updates) {
  const { error } = await supabase
    .from("patients")
    .update({
      name: updates.name,
      gender: updates.gender,
      dob: updates.dob || null,
      age: updates.age || 0,
      phone: updates.phone,
      email: updates.email || "",
    })
    .eq("id", patientId);

  if (error) { console.error("updatePatient error:", error); throw error; }
}

/** Unlink a patient from a doctor (does NOT delete the patient row) */
export async function deletePatientLink(doctorId, patientId) {
  const { error } = await supabase
    .from("doctor_patients")
    .delete()
    .eq("doctor_id", doctorId)
    .eq("patient_id", patientId);

  if (error) { console.error("deletePatientLink error:", error); throw error; }
}

// ============================================================
// PRESCRIPTIONS
// ============================================================

/** Fetch all prescriptions for this doctor */
export async function fetchPrescriptions(doctorId) {
  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });

  if (error) { console.error("fetchPrescriptions error:", error); return []; }
  return data || [];
}

/** Create a prescription record */
export async function createPrescription(doctorId, patientId, rxData) {
  const { data, error } = await supabase
    .from("prescriptions")
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      sections: rxData.sections || [],
      icd_codes: rxData.icdCodes || {},
      known_conditions: rxData.knownConditions || "",
      test_values: rxData.testValues || "",
      custom_sections: rxData.customSections || [],
      follow_up_date: rxData.followUpDate || null,
    })
    .select()
    .single();

  if (error) { console.error("createPrescription error:", error); throw error; }

  // Update last_visit on the junction
  await supabase
    .from("doctor_patients")
    .update({ last_visit: new Date().toISOString() })
    .eq("doctor_id", doctorId)
    .eq("patient_id", patientId);

  return data;
}

/** Update an existing prescription record */
export async function updatePrescription(prescriptionId, rxData) {
  const { data, error } = await supabase
    .from("prescriptions")
    .update({
      sections: rxData.sections || [],
      icd_codes: rxData.icdCodes || {},
      known_conditions: rxData.knownConditions || "",
      test_values: rxData.testValues || "",
      custom_sections: rxData.customSections || [],
      follow_up_date: rxData.followUpDate || null,
    })
    .eq("id", prescriptionId)
    .select()
    .single();

  if (error) { console.error("updatePrescription error:", error); throw error; }
  return data;
}

// ============================================================
// TEMPLATES
// ============================================================

/** Fetch all templates for this doctor */
export async function fetchTemplates(doctorId) {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });

  if (error) { console.error("fetchTemplates error:", error); return []; }
  return data || [];
}

/** Create a template. Returns the row with UUID. */
export async function createTemplate(doctorId, tpl) {
  const { data, error } = await supabase
    .from("templates")
    .insert({
      doctor_id: doctorId,
      name: tpl.name,
      sections: tpl.sections || [],
      test_values: tpl.testValues || "",
      icd_codes: tpl.icdCodes || {},
      custom_sections: tpl.customSections || [],
    })
    .select()
    .single();

  if (error) { console.error("createTemplate error:", error); throw error; }
  return data;
}

/** Update a template */
export async function updateTemplate(templateId, updates) {
  const { error } = await supabase
    .from("templates")
    .update({
      name: updates.name,
      sections: updates.sections || [],
      test_values: updates.testValues || "",
      icd_codes: updates.icdCodes || {},
      custom_sections: updates.customSections || [],
    })
    .eq("id", templateId);

  if (error) { console.error("updateTemplate error:", error); throw error; }
}

/** Delete a template */
export async function deleteTemplate(templateId) {
  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", templateId);

  if (error) { console.error("deleteTemplate error:", error); throw error; }
}

// ============================================================
// CUSTOM PHRASES
// ============================================================

/** Fetch all custom phrases for this doctor. Returns flat array. */
export async function fetchCustomPhrases(doctorId) {
  const { data, error } = await supabase
    .from("custom_phrases")
    .select("*")
    .eq("doctor_id", doctorId);

  if (error) { console.error("fetchCustomPhrases error:", error); return []; }
  return data || [];
}

/** Transform flat phrase rows → {sectionId: phrase[]} map */
export function groupPhrasesBySection(rows) {
  const map = {};
  (rows || []).forEach((r) => {
    if (!map[r.section_id]) map[r.section_id] = [];
    map[r.section_id].push(r.phrase);
  });
  return map;
}

/** Create a custom phrase (idempotent — unique constraint handles duplicates) */
export async function createPhrase(doctorId, sectionId, phrase) {
  const { error } = await supabase
    .from("custom_phrases")
    .insert({ doctor_id: doctorId, section_id: sectionId, phrase })
    .select();

  // Ignore unique constraint violation (duplicate)
  if (error && error.code !== "23505") {
    console.error("createPhrase error:", error);
    throw error;
  }
}

/** Delete a custom phrase */
export async function deletePhrase(doctorId, sectionId, phrase) {
  const { error } = await supabase
    .from("custom_phrases")
    .delete()
    .eq("doctor_id", doctorId)
    .eq("section_id", sectionId)
    .eq("phrase", phrase);

  if (error) { console.error("deletePhrase error:", error); throw error; }
}

// ============================================================
// PATIENT NOTES
// ============================================================

/** Fetch all patient notes for this doctor. Returns flat array with {id, patient_id, note}. */
export async function fetchPatientNotes(doctorId) {
  const { data, error } = await supabase
    .from("patient_notes")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: true });

  if (error) { console.error("fetchPatientNotes error:", error); return []; }
  return data || [];
}

/** Transform flat note rows → {patientId: note[]} map + {patientId: uuid[]} id map */
export function groupNotesByPatient(rows) {
  const noteMap = {};
  const idMap = {};
  (rows || []).forEach((r) => {
    const pid = r.patient_id;
    if (!noteMap[pid]) { noteMap[pid] = []; idMap[pid] = []; }
    noteMap[pid].push(r.note);
    idMap[pid].push(r.id);
  });
  return { noteMap, idMap };
}

/** Create a patient note. Returns the row with UUID. */
export async function createNote(doctorId, patientId, note) {
  const { data, error } = await supabase
    .from("patient_notes")
    .insert({ doctor_id: doctorId, patient_id: patientId, note })
    .select()
    .single();

  if (error) { console.error("createNote error:", error); throw error; }
  return data;
}

/** Delete a patient note by its UUID */
export async function deleteNote(noteId) {
  const { error } = await supabase
    .from("patient_notes")
    .delete()
    .eq("id", noteId);

  if (error) { console.error("deleteNote error:", error); throw error; }
}
