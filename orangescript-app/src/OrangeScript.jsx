import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./lib/AuthContext.jsx";
import * as db from "./lib/supabaseData.js";

const B = {
  orange: "#F7941D", green: "#17A578", grey: "#616262", dark: "#333333",
  secondary: "#484848", lightBg: "#F5F5F5", white: "#FFFFFF",
  orangeT15: "#FFF4E6", orangeT30: "#FFDFB5",
  greenT15: "#E5F7F1", greenT30: "#B2E8D7",
  rule: "#ddd", phraseBlue: "#2563EB",
};

const LINE_H = 30;
const FONT_BODY = "'Caveat', cursive";
const FONT_UI = "'Montserrat', sans-serif";

const DEFAULT_DOCTOR = {
  name: "Dr. Priya Sharma", specialty: "General Medicine",
  degrees: "MBBS, MD (Internal Medicine)", mci: "KA-45892",
  clinic: "Sharma Wellness Clinic",
  address: "42, 3rd Cross, Jayanagar 4th Block\nBangalore - 560041",
  phone: "+91 80 2664 5500",
};

const ALL_SECTIONS = [
  { id: "symptoms", label: "Symptoms", shortcut: "⌘S" },
  { id: "diagnosis", label: "Running Diagnosis", shortcut: "⌘D" },
  { id: "rx", label: "Rx", shortcut: "⌘R" },
  { id: "treatment", label: "Treatment", shortcut: "⌘T" },
  { id: "tests", label: "Tests Advised", shortcut: "⌘O" },
  { id: "followup", label: "Follow Up", shortcut: "⌘F" },
];

const PHRASES = {
  symptoms: [
    "intermittent fever for 3 days with body ache",
    "persistent cough with yellowish sputum",
    "burning micturition for 2 days",
    "headache and dizziness since morning",
    "chest pain on exertion, relieved by rest",
    "generalized weakness and fatigue",
    "nausea and vomiting, 3 episodes today",
    "joint pain bilateral knees",
  ],
  diagnosis: [
    // ── Infectious Diseases (A/B) ──
    { name: "Typhoid Fever", icd: "A01.0" },
    { name: "Salmonella Gastroenteritis", icd: "A02.0" },
    { name: "Bacillary Dysentery", icd: "A03.9" },
    { name: "Amoebiasis", icd: "A06.9" },
    { name: "Acute Gastroenteritis", icd: "A09" },
    { name: "Pulmonary Tuberculosis", icd: "A15.0" },
    { name: "Chickenpox", icd: "B01.9" },
    { name: "Herpes Zoster", icd: "B02.9" },
    { name: "Measles", icd: "B05.9" },
    { name: "Viral Hepatitis A", icd: "B15.9" },
    { name: "Viral Hepatitis B", icd: "B16.9" },
    { name: "Dengue Fever", icd: "A90" },
    { name: "Dengue Haemorrhagic Fever", icd: "A91" },
    { name: "Malaria — P. vivax", icd: "B51.9" },
    { name: "Malaria — P. falciparum", icd: "B50.9" },
    { name: "Dermatophytosis (Ringworm)", icd: "B35.9" },
    { name: "Candidiasis, unspecified", icd: "B37.9" },
    { name: "Viral Fever, unspecified", icd: "B34.9" },
    { name: "Chikungunya", icd: "A92.0" },
    { name: "COVID-19", icd: "U07.1" },
    // ── Blood & Immune (D) ──
    { name: "Iron Deficiency Anaemia", icd: "D50.9" },
    { name: "Vitamin B12 Deficiency Anaemia", icd: "D51.9" },
    { name: "Folate Deficiency Anaemia", icd: "D52.9" },
    { name: "Anaemia, unspecified", icd: "D64.9" },
    { name: "Thrombocytopenia, unspecified", icd: "D69.6" },
    // ── Endocrine (E) ──
    { name: "Type 1 Diabetes Mellitus", icd: "E10.9" },
    { name: "Type 2 Diabetes Mellitus", icd: "E11.9" },
    { name: "Type 2 DM with Hyperglycaemia", icd: "E11.65" },
    { name: "Type 2 DM with Diabetic Neuropathy", icd: "E11.40" },
    { name: "Type 2 DM with Diabetic Nephropathy", icd: "E11.21" },
    { name: "Type 2 DM with Diabetic Retinopathy", icd: "E11.319" },
    { name: "Hypothyroidism, unspecified", icd: "E03.9" },
    { name: "Hyperthyroidism (Thyrotoxicosis)", icd: "E05.90" },
    { name: "Goitre, unspecified", icd: "E04.9" },
    { name: "Vitamin D Deficiency", icd: "E55.9" },
    { name: "Vitamin B12 Deficiency", icd: "E53.8" },
    { name: "Hyperlipidaemia, unspecified", icd: "E78.5" },
    { name: "Obesity, unspecified", icd: "E66.9" },
    { name: "Hyperuricaemia (Raised Uric Acid)", icd: "E79.0" },
    { name: "Metabolic Syndrome", icd: "E88.81" },
    { name: "Dehydration", icd: "E86.0" },
    // ── Mental & Behavioural (F) ──
    { name: "Generalised Anxiety Disorder", icd: "F41.1" },
    { name: "Panic Disorder", icd: "F41.0" },
    { name: "Major Depressive Disorder, single episode", icd: "F32.9" },
    { name: "Major Depressive Disorder, recurrent", icd: "F33.9" },
    { name: "Insomnia, unspecified", icd: "F51.01" },
    { name: "Adjustment Disorder", icd: "F43.20" },
    // ── Neurological (G) ──
    { name: "Migraine without Aura", icd: "G43.009" },
    { name: "Migraine with Aura", icd: "G43.109" },
    { name: "Tension-type Headache", icd: "G44.209" },
    { name: "Epilepsy, unspecified", icd: "G40.909" },
    { name: "Diabetic Polyneuropathy", icd: "G63" },
    { name: "Carpal Tunnel Syndrome", icd: "G56.00" },
    { name: "Bell's Palsy", icd: "G51.0" },
    { name: "Vertigo — Benign Paroxysmal Positional", icd: "H81.10" },
    // ── Eye & Ear (H) ──
    { name: "Allergic Conjunctivitis", icd: "H10.10" },
    { name: "Acute Otitis Media", icd: "H66.90" },
    { name: "Otitis Externa", icd: "H60.90" },
    // ── Cardiovascular (I) ──
    { name: "Essential Hypertension", icd: "I10" },
    { name: "Hypertensive Heart Disease", icd: "I11.9" },
    { name: "Hypertensive Chronic Kidney Disease", icd: "I12.9" },
    { name: "Angina Pectoris, unspecified", icd: "I20.9" },
    { name: "Acute Myocardial Infarction", icd: "I21.9" },
    { name: "Ischaemic Heart Disease, chronic", icd: "I25.9" },
    { name: "Atrial Fibrillation", icd: "I48.91" },
    { name: "Heart Failure, unspecified", icd: "I50.9" },
    { name: "Cerebrovascular Disease (Stroke)", icd: "I63.9" },
    { name: "Peripheral Vascular Disease", icd: "I73.9" },
    { name: "Varicose Veins of Lower Extremities", icd: "I83.90" },
    { name: "Deep Vein Thrombosis", icd: "I82.409" },
    // ── Respiratory (J) ──
    { name: "Acute Nasopharyngitis (Common Cold)", icd: "J00" },
    { name: "Acute Sinusitis", icd: "J01.90" },
    { name: "Acute Pharyngitis", icd: "J02.9" },
    { name: "Acute Tonsillitis", icd: "J03.90" },
    { name: "Upper Respiratory Tract Infection", icd: "J06.9" },
    { name: "Acute Bronchitis", icd: "J20.9" },
    { name: "Pneumonia, unspecified organism", icd: "J18.9" },
    { name: "Allergic Rhinitis, unspecified", icd: "J30.9" },
    { name: "Asthma, unspecified", icd: "J45.909" },
    { name: "Acute Exacerbation of Asthma", icd: "J45.901" },
    { name: "COPD with Acute Exacerbation", icd: "J44.1" },
    { name: "COPD, unspecified", icd: "J44.9" },
    { name: "Cough, unspecified", icd: "R05.9" },
    // ── Gastrointestinal (K) ──
    { name: "Gastro-oesophageal Reflux Disease (GERD)", icd: "K21.0" },
    { name: "Gastritis, unspecified", icd: "K29.70" },
    { name: "Duodenal Ulcer", icd: "K26.9" },
    { name: "Gastric Ulcer", icd: "K25.9" },
    { name: "Functional Dyspepsia", icd: "K30" },
    { name: "Irritable Bowel Syndrome", icd: "K58.9" },
    { name: "Constipation, unspecified", icd: "K59.00" },
    { name: "Acute Appendicitis", icd: "K35.80" },
    { name: "Cholelithiasis (Gallstones)", icd: "K80.20" },
    { name: "Fatty Liver Disease (NAFLD)", icd: "K76.0" },
    { name: "Alcoholic Liver Disease", icd: "K70.9" },
    { name: "Hepatitis, unspecified", icd: "K75.9" },
    { name: "Haemorrhoids", icd: "K64.9" },
    { name: "Anal Fissure", icd: "K60.2" },
    // ── Dermatological (L) ──
    { name: "Atopic Dermatitis (Eczema)", icd: "L20.9" },
    { name: "Contact Dermatitis", icd: "L25.9" },
    { name: "Psoriasis Vulgaris", icd: "L40.0" },
    { name: "Urticaria (Hives)", icd: "L50.9" },
    { name: "Acne Vulgaris", icd: "L70.0" },
    { name: "Fungal Skin Infection (Tinea)", icd: "B36.9" },
    { name: "Cellulitis, unspecified", icd: "L03.90" },
    { name: "Alopecia, unspecified", icd: "L65.9" },
    { name: "Scabies", icd: "B86" },
    // ── Musculoskeletal (M) ──
    { name: "Osteoarthritis, unspecified", icd: "M19.90" },
    { name: "Osteoarthritis — Knee", icd: "M17.9" },
    { name: "Osteoarthritis — Hip", icd: "M16.9" },
    { name: "Rheumatoid Arthritis", icd: "M06.9" },
    { name: "Gout, unspecified", icd: "M10.9" },
    { name: "Low Back Pain (Lumbago)", icd: "M54.5" },
    { name: "Cervicalgia (Neck Pain)", icd: "M54.2" },
    { name: "Sciatica", icd: "M54.30" },
    { name: "Frozen Shoulder", icd: "M75.00" },
    { name: "Lumbar Spondylosis", icd: "M47.816" },
    { name: "Cervical Spondylosis", icd: "M47.812" },
    { name: "Osteoporosis, unspecified", icd: "M81.0" },
    { name: "Plantar Fasciitis", icd: "M72.2" },
    { name: "Fibromyalgia", icd: "M79.7" },
    // ── Genitourinary (N) ──
    { name: "Urinary Tract Infection", icd: "N39.0" },
    { name: "Acute Cystitis", icd: "N30.00" },
    { name: "Chronic Kidney Disease, unspecified", icd: "N18.9" },
    { name: "CKD Stage 3", icd: "N18.3" },
    { name: "CKD Stage 4", icd: "N18.4" },
    { name: "Benign Prostatic Hyperplasia", icd: "N40.0" },
    { name: "Kidney Stones (Nephrolithiasis)", icd: "N20.0" },
    { name: "Ureteral Calculus", icd: "N20.1" },
    { name: "Polycystic Ovary Syndrome", icd: "E28.2" },
    { name: "Dysmenorrhoea", icd: "N94.6" },
    { name: "Menopausal Syndrome", icd: "N95.1" },
    // ── Symptoms & Signs (R) ──
    { name: "Fever, unspecified", icd: "R50.9" },
    { name: "Headache, unspecified", icd: "R51.9" },
    { name: "Chest Pain, unspecified", icd: "R07.9" },
    { name: "Abdominal Pain, unspecified", icd: "R10.9" },
    { name: "Nausea with Vomiting", icd: "R11.2" },
    { name: "Diarrhoea, unspecified", icd: "R19.7" },
    { name: "Dizziness and Giddiness", icd: "R42" },
    { name: "Fatigue / Malaise", icd: "R53.83" },
    { name: "Dyspnoea (Breathlessness)", icd: "R06.00" },
    { name: "Syncope (Fainting)", icd: "R55" },
    { name: "Oedema, unspecified", icd: "R60.9" },
    { name: "Joint Pain, unspecified", icd: "M25.50" },
    { name: "Myalgia (Muscle Pain)", icd: "M79.10" },
  ],
  rx: [
    "Amoxicillin 500mg", "Paracetamol 650mg", "Metformin 500mg",
    "Amlodipine 5mg", "Pantoprazole 40mg", "Azithromycin 500mg",
    "Cetirizine 10mg", "Dolo 650", "Telmisartan 40mg",
    "Atorvastatin 10mg", "Metoprolol 25mg", "Vitamin D3 60000 IU",
  ],
  treatment: [
    "Rest for 3 days", "Plenty of fluids, ORS if needed",
    "Steam inhalation twice daily", "Avoid cold beverages",
    "Warm saline gargle three times daily",
    "Light diet, avoid oily and spicy food",
  ],
  tests: [
    { name: "Complete Blood Count (CBC)", ohl: true },
    { name: "HbA1c", ohl: true },
    { name: "Fasting Blood Sugar", ohl: true },
    { name: "Lipid Profile", ohl: true },
    { name: "Thyroid Profile (T3, T4, TSH)", ohl: true },
    { name: "Kidney Function Test (KFT)", ohl: true },
    { name: "Liver Function Test (LFT)", ohl: true },
    { name: "Vitamin D (25-OH)", ohl: true },
    { name: "Vitamin B12", ohl: true },
    { name: "Chest X-Ray PA View", ohl: false },
    { name: "ECG 12-lead", ohl: false },
  ],
  followup: [],
};

const PATIENTS = [];

const SEED_TEMPLATES = ["Viral Fever — Adult", "UTI Standard", "Diabetes Follow-Up", "Post-Op Day 1", "Hypertension Review", "URTI with Cough", "Gastro Acute"];

function getIST() {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

function getTomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

function daysBetweenISO(dateA, dateB) {
  // Returns number of days from dateA to dateB (both YYYY-MM-DD)
  const a = new Date(dateA + "T00:00:00");
  const b = new Date(dateB + "T00:00:00");
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function addDaysISO(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// ============================================================
// PERSISTENCE — localStorage + async sync
// ============================================================
const LS_PREFIX = "qs_";

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function lsSet(key, value) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); } catch {}
}

function usePersistedState(key, fallback) {
  const [state, setState] = useState(() => lsGet(key, fallback));
  const setAndPersist = useCallback((valOrFn) => {
    setState(prev => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      lsSet(key, next);
      return next;
    });
  }, [key]);
  return [state, setAndPersist];
}

function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online;
}

// ============================================================
// PRESCRIPTION IMAGE GENERATOR (canvas, no CDN)
// ============================================================
function drawPrescriptionImage(data, sections, doctor) {
  const W = 780, PAD = 48, BODY_W = W - PAD * 2;
  const A4_RATIO = 297 / 210; // 1.4143
  const FONT_SEC_LABEL = "bold 13px Montserrat, sans-serif";
  const FONT_CONTENT = "18px Montserrat, sans-serif";
  const CONTENT_LH = 30; // line height for content

  // ── Pre-measure height with a scratch canvas ──
  const c0 = document.createElement("canvas");
  c0.width = W;
  const ctx0 = c0.getContext("2d");
  ctx0.font = FONT_CONTENT;

  let estH = PAD; // top padding
  estH += 90;     // header block
  estH += 14;     // orange bar + gap
  estH += 28;     // date line
  estH += 36;     // patient name
  if (data.knownConditions) estH += 26;
  if (data.testValues) estH += 26;
  estH += 14;     // gap before sections

  sections.forEach(s => {
    if (!s.content.trim()) return;
    estH += 42;   // section label + gap
    let content = s.content;
    if (s.id === "followup" && content.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const d = new Date(content);
      content = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
    }
    const lines = wrapText(ctx0, content, BODY_W);
    estH += lines.length * CONTENT_LH + 16;
  });

  estH += 110; // signature block + footer line
  estH += PAD; // bottom padding
  const A4_H = Math.round(W * A4_RATIO);
  const H = Math.max(A4_H, estH);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // ── Background ──
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  // ── Watermark ──
  ctx.save();
  ctx.font = "italic 200px Georgia, serif";
  ctx.fillStyle = "rgba(247,148,29,0.035)";
  ctx.textAlign = "right";
  ctx.fillText("\u211E", W - 30, H * 0.45);
  ctx.restore();

  let y = PAD;

  // ═══════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════
  ctx.textAlign = "left";
  ctx.font = "bold 22px Montserrat, sans-serif";
  ctx.fillStyle = "#333333";
  ctx.fillText(doctor.name, PAD, y + 22);

  ctx.font = "13px Montserrat, sans-serif";
  ctx.fillStyle = "#616262";
  ctx.fillText(doctor.specialty, PAD, y + 42);
  ctx.fillText(doctor.degrees, PAD, y + 58);
  ctx.font = "12px Montserrat, sans-serif";
  ctx.fillText("Reg. No: " + doctor.mci, PAD, y + 74);

  // Right side — clinic
  ctx.textAlign = "right";
  ctx.font = "bold 16px Montserrat, sans-serif";
  ctx.fillStyle = "#333333";
  ctx.fillText(doctor.clinic, W - PAD, y + 22);
  ctx.font = "12px Montserrat, sans-serif";
  ctx.fillStyle = "#616262";
  const addrLines = doctor.address.split("\n");
  addrLines.forEach((l, i) => ctx.fillText(l, W - PAD, y + 42 + i * 18));
  ctx.fillText(doctor.phone, W - PAD, y + 42 + addrLines.length * 18);

  y += 90;

  // ── Orange bar ──
  ctx.fillStyle = "#F7941D";
  ctx.fillRect(PAD, y, BODY_W, 2.5);
  y += 22;

  // ── Date ──
  ctx.textAlign = "right";
  ctx.font = "13px Montserrat, sans-serif";
  ctx.fillStyle = "#484848";
  ctx.fillText(data.date, W - PAD, y);
  y += 28;

  // ═══════════════════════════════════════════
  // PATIENT
  // ═══════════════════════════════════════════
  ctx.textAlign = "left";
  ctx.font = "bold 18px Montserrat, sans-serif";
  ctx.fillStyle = "#333333";
  const patientLine = [data.pName, data.pAge ? data.pAge + " yrs" : "", data.pGender, data.pPhone].filter(Boolean).join("  /  ");
  ctx.fillText(patientLine, PAD, y);
  y += 32;

  // Known Conditions
  if (data.knownConditions) {
    ctx.font = "bold 12px Montserrat, sans-serif";
    ctx.fillStyle = "#616262";
    ctx.fillText("Known Conditions: ", PAD, y);
    const kcW = ctx.measureText("Known Conditions: ").width;
    ctx.font = "12px Montserrat, sans-serif";
    ctx.fillStyle = "#484848";
    ctx.fillText(data.knownConditions, PAD + kcW, y);
    y += 22;
  }

  // Test Values
  if (data.testValues) {
    ctx.font = "bold 12px Montserrat, sans-serif";
    ctx.fillStyle = "#616262";
    ctx.fillText("Test Values: ", PAD, y);
    const tvW = ctx.measureText("Test Values: ").width;
    ctx.font = "12px Montserrat, sans-serif";
    ctx.fillStyle = "#484848";
    ctx.fillText(data.testValues, PAD + tvW, y);
    y += 22;
  }

  y += 12;

  // ═══════════════════════════════════════════
  // SECTIONS
  // ═══════════════════════════════════════════
  sections.filter(s => s.content.trim()).forEach(s => {
    const label = s.id === "followup" ? "NEXT REVIEW ON" : s.label.toUpperCase();
    const labelColor = s.id === "rx" ? "#F7941D" : "#17A578";

    // Label
    ctx.font = FONT_SEC_LABEL;
    ctx.fillStyle = labelColor;
    ctx.textAlign = "left";
    ctx.fillText(label, PAD, y);
    // Subtle full-width rule under label
    ctx.fillStyle = labelColor;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(PAD, y + 5, BODY_W, 1);
    ctx.globalAlpha = 1.0;
    y += 30;

    // Content
    ctx.font = FONT_CONTENT;
    ctx.fillStyle = "#333333";
    let content = s.content;
    if (s.id === "followup" && content.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const d = new Date(content);
      content = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
    }
    const lines = wrapText(ctx, content, BODY_W);
    lines.forEach(line => {
      ctx.fillText(line, PAD, y);
      y += CONTENT_LH;
    });
    y += 16;
  });

  // ═══════════════════════════════════════════
  // SIGNATURE BLOCK — above footer, bottom-right
  // ═══════════════════════════════════════════
  const sigBaseY = Math.max(y + 20, H - 110);

  // Cursive signature
  ctx.textAlign = "right";
  ctx.font = "28px 'Great Vibes', cursive";
  ctx.fillStyle = "#333333";
  ctx.fillText(doctor.name, W - PAD, sigBaseY);

  // Doctor full name + MCI below signature
  ctx.font = "10px Montserrat, sans-serif";
  ctx.fillStyle = "#484848";
  ctx.fillText(doctor.name + "  |  Reg. No: " + doctor.mci, W - PAD, sigBaseY + 16);

  // Disclaimer
  ctx.font = "8px Montserrat, sans-serif";
  ctx.fillStyle = "#aaaaaa";
  ctx.fillText("This is a digitally signed prescription", W - PAD, sigBaseY + 30);

  // ═══════════════════════════════════════════
  // FOOTER LINE
  // ═══════════════════════════════════════════
  const footerLineY = sigBaseY + 46;
  ctx.fillStyle = "#e0e0e0";
  ctx.fillRect(PAD, footerLineY, BODY_W, 1);

  // "Generated by OrangeScript" — bottom-left
  ctx.textAlign = "left";
  ctx.font = "9px Montserrat, sans-serif";
  ctx.fillStyle = "#bbbbbb";
  ctx.fillText("Generated by OrangeScript", PAD, footerLineY + 16);

  return canvas;
}

function wrapText(ctx, text, maxWidth) {
  const result = [];
  const paragraphs = text.split("\n");
  paragraphs.forEach(para => {
    const words = para.split(/\s+/);
    let line = "";
    words.forEach(word => {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        result.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) result.push(line);
  });
  return result.length ? result : [""];
}

async function shareImage(canvas, fileName, patientName) {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { resolve("error"); return; }
      const file = new File([blob], fileName, { type: "image/png" });

      // Try native share — only share the image file (no title/text to avoid duplicates and links)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
          });
          resolve("shared"); return;
        } catch (e) {
          if (e.name === "AbortError") { resolve("cancelled"); return; }
        }
      }

      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      resolve("downloaded");
    }, "image/png");
  });
}

// Parse follow-up text like "Review in 1 week" → date
function deriveFollowUpDate(rxDate, followUpText) {
  if (!followUpText || !rxDate) return null;
  const text = followUpText.toLowerCase();
  const match = text.match(/(\d+)\s*(day|week|month|year)s?/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  const base = new Date(rxDate);
  if (isNaN(base.getTime())) return null;
  if (unit === "day") base.setDate(base.getDate() + num);
  else if (unit === "week") base.setDate(base.getDate() + num * 7);
  else if (unit === "month") base.setMonth(base.getMonth() + num);
  else if (unit === "year") base.setFullYear(base.getFullYear() + num);
  return base.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

// ============================================================
// DROPDOWN
// ============================================================
function Dropdown({ items, idx, onSelect, isSection, onDelete, customItems }) {
  if (!items.length) return null;
  const customSet = new Set((customItems || []).map(c => typeof c === "object" ? c.name : c));
  return (
    <div style={{
      position: "absolute", zIndex: 200, left: 0, top: "100%", marginTop: 2,
      background: B.white, border: "1px solid #ddd", borderRadius: 8,
      boxShadow: "0 8px 32px rgba(0,0,0,0.13)", maxHeight: 210, overflow: "auto",
      minWidth: isSection ? 240 : 300, fontFamily: FONT_UI,
    }}>
      {items.map((item, i) => {
        const label = typeof item === "object" ? (item.label || item.name) : item;
        const isOhl = typeof item === "object" && item.ohl;
        const icdCode = typeof item === "object" && item.icd;
        const shortcut = typeof item === "object" && item.shortcut;
        const isDeletable = onDelete && customSet.has(typeof item === "object" ? item.name : item);
        return (
          <div key={i}
            onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
            style={{
              padding: "8px 14px", fontSize: 13, cursor: "pointer",
              background: i === idx ? B.orangeT15 : "transparent",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
            }}>
            <span style={{ flex: 1 }}>{label}</span>
            {isOhl && <span style={{ fontSize: 9, fontWeight: 700, color: B.white, background: B.green, borderRadius: 3, padding: "1px 5px" }}>OHL</span>}
            {icdCode && <span style={{ fontSize: 9, fontWeight: 600, color: B.white, background: "#6B7280", borderRadius: 3, padding: "1px 5px", fontFamily: "monospace", letterSpacing: 0.3 }}>{icdCode}</span>}
            {shortcut && <span style={{ fontSize: 10, color: B.grey, fontFamily: "monospace", background: B.lightBg, padding: "1px 5px", borderRadius: 3 }}>{shortcut}</span>}
            {isDeletable && (
              <svg onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item); }} style={{ cursor: "pointer", opacity: 0.4, flexShrink: 0 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            )}
          </div>
        );
      })}
      <div style={{ fontSize: 10, color: B.grey, padding: "5px 14px", borderTop: "1px solid #f0f0f0", background: B.lightBg }}>
        ↑↓ Navigate · Enter select · Esc dismiss
      </div>
    </div>
  );
}

// ============================================================
// AGE ↔ DOB HELPERS
// ============================================================
function ageFromDob(dob) {
  if (!dob) return "";
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : "";
}

function dobFromAge(age) {
  if (!age || isNaN(Number(age))) return "";
  const today = new Date();
  const year = today.getFullYear() - Number(age);
  return `${year}-01-01`;
}

// ============================================================
// PHRASE HIGHLIGHT HELPER
// ============================================================
function highlightPhrases(text, phrasePool) {
  if (!text) return null;
  if (!phrasePool || phrasePool.length === 0) return <span>{text}</span>;
  const phrases = phrasePool.map(p => typeof p === "object" ? p.name : p).filter(Boolean).sort((a, b) => b.length - a.length);
  if (phrases.length === 0) return <span>{text}</span>;
  const escapeRe = new RegExp("[.*+?^$|()\\[\\]\\\\{}]", "g");
  const escaped = phrases.map(p => p.replace(escapeRe, "\\$&"));
  const regex = new RegExp("(" + escaped.join("|") + ")", "gi");
  const parts = text.split(regex);
  const phraseSet = new Set(phrases.map(p => p.toLowerCase()));
  return parts.map((part, i) => (
    <span key={i} style={{ color: phraseSet.has(part.toLowerCase()) ? B.phraseBlue : B.dark }}>{part}</span>
  ));
}

// Find phrase boundaries at cursor position for whole-phrase backspace
function findPhraseAtCursor(text, cursorPos, phrasePool) {
  if (!text || !phrasePool || phrasePool.length === 0 || cursorPos <= 0) return null;
  const phrases = phrasePool.map(p => typeof p === "object" ? p.name : p).filter(Boolean).sort((a, b) => b.length - a.length);
  const escapeRe = new RegExp("[.*+?^$|()\\[\\]\\\\{}]", "g");
  for (const phrase of phrases) {
    const escaped = phrase.replace(escapeRe, "\\$&");
    const regex = new RegExp(escaped, "gi");
    let m;
    while ((m = regex.exec(text)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      if (cursorPos > start && cursorPos <= end) {
        return { start, end, phrase: m[0] };
      }
    }
  }
  return null;
}

// ============================================================
// MODAL
// ============================================================
function Modal({ open, onClose, title, children, width }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: B.white, borderRadius: 12, boxShadow: "0 12px 48px rgba(0,0,0,0.18)", width: width || 380, maxWidth: "90vw", fontFamily: FONT_UI }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{title}</span>
          <span onClick={onClose} style={{ cursor: "pointer", fontSize: 18, color: B.grey, lineHeight: 1 }}>×</span>
        </div>
        <div style={{ padding: "16px 20px" }}>{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// INLINE PHRASE INPUT — with label on same line
// ============================================================
function InlinePhraseInput({ label, value, onChange, phrasePool, placeholder, onSavePhrase, onDeletePhrase, customPhrases, onIcdSelect, readOnly }) {
  const ref = useRef(null);
  const [dd, setDd] = useState({ show: false, items: [], idx: 0, startPos: 0 });

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    const caret = e.target.selectionStart;
    const before = val.substring(0, caret);
    const singleIdx = before.lastIndexOf("\\");
    if (singleIdx >= 0 && (singleIdx === 0 || before[singleIdx - 1] !== "\\")) {
      const query = before.substring(singleIdx + 1);
      if (!query.includes("\n") && !query.includes(";")) {
        const lower = query.toLowerCase();
        const filtered = lower
          ? phrasePool.filter(p => { const t = typeof p === "object" ? p.name : p; const icd = typeof p === "object" && p.icd ? p.icd.toLowerCase() : ""; return t.toLowerCase().includes(lower) || icd.includes(lower); })
          : phrasePool.slice(0, 8);
        if (filtered.length) {
          setDd({ show: true, items: filtered, idx: 0, startPos: singleIdx });
          return;
        }
      }
      if (query.includes(";")) {
        const phrase = query.replace(/;$/, "").trim();
        if (phrase) {
          if (onSavePhrase) onSavePhrase(phrase);
          const newVal = val.substring(0, singleIdx) + phrase + val.substring(caret);
          onChange(newVal);
        }
        setDd({ show: false, items: [], idx: 0, startPos: 0 });
        return;
      }
    }
    setDd({ show: false, items: [], idx: 0, startPos: 0 });
  };

  const insertPhrase = (phrase) => {
    const text = typeof phrase === "object" ? phrase.name : phrase;
    if (typeof phrase === "object" && phrase.icd && onIcdSelect) {
      onIcdSelect(phrase.name, phrase.icd);
    }
    const el = ref.current;
    if (!el) return;
    const caret = el.selectionStart;
    const sp = dd.startPos;
    const newVal = value.substring(0, sp) + text + value.substring(caret);
    onChange(newVal);
    setDd({ show: false, items: [], idx: 0, startPos: 0 });
    setTimeout(() => { el.focus(); const pos = sp + text.length; el.setSelectionRange(pos, pos); }, 0);
  };

  const handleKeyDown = (e) => {
    if (dd.show && dd.items.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setDd(d => ({ ...d, idx: Math.min(d.idx + 1, d.items.length - 1) })); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setDd(d => ({ ...d, idx: Math.max(d.idx - 1, 0) })); return; }
      if (e.key === "Enter") { e.preventDefault(); insertPhrase(dd.items[dd.idx]); return; }
      if (e.key === "Escape") { e.preventDefault(); setDd({ show: false, items: [], idx: 0, startPos: 0 }); return; }
    }
    // Whole-phrase backspace
    if (e.key === "Backspace" && ref.current) {
      const el = ref.current;
      const caret = el.selectionStart;
      const selEnd = el.selectionEnd;
      if (caret === selEnd && caret > 0) {
        const hit = findPhraseAtCursor(value, caret, phrasePool);
        if (hit) {
          e.preventDefault();
          const newVal = value.substring(0, hit.start) + value.substring(hit.end);
          onChange(newVal);
          setTimeout(() => { el.focus(); el.setSelectionRange(hit.start, hit.start); }, 0);
        }
      }
    }
  };

  const autoResize = (el) => { if (!el) return; el.style.height = "0"; el.style.height = Math.max(LINE_H, el.scrollHeight) + "px"; };

  useEffect(() => { if (ref.current) autoResize(ref.current); }, [value]);

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "flex-start" }}>
      <span style={{ fontSize: 9.5, fontWeight: 600, color: B.grey, fontFamily: FONT_UI, whiteSpace: "nowrap", marginRight: 6, lineHeight: `${LINE_H}px` }}>{label}</span>
      <div style={{ position: "relative", flex: 1 }}>
        {/* Highlight overlay */}
        <div aria-hidden="true" style={{
          position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none",
          fontFamily: FONT_BODY, fontSize: 17, lineHeight: `${LINE_H}px`,
          padding: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
          minHeight: LINE_H, overflow: "hidden", boxSizing: "border-box",
        }}>{highlightPhrases(value, phrasePool)}</div>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => { if (readOnly) return; handleChange(e); autoResize(e.target); }}
          onKeyDown={(e) => { if (readOnly) return; handleKeyDown(e); }}
          placeholder={readOnly ? "" : placeholder}
          readOnly={readOnly}
          rows={1}
          style={{
            width: "100%", border: "none", outline: "none", resize: "none",
            fontFamily: FONT_BODY, fontSize: 17, lineHeight: `${LINE_H}px`,
            color: "transparent", caretColor: readOnly ? "transparent" : B.dark, background: "transparent", padding: 0, boxSizing: "border-box",
            minHeight: LINE_H, overflow: "hidden", display: "block",
            position: "relative", zIndex: 1, cursor: readOnly ? "default" : "text",
          }}
        />
        {dd.show && (
          <Dropdown items={dd.items} idx={dd.idx} onSelect={insertPhrase} isSection={false} onDelete={onDeletePhrase} customItems={customPhrases} />
        )}
      </div>
    </div>
  );
}

// ============================================================
// RX EDITOR
// ============================================================
function RxEditor({ patient, onSave, customPhrases, onSavePhrase, onDeletePhrase, dataRef, onLiveConditions, onLiveFollowUp, initialData, readOnly, signedAt }) {
  const [sections, setSections] = useState(() => {
    if (initialData && initialData.sections) return initialData.sections;
    return [{ id: "symptoms", label: "Symptoms", content: "" }];
  });
  const [dropdown, setDropdown] = useState({ show: false, items: [], idx: 0, type: null, secId: null, startPos: 0 });
  const [customSections, setCustomSections] = useState(() => initialData ? (initialData.customSections || []) : []);
  const textareaRefs = useRef({});
  const focusedSecId = useRef(null);
  const [dateError, setDateError] = useState(false);
  const [icdCodes, setIcdCodes] = useState(() => initialData ? (initialData.icdCodes || {}) : {});

  // Patient identity ALWAYS from authoritative patient prop (read-only on Rx pad)
  const [pName, setPName] = useState(patient.name);
  const [pAge, setPAge] = useState(String(patient.age));
  const [pGender, setPGender] = useState(patient.gender);
  const [pPhone, setPPhone] = useState(patient.phone);
  // Prescription content restores from initialData snapshot
  const [knownConditions, setKnownConditions] = useState(() => initialData ? (initialData.knownConditions || patient.conditions.join(", ")) : patient.conditions.join(", "));
  const [testValues, setTestValues] = useState(() => initialData ? (initialData.testValues || "") : "");

  // Keep dataRef in sync so parent can read current Rx data
  useEffect(() => {
    if (dataRef) {
      dataRef.current = { pName, pAge, pGender, pPhone, knownConditions, testValues, sections, icdCodes, customSections, date: getIST() };
    }
  }, [pName, pAge, pGender, pPhone, knownConditions, testValues, sections, icdCodes, customSections, dataRef]);

  // Push live conditions to parent for Summary Status sync
  useEffect(() => {
    if (onLiveConditions) onLiveConditions(knownConditions);
  }, [knownConditions, onLiveConditions]);

  // Push live follow-up date to parent for Summary Status sync
  useEffect(() => {
    if (onLiveFollowUp) {
      const fuSec = sections.find(s => s.id === "followup");
      onLiveFollowUp(fuSec ? fuSec.content : "");
    }
  }, [sections, onLiveFollowUp]);

  // Note: patient changes are handled by parent remounting via key={activePage.id}

  const allSectionDefs = useMemo(() => [
    ...ALL_SECTIONS,
    ...customSections.map(c => ({ id: "custom_" + c.toLowerCase().replace(/\s+/g, "_"), label: c, shortcut: "" })),
  ], [customSections]);

  const addSection = useCallback((secDef, afterSecId) => {
    setSections(prev => {
      if (prev.find(s => s.id === secDef.id)) {
        setTimeout(() => { const el = textareaRefs.current[secDef.id]; if (el) el.focus(); }, 0);
        return prev;
      }
      const newSec = { id: secDef.id, label: secDef.label, content: secDef.id === "followup" ? getTomorrowISO() : "" };
      if (afterSecId) {
        const idx = prev.findIndex(s => s.id === afterSecId);
        if (idx >= 0) {
          const next = [...prev];
          next.splice(idx + 1, 0, newSec);
          setTimeout(() => { const el = textareaRefs.current[secDef.id]; if (el) el.focus(); }, 50);
          return next;
        }
      }
      const next = [...prev, newSec];
      setTimeout(() => { const el = textareaRefs.current[secDef.id]; if (el) el.focus(); }, 50);
      return next;
    });
    hideDropdown();
  }, []);

  const addCustomSection = useCallback((name, afterSecId) => {
    const id = "custom_" + name.toLowerCase().replace(/\s+/g, "_");
    setCustomSections(prev => prev.includes(name) ? prev : [...prev, name]);
    setSections(prev => {
      if (prev.find(s => s.id === id)) return prev;
      const newSec = { id, label: name, content: "" };
      if (afterSecId) {
        const idx = prev.findIndex(s => s.id === afterSecId);
        if (idx >= 0) {
          const next = [...prev];
          next.splice(idx + 1, 0, newSec);
          setTimeout(() => { const el = textareaRefs.current[id]; if (el) el.focus(); }, 50);
          return next;
        }
      }
      const next = [...prev, newSec];
      setTimeout(() => { const el = textareaRefs.current[id]; if (el) el.focus(); }, 50);
      return next;
    });
    hideDropdown();
  }, []);

  const hideDropdown = () => setDropdown({ show: false, items: [], idx: 0, type: null, secId: null, startPos: 0 });

  const getPhrasePool = (secId) => {
    const builtIn = PHRASES[secId] || [];
    const custom = customPhrases[secId] || [];
    return [...builtIn, ...custom];
  };

  const deleteSection = (secId) => {
    setSections(prev => prev.filter(s => s.id !== secId));
  };

  const updateContent = (secId, val) => {
    setSections(prev => prev.map(s => s.id === secId ? { ...s, content: val } : s));
  };

  const handleChange = (secId, e) => {
    const val = e.target.value;
    updateContent(secId, val);
    const caret = e.target.selectionStart;
    const before = val.substring(0, caret);

    const dblIdx = before.lastIndexOf("\\\\");
    if (dblIdx >= 0 && !before.substring(dblIdx + 2).includes("\n") && !before.substring(dblIdx + 2).includes(";")) {
      const query = before.substring(dblIdx + 2).toLowerCase();
      const existing = new Set(sections.map(s => s.id));
      const filtered = allSectionDefs.filter(s => s.label.toLowerCase().includes(query) && !existing.has(s.id));
      setDropdown({ show: true, items: filtered, idx: 0, type: "section", secId, startPos: dblIdx });
      return;
    }

    const singleIdx = before.lastIndexOf("\\");
    if (singleIdx >= 0 && (singleIdx === 0 || before[singleIdx - 1] !== "\\")) {
      const query = before.substring(singleIdx + 1);
      if (!query.includes("\n") && !query.includes(";")) {
        const pool = getPhrasePool(secId);
        const lower = query.toLowerCase();
        const filtered = lower
          ? pool.filter(p => { const t = typeof p === "object" ? p.name : p; const icd = typeof p === "object" && p.icd ? p.icd.toLowerCase() : ""; return t.toLowerCase().includes(lower) || icd.includes(lower); })
          : pool.slice(0, 8);
        if (filtered.length) {
          setDropdown({ show: true, items: filtered, idx: 0, type: "phrase", secId, startPos: singleIdx });
          return;
        }
      }
      if (query.includes(";")) {
        const phrase = query.replace(/;$/, "").trim();
        if (phrase) {
          onSavePhrase(secId, phrase);
          const newVal = val.substring(0, singleIdx) + phrase + val.substring(caret);
          updateContent(secId, newVal);
        }
        hideDropdown();
        return;
      }
    }
    hideDropdown();
  };

  const insertPhrase = (secId, phrase) => {
    const text = typeof phrase === "object" ? phrase.name : phrase;
    // Track ICD code if present
    if (typeof phrase === "object" && phrase.icd) {
      setIcdCodes(prev => ({ ...prev, [phrase.name]: phrase.icd }));
    }
    setSections(prev => prev.map(s => {
      if (s.id !== secId) return s;
      const el = textareaRefs.current[secId];
      if (!el) return s;
      const caret = el.selectionStart;
      const sp = dropdown.startPos;
      const newVal = s.content.substring(0, sp) + text + s.content.substring(caret);
      setTimeout(() => { el.focus(); const pos = sp + text.length; el.setSelectionRange(pos, pos); }, 0);
      return { ...s, content: newVal };
    }));
    hideDropdown();
  };

  const insertSection = (currentSecId, secDef) => {
    setSections(prev => prev.map(s => {
      if (s.id !== currentSecId) return s;
      const el = textareaRefs.current[currentSecId];
      if (!el) return s;
      const caret = el.selectionStart;
      const sp = dropdown.startPos;
      const newVal = s.content.substring(0, sp) + s.content.substring(caret);
      return { ...s, content: newVal };
    }));
    addSection(secDef, currentSecId);
  };

  const handleKeyDown = (secId, e) => {
    if (dropdown.show && dropdown.items.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setDropdown(d => ({ ...d, idx: Math.min(d.idx + 1, d.items.length - 1) })); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setDropdown(d => ({ ...d, idx: Math.max(d.idx - 1, 0) })); return; }
      if (e.key === "Enter") {
        e.preventDefault();
        if (dropdown.type === "section") insertSection(secId, dropdown.items[dropdown.idx]);
        else insertPhrase(secId, dropdown.items[dropdown.idx]);
        return;
      }
      if (e.key === "Escape") { e.preventDefault(); hideDropdown(); return; }
    }
    if (e.key === "Enter" && dropdown.show && dropdown.type === "section" && dropdown.items.length === 0) {
      e.preventDefault();
      const el = e.target;
      const before = el.value.substring(0, el.selectionStart);
      const dblIdx = before.lastIndexOf("\\\\");
      if (dblIdx >= 0) {
        const name = before.substring(dblIdx + 2).trim();
        if (name) {
          const clean = el.value.substring(0, dblIdx) + el.value.substring(el.selectionStart);
          updateContent(secId, clean);
          addCustomSection(name, secId);
        }
      }
      hideDropdown();
    }
    // Whole-phrase backspace in section textareas
    if (e.key === "Backspace" && !dropdown.show) {
      const el = e.target;
      const caret = el.selectionStart;
      const selEnd = el.selectionEnd;
      if (caret === selEnd && caret > 0) {
        const pool = getPhrasePool(secId);
        const hit = findPhraseAtCursor(el.value, caret, pool);
        if (hit) {
          e.preventDefault();
          const newVal = el.value.substring(0, hit.start) + el.value.substring(hit.end);
          updateContent(secId, newVal);
          setTimeout(() => { el.focus(); el.setSelectionRange(hit.start, hit.start); autoResize(el); }, 0);
        }
      }
    }
    // Arrow key navigation between sections (only when dropdown is closed)
    if (!dropdown.show && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      const el = e.target;
      const posBefore = el.selectionStart;
      const key = e.key;
      const secIdCopy = secId;
      setTimeout(() => {
        const posAfter = el.selectionStart;
        if (posAfter === posBefore) {
          const secIdx = sections.findIndex(s => s.id === secIdCopy);
          if (key === "ArrowUp" && secIdx > 0) {
            const prevId = sections[secIdx - 1].id;
            const prevEl = textareaRefs.current[prevId];
            if (prevEl) { prevEl.focus(); const len = prevEl.value.length; prevEl.setSelectionRange(len, len); }
          }
          if (key === "ArrowDown" && secIdx < sections.length - 1) {
            const nextId = sections[secIdx + 1].id;
            const nextEl = textareaRefs.current[nextId];
            if (nextEl) { nextEl.focus(); nextEl.setSelectionRange(0, 0); }
          }
        }
      }, 0);
    }
  };

  const autoResize = (el) => { if (!el) return; el.style.height = "0"; el.style.height = Math.max(LINE_H, el.scrollHeight) + "px"; };

  useEffect(() => {
    const handler = (e) => {
      if (e.metaKey || e.ctrlKey) {
        const map = { s: "symptoms", d: "diagnosis", r: "rx", t: "treatment", o: "tests", f: "followup" };
        const k = e.key.toLowerCase();
        if (map[k]) { e.preventDefault(); const def = ALL_SECTIONS.find(s => s.id === map[k]); if (def) addSection(def, focusedSecId.current); }
        if (k === "enter" && !readOnly) { e.preventDefault(); onSave?.(); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [addSection, onSave]);

  return (
    <div style={{
      minHeight: "100%", padding: "0 28px 80px",
      backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${LINE_H - 1}px, ${B.rule} ${LINE_H - 1}px, ${B.rule} ${LINE_H}px)`,
      backgroundSize: `100% ${LINE_H}px`,
      backgroundPosition: "0 0",
      position: "relative",
    }}>
      <div style={{ position: "absolute", right: 28, top: 8, fontSize: 56, fontFamily: "Georgia, serif", fontStyle: "italic", color: B.orange, opacity: 0.06, userSelect: "none", pointerEvents: "none", fontWeight: 700 }}>℞</div>

      {/* DATE — right aligned, first line */}
      <div style={{ height: LINE_H, lineHeight: `${LINE_H}px`, textAlign: "right", fontFamily: FONT_BODY, fontSize: 17, color: B.secondary }}>
        {getIST()}
      </div>

      {/* PATIENT DETAILS heading */}
      <div style={{ height: LINE_H, lineHeight: `${LINE_H}px` }}>
        <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: B.green, fontFamily: FONT_UI }}>Patient Details</span>
      </div>

      {/* Patient info — read-only */}
      <div style={{ height: LINE_H, lineHeight: `${LINE_H}px`, fontFamily: FONT_BODY, fontSize: 17, color: B.dark }}>
        {pName}{pAge ? ` / ${pAge} years` : ""}{pGender ? ` / ${pGender}` : ""}{pPhone ? ` / ${pPhone}` : ""}
      </div>

      {/* Known Conditions — own line */}
      <InlinePhraseInput
        label="Known Conditions:"
        value={knownConditions}
        onChange={setKnownConditions}
        phrasePool={(() => {
          const pool = [...PHRASES.diagnosis, ...(customPhrases.diagnosis || [])];
          const poolNames = new Set(pool.map(p => typeof p === "object" ? p.name.toLowerCase() : p.toLowerCase()));
          patient.conditions.forEach(c => { if (!poolNames.has(c.toLowerCase())) pool.push(c); });
          return pool;
        })()}
        placeholder="type \ for phrases..."
        onSavePhrase={(p) => onSavePhrase("diagnosis", p)}
        onDeletePhrase={(p) => onDeletePhrase("diagnosis", p)}
        customPhrases={customPhrases.diagnosis || []}
        onIcdSelect={(name, code) => setIcdCodes(prev => ({ ...prev, [name]: code }))}
        readOnly={readOnly}
      />
      <InlinePhraseInput
        label="Test Values:"
        value={testValues}
        onChange={setTestValues}
        phrasePool={[...PHRASES.tests, ...(customPhrases.tests || [])]}
        placeholder="type \ for phrases..."
        onSavePhrase={(p) => onSavePhrase("tests", p)}
        onDeletePhrase={(p) => onDeletePhrase("tests", p)}
        customPhrases={customPhrases.tests || []}
        readOnly={readOnly}
      />

      {/* DYNAMIC SECTIONS */}
      {sections.map((sec) => (
        <div key={sec.id} style={{ position: "relative" }}>
          <div style={{ height: LINE_H, lineHeight: `${LINE_H}px`, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8,
              color: sec.id === "rx" ? B.orange : B.green, fontFamily: FONT_UI,
            }}>{sec.id === "followup" ? "Next review on:" : sec.label}</span>
            {sec.id === "followup" && (
              <input
                type="date"
                ref={el => { textareaRefs.current[sec.id] = el; }}
                value={sec.content}
                min={getTomorrowISO()}
                disabled={readOnly}
                onChange={e => {
                  if (readOnly) return;
                  const val = e.target.value;
                  if (val && val < getTomorrowISO()) {
                    setDateError(true);
                    updateContent(sec.id, getTomorrowISO());
                  } else {
                    updateContent(sec.id, val);
                  }
                }}
                onFocus={() => { focusedSecId.current = sec.id; }}
                style={{
                  border: "none", borderBottom: "1px dashed #ccc", outline: "none",
                  fontFamily: FONT_BODY, fontSize: 17, lineHeight: `${LINE_H}px`, height: LINE_H,
                  color: B.dark, background: "transparent", padding: 0, cursor: readOnly ? "default" : "pointer",
                  opacity: readOnly ? 0.7 : 1,
                }}
              />
            )}
            {!readOnly && <svg onClick={() => deleteSection(sec.id)} style={{ cursor: "pointer", opacity: 0.35, flexShrink: 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={B.grey} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" title="Remove section"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>}
          </div>
          {sec.id !== "followup" && (
          <div style={{ position: "relative" }}>
            {/* Highlight overlay */}
            <div aria-hidden="true" style={{
              position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none",
              fontFamily: FONT_BODY, fontSize: 17, lineHeight: `${LINE_H}px`,
              padding: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
              minHeight: LINE_H, overflow: "hidden", boxSizing: "border-box",
            }}>{highlightPhrases(sec.content, getPhrasePool(sec.id))}</div>
            <textarea
              ref={el => { textareaRefs.current[sec.id] = el; if (el) autoResize(el); }}
              value={sec.content}
              onChange={e => { if (readOnly) return; handleChange(sec.id, e); autoResize(e.target); }}
              onKeyDown={e => { if (readOnly) return; handleKeyDown(sec.id, e); }}
              onFocus={() => { focusedSecId.current = sec.id; }}
              placeholder={readOnly ? "" : "Type here or press \\ for saved phrases..."}
              readOnly={readOnly}
              rows={1}
              style={{
                width: "100%", border: "none", outline: "none", resize: "none",
                fontFamily: FONT_BODY, fontSize: 17, lineHeight: `${LINE_H}px`,
                color: "transparent", caretColor: readOnly ? "transparent" : B.dark, background: "transparent", padding: 0,
                minHeight: LINE_H, overflow: "hidden", boxSizing: "border-box", display: "block",
                position: "relative", zIndex: 1, cursor: readOnly ? "default" : "text",
              }}
            />
            {dropdown.show && dropdown.secId === sec.id && (
              <Dropdown items={dropdown.items} idx={dropdown.idx}
                onSelect={(item) => { dropdown.type === "section" ? insertSection(sec.id, item) : insertPhrase(sec.id, item); }}
                isSection={dropdown.type === "section"}
                onDelete={dropdown.type === "phrase" ? (item) => onDeletePhrase(sec.id, item) : undefined}
                customItems={dropdown.type === "phrase" ? (customPhrases[sec.id] || []) : undefined} />
            )}
          </div>
          )}
        </div>
      ))}
      {/* Date validation error modal */}
      <Modal open={dateError} onClose={() => setDateError(false)} title="Invalid Date" width={340}>
        <div style={{ fontSize: 13, color: B.secondary, lineHeight: 1.6, marginBottom: 14 }}>
          Follow-up date must be after the prescription date. The date has been reset to tomorrow.
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setDateError(false)} style={{ padding: "6px 18px", borderRadius: 6, border: "none", background: B.orange, color: B.white, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>OK</button>
        </div>
      </Modal>

      {/* Signed stamp overlay */}
      {readOnly && signedAt && (
        <div style={{
          position: "absolute", bottom: 24, right: 32,
          border: `3px solid ${B.green}`, borderRadius: 8, padding: "8px 18px",
          color: B.green, fontWeight: 700, fontSize: 11, fontFamily: FONT_UI,
          transform: "rotate(-5deg)", opacity: 0.65, pointerEvents: "none",
          textAlign: "center", lineHeight: 1.5, background: "rgba(255,255,255,0.85)",
          zIndex: 5,
        }}>
          SIGNED<br />
          {new Date(signedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function OrangeScript({ cloudDoctor }) {
  const { signOut, saveDoctorProfile: saveProfileToCloud, user } = useAuth();
  const doctorId = user?.id;
  const noteIdMapRef = useRef({});
  const currentRxIdRef = useRef(null); // Supabase prescription UUID for the active Rx page
  const [dataLoaded, setDataLoaded] = useState(false);
  const [patients, setPatients] = usePersistedState("patients", [...PATIENTS]);
  const [patient, setPatient] = useState(() => {
    const saved = lsGet("activePatient", null);
    if (saved) return saved;
    const persisted = lsGet("patients", PATIENTS);
    return persisted.length > 0 ? persisted[0] : null;
  });
  const [doctor, setDoctor] = usePersistedState("doctor", cloudDoctor || { ...DEFAULT_DOCTOR });
  const [doctorModal, setDoctorModal] = useState(false);
  const [doctorForm, setDoctorForm] = useState(cloudDoctor || { ...DEFAULT_DOCTOR });
  const [search, setSearch] = useState("");
  const [leftTab, setLeftTab] = useState("patients");
  const [rxPages, setRxPages] = useState(() => {
    const persisted = lsGet("patients", PATIENTS);
    if (persisted.length === 0) return [];
    const firstId = Date.now();
    const firstPatient = lsGet("activePatient", persisted[0]);
    return [{ id: firstId, patientId: firstPatient.id, data: null, saved: false, createdAt: new Date().toISOString() }];
  });
  const [activePageId, setActivePageId] = useState(() => rxPages.length > 0 ? rxPages[0].id : null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [openCards, setOpenCards] = useState({ summary: true, reports: true });
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [customPhrases, setCustomPhrases] = usePersistedState("customPhrases", {});
  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", age: "", gender: "", dob: "", phone: "", email: "" });
  const [addModal, setAddModal] = useState(false);
  const [savedTemplates, setSavedTemplates] = usePersistedState("savedTemplates", []);
  const [templateModal, setTemplateModal] = useState(null); // { name, sections, testValues, icdCodes, customSections }
  const online = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState("idle");
  const [liveConditions, setLiveConditions] = useState(patient ? (patient.knownConditions || patient.conditions.join(", ")) : "");
  const [liveFollowUp, setLiveFollowUp] = useState("");

  // ── Helper: load prescriptions for a single patient from Supabase ──
  const loadPatientPrescriptions = useCallback(async (patientId) => {
    if (!doctorId || !patientId) return;
    try {
      const dbRxs = await db.fetchPrescriptionsForPatient(doctorId, patientId);
      if (dbRxs.length > 0) {
        // Build Rx pages (oldest → newest so latest is last)
        const pages = dbRxs.map((rx, i) => ({
          id: Date.now() + i,
          patientId: rx.patient_id,
          supabaseRxId: rx.id,
          data: {
            sections: rx.sections || [],
            knownConditions: rx.known_conditions || "",
            testValues: rx.test_values || "",
            icdCodes: rx.icd_codes || {},
            customSections: rx.custom_sections || [],
          },
          saved: true,
          signed: !!rx.signed_at,
          signedAt: rx.signed_at || null,
          createdAt: rx.created_at,
        }));

        // Replace only this patient's pages (keep pages for other patients)
        setRxPages(prev => {
          const otherPages = prev.filter(pg => pg.patientId !== patientId);
          return [...otherPages, ...pages];
        });
        const lastPage = pages[pages.length - 1];
        setActivePageId(lastPage.id);
        currentRxIdRef.current = lastPage.supabaseRxId || null;

        // Sync latest Rx known_conditions → patient record and liveConditions
        const latestRx = dbRxs[dbRxs.length - 1]; // newest (ascending order)
        const latestConditions = latestRx.known_conditions || "";
        // Immediately update liveConditions so Summary Status shows them
        if (latestConditions) setLiveConditions(latestConditions);
        setPatients(prev => prev.map(p => {
          if (p.id !== patientId) return p;
          if (p.knownConditions === latestConditions) return p;
          // Update patient in-memory and persist to DB
          db.updatePatientConditions(doctorId, patientId, latestConditions).catch(e => console.error("Failed to sync patient conditions:", e));
          const updated = { ...p, knownConditions: latestConditions, conditions: latestConditions ? latestConditions.split(",").map(c => c.trim()).filter(Boolean) : [] };
          // Also update active patient if it's this one
          setPatient(prev => prev && prev.id === patientId ? updated : prev);
          lsSet("activePatient", updated);
          return updated;
        }));
      } else {
        // No prescriptions — create a blank page
        const blankPage = { id: Date.now(), patientId, data: null, saved: false, signed: false, signedAt: null, createdAt: new Date().toISOString() };
        setRxPages(prev => {
          const otherPages = prev.filter(pg => pg.patientId !== patientId);
          return [...otherPages, blankPage];
        });
        setActivePageId(blankPage.id);
        currentRxIdRef.current = null;
      }
    } catch (err) {
      console.error("Failed to load prescriptions for patient:", err);
      // Fallback: create a blank page
      const blankPage = { id: Date.now(), patientId, data: null, saved: false, signed: false, signedAt: null, createdAt: new Date().toISOString() };
      setRxPages(prev => {
        const otherPages = prev.filter(pg => pg.patientId !== patientId);
        return [...otherPages, blankPage];
      });
      setActivePageId(blankPage.id);
      currentRxIdRef.current = null;
    }
  }, [doctorId]);

  // ── Load all data from Supabase on mount ──
  useEffect(() => {
    if (!doctorId) return;
    let cancelled = false;

    async function loadAllData() {
      try {
        const [dbPatients, dbTemplates, dbPhrases, dbNotes] = await Promise.all([
          db.fetchDoctorPatients(doctorId),
          db.fetchTemplates(doctorId),
          db.fetchCustomPhrases(doctorId),
          db.fetchPatientNotes(doctorId),
        ]);

        if (cancelled) return;

        // Patients
        if (dbPatients.length > 0) {
          setPatients(dbPatients);
          const activeP = lsGet("activePatient", null);
          const matchedP = activeP ? dbPatients.find(p => p.id === activeP.id) : null;
          const selectedPatient = matchedP || dbPatients[0];
          setPatient(selectedPatient);
          lsSet("activePatient", selectedPatient);

          // Lazy-load prescriptions for the initially selected patient
          await loadPatientPrescriptions(selectedPatient.id);
        }

        // Templates
        if (dbTemplates.length > 0) {
          const mapped = dbTemplates.map(t => ({
            id: t.id,
            name: t.name,
            sections: t.sections || [],
            testValues: t.test_values || "",
            icdCodes: t.icd_codes || {},
            customSections: t.custom_sections || [],
          }));
          setSavedTemplates(mapped);
        }

        // Custom Phrases
        const phraseMap = db.groupPhrasesBySection(dbPhrases);
        if (Object.keys(phraseMap).length > 0) setCustomPhrases(phraseMap);

        // Patient Notes
        const { noteMap, idMap } = db.groupNotesByPatient(dbNotes);
        if (Object.keys(noteMap).length > 0) setPatientNotes(noteMap);
        noteIdMapRef.current = idMap;

        setDataLoaded(true);
      } catch (err) {
        console.error("Failed to load data from Supabase:", err);
        setDataLoaded(true); // Fall back to localStorage
      }
    }

    loadAllData();
    return () => { cancelled = true; };
  }, [doctorId]);

  // Persist active patient selection — lazy-loads prescriptions from Supabase
  const selectPatient = useCallback((p) => {
    // Snapshot current page before switching
    if (rxDataRef.current && Object.keys(rxDataRef.current).length > 0) {
      setRxPages(prev => prev.map(pg => pg.id === activePageId ? { ...pg, data: { ...rxDataRef.current } } : pg));
    }
    setPatient(p);
    lsSet("activePatient", p);
    setLiveConditions(p.knownConditions || p.conditions.join(", "));
    setLiveFollowUp("");

    // Fetch prescriptions from Supabase for this patient
    loadPatientPrescriptions(p.id);
  }, [activePageId, loadPatientPrescriptions]);

  const savePhrase = useCallback((secId, phrase) => {
    setCustomPhrases(prev => {
      const existing = prev[secId] || [];
      if (existing.includes(phrase)) return prev;
      return { ...prev, [secId]: [...existing, phrase] };
    });
    if (doctorId) db.createPhrase(doctorId, secId, phrase).catch(e => console.error("Cloud phrase save failed:", e));
  }, [doctorId]);

  const deletePhrase = useCallback((secId, phrase) => {
    const text = typeof phrase === "object" ? phrase.name : phrase;
    setCustomPhrases(prev => {
      const existing = prev[secId] || [];
      return { ...prev, [secId]: existing.filter(p => p !== text) };
    });
    if (doctorId) db.deletePhrase(doctorId, secId, text).catch(e => console.error("Cloud phrase delete failed:", e));
  }, [doctorId]);

  const filteredPatients = useMemo(() => {
    if (!search) return patients;
    const q = search.toLowerCase();
    return patients.filter(p => p.name.toLowerCase().includes(q) || p.phone.includes(q));
  }, [search, patients]);

  const openEditModal = (p) => {
    setEditForm({ name: p.name, age: String(p.age), gender: p.gender, dob: p.dob || "", phone: p.phone, email: p.email || "" });
    setEditModal(p);
  };

  const openAddModal = () => {
    setEditForm({ name: "", age: "", gender: "", dob: "", phone: "", email: "" });
    setAddModal(true);
  };

  const openDoctorModal = () => {
    setDoctorForm({ ...doctor });
    setDoctorModal(true);
  };

  const confirmDoctorSettings = async () => {
    if (!doctorForm.name.trim()) return;
    setDoctor({ ...doctorForm });
    setDoctorModal(false);
    // Sync to cloud
    const { error } = await saveProfileToCloud(doctorForm);
    if (error) console.error("Failed to sync doctor profile:", error);
  };

  const handleEditDob = (dob) => {
    const derivedAge = ageFromDob(dob);
    setEditForm(f => ({ ...f, dob, age: derivedAge !== "" ? String(derivedAge) : f.age }));
  };

  const handleEditAge = (age) => {
    setEditForm(f => ({ ...f, age, dob: f.dob ? f.dob : (age ? dobFromAge(age) : "") }));
  };

  const confirmEdit = () => {
    if (!editModal) return;
    const updated = { ...editModal, name: editForm.name, age: Number(editForm.age) || editModal.age, gender: editForm.gender, dob: editForm.dob, phone: editForm.phone, email: editForm.email };
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (patient && patient.id === updated.id) selectPatient(updated);
    setEditModal(null);
    // Sync to Supabase
    if (doctorId && updated.id) {
      db.updatePatient(updated.id, { name: updated.name, gender: updated.gender, dob: updated.dob, age: updated.age, phone: updated.phone, email: updated.email })
        .catch(e => console.error("Cloud patient update failed:", e));
    }
  };

  const confirmAdd = async () => {
    if (!editForm.name.trim()) return;
    // Try to create in Supabase first to get UUID
    let patientUUID = null;
    if (doctorId) {
      try {
        patientUUID = await db.createPatient(doctorId, {
          name: editForm.name.trim(), gender: editForm.gender || "M", dob: editForm.dob || null,
          age: Number(editForm.age) || 0, phone: editForm.phone.trim(), email: editForm.email.trim(),
        });
      } catch (e) { console.error("Cloud patient create failed:", e); }
    }
    const newPatient = {
      id: patientUUID || Date.now(),
      name: editForm.name.trim(),
      age: Number(editForm.age) || 0,
      gender: editForm.gender || "M",
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
      dob: editForm.dob,
      conditions: [],
      lastVisit: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }),
      notes: "",
    };
    setPatients(prev => [newPatient, ...prev]);
    selectPatient(newPatient);
    setAddModal(false);
  };

  const confirmDelete = () => {
    if (!deleteModal) return;
    const deletedId = deleteModal.id;
    setPatients(prev => {
      const next = prev.filter(p => p.id !== deletedId);
      if (patient && patient.id === deletedId) {
        if (next.length > 0) selectPatient(next[0]);
        else { setPatient(null); setActivePageId(null); setRxPages([]); lsSet("activePatient", null); }
      }
      return next;
    });
    setDeleteModal(null);
    // Unlink from Supabase
    if (doctorId && deletedId) {
      db.deletePatientLink(doctorId, deletedId).catch(e => console.error("Cloud patient unlink failed:", e));
    }
  };

  // ── Template Management ──
  const openSaveTemplateModal = useCallback(() => {
    const data = rxDataRef.current;
    if (!data || !data.sections || data.sections.filter(s => s.content.trim()).length === 0) return;
    // Convert follow-up absolute date to relative days for template
    const today = getTodayISO();
    const sections = (data.sections || []).map(s => {
      if (s.id === "followup" && s.content.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const days = daysBetweenISO(today, s.content);
        return { ...s, content: String(Math.max(days, 1)) };
      }
      return { ...s };
    });
    setTemplateModal({
      name: "",
      sections,
      testValues: data.testValues || "",
      icdCodes: data.icdCodes || {},
      customSections: data.customSections || [],
    });
  }, []);

  const confirmSaveTemplate = useCallback(() => {
    if (!templateModal || !templateModal.name.trim()) return;
    const tplData = {
      name: templateModal.name.trim(),
      sections: templateModal.sections,
      testValues: templateModal.testValues,
      icdCodes: templateModal.icdCodes,
      customSections: templateModal.customSections,
    };
    if (templateModal.editId) {
      // Update existing template
      setSavedTemplates(prev => prev.map(t => t.id === templateModal.editId ? { ...t, ...tplData } : t));
      if (doctorId && templateModal.editId) {
        db.updateTemplate(templateModal.editId, tplData).catch(e => console.error("Cloud template update failed:", e));
      }
    } else {
      // Create new template
      const localId = Date.now();
      const tpl = { id: localId, ...tplData };
      setSavedTemplates(prev => [...prev, tpl]);
      if (doctorId) {
        db.createTemplate(doctorId, tplData).then(dbTpl => {
          if (dbTpl) setSavedTemplates(prev => prev.map(t => t.id === localId ? { ...t, id: dbTpl.id } : t));
        }).catch(e => console.error("Cloud template create failed:", e));
      }
    }
    setTemplateModal(null);
  }, [templateModal, setSavedTemplates, doctorId]);

  const openEditTemplateModal = useCallback((tpl) => {
    setTemplateModal({
      editId: tpl.id,
      name: tpl.name,
      sections: (tpl.sections || []).map(s => ({ ...s })),
      testValues: tpl.testValues || "",
      icdCodes: tpl.icdCodes || {},
      customSections: tpl.customSections || [],
    });
  }, []);

  const deleteTemplate = useCallback((tplId) => {
    setSavedTemplates(prev => prev.filter(t => t.id !== tplId));
    if (doctorId && tplId) {
      db.deleteTemplate(tplId).catch(e => console.error("Cloud template delete failed:", e));
    }
  }, [setSavedTemplates, doctorId]);

  const applyTemplate = useCallback((tpl) => {
    // Snapshot current page, then overwrite with template data and remount
    if (rxDataRef.current && Object.keys(rxDataRef.current).length > 0) {
      setRxPages(prev => prev.map(p => p.id === activePageId ? { ...p, data: { ...rxDataRef.current } } : p));
    }
    // Convert follow-up relative days back to absolute date
    const today = getTodayISO();
    const sections = (tpl.sections || []).map(s => {
      if (s.id === "followup" && s.content.match(/^\d+$/)) {
        return { ...s, content: addDaysISO(today, Number(s.content)) };
      }
      return { ...s };
    });
    const templateData = {
      sections,
      testValues: tpl.testValues || "",
      icdCodes: tpl.icdCodes || {},
      customSections: tpl.customSections || [],
    };
    const newPageId = Date.now();
    setRxPages(prev => prev.map(p => p.id === activePageId ? { ...p, data: templateData, id: newPageId } : p));
    setActivePageId(newPageId);
  }, [activePageId]);

  const rxDataRef = useRef({});

  // ── Per-patient page filtering ──
  const patientPages = useMemo(() => patient ? rxPages.filter(p => p.patientId === patient.id) : [], [rxPages, patient]);
  const activePage = patientPages.find(p => p.id === activePageId) || patientPages[patientPages.length - 1] || null;
  const activePatientIdx = patientPages.indexOf(activePage);
  const isActiveSigned = activePage?.signed === true;

  // ── Rx Page Management ──
  const snapshotCurrentPage = useCallback(() => {
    if (rxDataRef.current && Object.keys(rxDataRef.current).length > 0) {
      setRxPages(prev => prev.map(p => p.id === activePageId ? { ...p, data: { ...rxDataRef.current } } : p));
    }
  }, [activePageId]);

  const createNewRx = useCallback(() => {
    if (!patient) return;
    // Carry forward Known Conditions from current Rx → patient DB → patient conditions
    const currentRxConditions = rxDataRef.current?.knownConditions || "";
    const carryConditions = currentRxConditions || liveConditions || patient.knownConditions || patient.conditions.join(", ");
    snapshotCurrentPage();
    const newPage = {
      id: Date.now(), patientId: patient.id, saved: false, signed: false, signedAt: null, createdAt: new Date().toISOString(),
      data: carryConditions ? { knownConditions: carryConditions } : null,
    };
    setRxPages(prev => [...prev, newPage]);
    setActivePageId(newPage.id);
    // Explicitly set liveConditions so Summary Status shows them immediately
    setLiveConditions(carryConditions);
    setLiveFollowUp("");
    currentRxIdRef.current = null;
    lastSavedSnapshotRef.current = null;
    setRxDirty(false);
  }, [snapshotCurrentPage, patient, liveConditions]);

  // ⌘+Left/Right to navigate pages (within current patient)
  const activePageIdRef = useRef(activePageId);
  activePageIdRef.current = activePageId;
  const patientPagesRef = useRef(patientPages);
  patientPagesRef.current = patientPages;

  const navigatePage = useCallback((direction) => {
    const pages = patientPagesRef.current;
    const curId = activePageIdRef.current;
    const curIdx = pages.findIndex(p => p.id === curId);
    const newIdx = curIdx + direction;
    if (newIdx < 0 || newIdx >= pages.length) return;
    // Snapshot current before leaving
    if (rxDataRef.current && Object.keys(rxDataRef.current).length > 0) {
      setRxPages(prev => prev.map(p => p.id === curId ? { ...p, data: { ...rxDataRef.current } } : p));
    }
    const targetPage = pages[newIdx];
    setActivePageId(targetPage.id);
    currentRxIdRef.current = targetPage.supabaseRxId || null;
    lastSavedSnapshotRef.current = null; // Reset snapshot for new page
    setRxDirty(false);
    // Update live state from target page
    setLiveConditions(targetPage.data ? (targetPage.data.knownConditions || (patient ? (patient.knownConditions || patient.conditions.join(", ")) : "")) : (patient ? (patient.knownConditions || patient.conditions.join(", ")) : ""));
    const fuSec = targetPage.data ? (targetPage.data.sections || []).find(s => s.id === "followup") : null;
    setLiveFollowUp(fuSec ? fuSec.content : "");
  }, [patient]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "ArrowLeft") {
        e.preventDefault();
        navigatePage(-1);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "ArrowRight") {
        e.preventDefault();
        navigatePage(1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigatePage]);
  const [savedRxs, setSavedRxs] = usePersistedState("savedRxs", []);
  const [patientNotes, setPatientNotes] = usePersistedState("patientNotes", () => {
    const init = {};
    PATIENTS.forEach(p => {
      if (p.notes) init[p.id] = p.notes.split(/\.\s*/).map(s => s.trim()).filter(Boolean);
    });
    return init;
  });
  const [noteInput, setNoteInput] = useState("");

  const currentNotes = patient ? (patientNotes[patient.id] || []) : [];

  const addNote = useCallback((text) => {
    if (!patient) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    setPatientNotes(prev => ({ ...prev, [patient.id]: [...(prev[patient.id] || []), trimmed] }));
    setNoteInput("");
    // Sync to Supabase
    if (doctorId && patient.id) {
      db.createNote(doctorId, patient.id, trimmed).then(noteRow => {
        if (noteRow) {
          noteIdMapRef.current = {
            ...noteIdMapRef.current,
            [patient.id]: [...(noteIdMapRef.current[patient.id] || []), noteRow.id],
          };
        }
      }).catch(e => console.error("Cloud note create failed:", e));
    }
  }, [patient, setPatientNotes, doctorId]);

  const deleteNote = useCallback((idx) => {
    if (!patient) return;
    const noteUUID = noteIdMapRef.current[patient.id]?.[idx];
    setPatientNotes(prev => {
      const list = [...(prev[patient.id] || [])];
      list.splice(idx, 1);
      return { ...prev, [patient.id]: list };
    });
    // Update UUID tracker
    if (noteIdMapRef.current[patient.id]) {
      const uuids = [...noteIdMapRef.current[patient.id]];
      uuids.splice(idx, 1);
      noteIdMapRef.current = { ...noteIdMapRef.current, [patient.id]: uuids };
    }
    // Delete from Supabase
    if (noteUUID) db.deleteNote(noteUUID).catch(e => console.error("Cloud note delete failed:", e));
  }, [patient, setPatientNotes]);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }, []);

  // ── Auto-save Rx to Supabase (every 15s + manual) ──
  const lastSavedSnapshotRef = useRef(null);
  const [rxDirty, setRxDirty] = useState(false);
  const [rxSaving, setRxSaving] = useState(false);
  const [rxSaveStatus, setRxSaveStatus] = useState("idle"); // idle | saving | saved | error

  // Build a comparable snapshot string from current rxDataRef
  const getRxSnapshot = useCallback(() => {
    const d = rxDataRef.current;
    if (!d || !d.sections) return null;
    const filtered = (d.sections || []).filter(s => s.content && s.content.trim());
    if (filtered.length === 0) return null;
    return JSON.stringify({ sections: filtered, knownConditions: d.knownConditions || "", testValues: d.testValues || "", icdCodes: d.icdCodes || {} });
  }, []);

  // Check for dirty state every second
  useEffect(() => {
    const interval = setInterval(() => {
      const snap = getRxSnapshot();
      if (!snap) { setRxDirty(false); return; }
      setRxDirty(snap !== lastSavedSnapshotRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, [getRxSnapshot]);

  // Save Rx content to Supabase (without printing)
  // Updates existing prescription if one exists, creates new if not
  const saveRxToCloud = useCallback(async () => {
    if (!doctorId || !patient || !patient.id) return;
    // Don't save signed prescriptions
    const currentPage = rxPages.find(p => p.id === activePageId);
    if (currentPage?.signed) return;
    const data = rxDataRef.current;
    if (!data || !data.sections) return;
    const secs = (data.sections || []).filter(s => s.content && s.content.trim());
    if (secs.length === 0) return;

    const snapshot = getRxSnapshot();
    if (!snapshot || snapshot === lastSavedSnapshotRef.current) return; // No changes

    setRxSaving(true);
    setRxSaveStatus("saving");
    setSyncStatus("syncing");
    try {
      const followUpSec = (data.sections || []).find(s => s.id === "followup");
      const followUpDate = followUpSec?.content.trim().match(/^\d{4}-\d{2}-\d{2}$/) ? followUpSec.content.trim() : null;
      const rxPayload = {
        sections: secs.map(s => ({ id: s.id, label: s.label, content: s.content })),
        icdCodes: data.icdCodes || {},
        knownConditions: data.knownConditions || "",
        testValues: data.testValues || "",
        customSections: data.customSections || [],
        followUpDate,
      };

      if (currentRxIdRef.current) {
        // Update existing prescription
        await db.updatePrescription(currentRxIdRef.current, rxPayload);
      } else {
        // Create new prescription and track its ID
        const newRx = await db.createPrescription(doctorId, patient.id, rxPayload);
        if (newRx && newRx.id) {
          currentRxIdRef.current = newRx.id;
          // Store the Supabase UUID on the page so navigatePage can use it
          setRxPages(prev => prev.map(p => p.id === activePageId ? { ...p, supabaseRxId: newRx.id } : p));
        }
      }

      // Sync known_conditions to the patient record (doctor_patients junction)
      const currentConditions = data.knownConditions || "";
      if (currentConditions !== (patient.knownConditions || "")) {
        db.updatePatientConditions(doctorId, patient.id, currentConditions).then(() => {
          // Update local patient object so Summary Status and future New Rx use the latest
          const updatedPatient = { ...patient, knownConditions: currentConditions, conditions: currentConditions ? currentConditions.split(",").map(c => c.trim()).filter(Boolean) : [] };
          setPatient(updatedPatient);
          lsSet("activePatient", updatedPatient);
          setPatients(prev => prev.map(p => p.id === patient.id ? updatedPatient : p));
        }).catch(e => console.error("Failed to sync patient conditions:", e));
      }

      lastSavedSnapshotRef.current = snapshot;
      setRxDirty(false);
      setRxSaveStatus("saved");
      setSyncStatus("synced");
      setTimeout(() => { setRxSaveStatus("idle"); setSyncStatus("idle"); }, 3000);
    } catch (e) {
      console.error("Auto-save Rx failed:", e);
      setRxSaveStatus("error");
      setSyncStatus("error");
      setTimeout(() => { setRxSaveStatus("idle"); setSyncStatus("idle"); }, 5000);
    } finally {
      setRxSaving(false);
    }
  }, [doctorId, patient, getRxSnapshot, rxPages, activePageId]);

  // Auto-save every 15 seconds if dirty
  useEffect(() => {
    const interval = setInterval(() => {
      if (rxDirty && !rxSaving) saveRxToCloud();
    }, 15000);
    return () => clearInterval(interval);
  }, [rxDirty, rxSaving, saveRxToCloud]);

  // When loading prescription from Supabase on mount, set the initial snapshot
  useEffect(() => {
    if (dataLoaded && rxDataRef.current && rxDataRef.current.sections) {
      const snap = getRxSnapshot();
      if (snap) lastSavedSnapshotRef.current = snap;
    }
  }, [dataLoaded, getRxSnapshot]);


  // ── Confirmation modal state (for Sign / Discard) ──
  const [confirmAction, setConfirmAction] = useState(null); // { type: "sign"|"discard", message, onConfirm }

  // ── Sign Rx — makes a prescription permanent and read-only ──
  const handleSignRx = useCallback(async () => {
    if (!patient || !activePage) return;
    if (activePage.signed) { showToast("Already signed"); return; }

    // If there are unsaved changes, save first
    if (rxDirty || !currentRxIdRef.current) {
      await saveRxToCloud();
      // Small delay to let the save complete
      await new Promise(r => setTimeout(r, 500));
    }

    if (!currentRxIdRef.current) {
      showToast("Please save the prescription first");
      return;
    }

    setConfirmAction({
      type: "sign",
      message: "Once signed, this prescription cannot be edited or discarded. Continue?",
      onConfirm: async () => {
        try {
          const result = await db.signPrescription(currentRxIdRef.current);
          setRxPages(prev => prev.map(p =>
            p.id === activePageId ? { ...p, signed: true, signedAt: result.signed_at } : p
          ));
          showToast("Prescription signed");
        } catch (e) {
          console.error("Sign Rx failed:", e);
          showToast("Failed to sign prescription");
        }
        setConfirmAction(null);
      },
    });
  }, [patient, activePage, activePageId, rxDirty, saveRxToCloud, showToast]);

  // ── Download Rx — generates image and downloads it ──
  const handleDownloadRx = useCallback(async () => {
    if (!patient) { showToast("No patient selected"); return; }
    const data = rxDataRef.current;
    if (!data.pName) { showToast("No patient data to download"); return; }

    setSaving(true);
    try {
      const secs = (data.sections || []).filter(s => s.content.trim());
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const canvas = drawPrescriptionImage(data, secs, doctor);
      const fileName = `Rx_${data.pName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.png`;

      // Direct download
      canvas.toBlob((blob) => {
        if (!blob) { showToast("Error generating image"); setSaving(false); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Prescription downloaded");
        setSaving(false);
      }, "image/png");
    } catch (err) {
      console.error("Download error:", err);
      showToast("Error downloading prescription");
      setSaving(false);
    }
  }, [showToast, doctor, patient]);

  // ── Discard Rx — delete unsigned prescription ──
  const handleDiscardRx = useCallback(() => {
    if (!patient || !activePage) return;
    if (activePage.signed) return; // Cannot discard signed Rx

    setConfirmAction({
      type: "discard",
      message: "Discard this prescription? This cannot be undone.",
      onConfirm: async () => {
        try {
          // Delete from Supabase if it has a DB record
          if (currentRxIdRef.current) {
            await db.deletePrescription(currentRxIdRef.current);
          }
          // Remove page from rxPages
          setRxPages(prev => {
            const remaining = prev.filter(p => p.id !== activePageId);
            // If no pages left for this patient, create a blank one
            const patientRemaining = remaining.filter(p => p.patientId === patient.id);
            if (patientRemaining.length === 0) {
              const blankPage = { id: Date.now(), patientId: patient.id, data: null, saved: false, signed: false, signedAt: null, createdAt: new Date().toISOString() };
              setActivePageId(blankPage.id);
              currentRxIdRef.current = null;
              lastSavedSnapshotRef.current = null;
              setRxDirty(false);
              return [...remaining, blankPage];
            }
            // Navigate to adjacent page
            const lastPatientPage = patientRemaining[patientRemaining.length - 1];
            setActivePageId(lastPatientPage.id);
            currentRxIdRef.current = lastPatientPage.supabaseRxId || null;
            lastSavedSnapshotRef.current = null;
            setRxDirty(false);
            return remaining;
          });
          showToast("Prescription discarded");
        } catch (e) {
          console.error("Discard Rx failed:", e);
          showToast("Failed to discard prescription");
        }
        setConfirmAction(null);
      },
    });
  }, [patient, activePage, activePageId, showToast]);

  const toggleCard = (k) => setOpenCards(c => ({ ...c, [k]: !c[k] }));

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", fontFamily: FONT_UI, color: B.dark, background: "#ede9e0", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Great+Vibes&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* TOP BAR */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 46, background: B.white, borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${B.orange} 65%, ${B.green} 65%)` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <svg width="20" height="22" viewBox="0 0 40 44" style={{ marginRight: 1, marginTop: -1 }}>
              <circle cx="20" cy="24" r="16" fill={B.orange} />
              <circle cx="20" cy="25.5" r="9.5" fill={B.white} />
              <ellipse cx="16" cy="7" rx="5" ry="3.5" fill="#333" transform="rotate(-20 16 7)" />
              <ellipse cx="24" cy="7" rx="5" ry="3.5" fill="#333" transform="rotate(20 24 7)" />
            </svg>
            <span style={{ fontSize: 16, fontWeight: 700, color: B.dark, letterSpacing: -0.3 }}>Rx</span>
            <span style={{ fontSize: 11, color: B.grey, marginLeft: 6, borderLeft: "1px solid #ddd", paddingLeft: 8 }}><span style={{ fontWeight: 700, color: B.orange }}>Orange</span><span style={{ fontWeight: 700 }}>Script</span></span>
          </div>
          <span style={{ fontSize: 11, color: B.grey }}>{doctor.clinic} · {doctor.name}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: !online ? "#e74c3c" : rxDirty ? B.orange : rxSaveStatus === "saving" ? B.orange : rxSaveStatus === "saved" ? B.green : rxSaveStatus === "error" ? "#e74c3c" : B.grey, marginRight: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: !online ? "#e74c3c" : rxDirty ? B.orange : rxSaveStatus === "saving" ? B.orange : rxSaveStatus === "saved" ? B.green : rxSaveStatus === "error" ? "#e74c3c" : "#ccc" }} />
            {!online ? "Offline" : rxDirty ? "Unsaved changes" : rxSaveStatus === "saving" ? "Saving..." : rxSaveStatus === "saved" ? "Saved" : rxSaveStatus === "error" ? "Save failed" : ""}
          </div>
          <Btn label={rxSaving ? "Saving..." : "Save Rx"} onClick={saveRxToCloud} disabled={rxSaving || !rxDirty || isActiveSigned} />
          <Btn label={isActiveSigned ? "Signed" : "Sign Rx"} primary onClick={handleSignRx} disabled={isActiveSigned || !activePage} />
          <Btn label={saving ? "Downloading..." : "Download"} onClick={handleDownloadRx} disabled={saving || !activePage} />
          <Btn label="Discard Rx" danger onClick={handleDiscardRx} disabled={isActiveSigned || !activePage} title={isActiveSigned ? "A signed prescription cannot be discarded" : ""} />
          <Btn label="+ New Rx" onClick={createNewRx} />
          <div onClick={openDoctorModal} title="Doctor Settings" style={{ width: 28, height: 28, borderRadius: "50%", background: B.greenT15, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={B.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
      </div>

      {/* LEFT PANEL */}
      {leftOpen ? (
      <div style={{ width: 256, minWidth: 256, background: B.white, borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", marginTop: 46, position: "relative" }}>
        <div onClick={() => setLeftOpen(false)} style={{ position: "absolute", top: 8, right: -12, width: 24, height: 24, borderRadius: "50%", background: B.white, border: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, fontSize: 11, color: B.grey }}>◂</div>
        <div style={{ padding: "14px 16px 10px" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..."
            style={{ width: "100%", padding: "8px 10px 8px 32px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 12.5, fontFamily: "inherit", outline: "none", background: `${B.lightBg} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%23999' viewBox='0 0 24 24'%3E%3Cpath d='M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E") no-repeat 10px center`, boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid #eee" }}>
          {["patients", "templates"].map(t => (
            <button key={t} onClick={() => setLeftTab(t)} style={{
              flex: 1, padding: "9px 0", border: "none", background: "transparent", fontSize: 10.5,
              fontWeight: 700, fontFamily: "inherit", cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.8,
              color: leftTab === t ? B.orange : B.grey,
              borderBottom: leftTab === t ? `2px solid ${B.orange}` : "2px solid transparent",
            }}>{t}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {leftTab === "patients" ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px 4px" }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: B.grey, textTransform: "uppercase", letterSpacing: 1 }}>Recent Patients</span>
                <button onClick={openAddModal} style={{ padding: "3px 10px", borderRadius: 5, border: `1.5px solid ${B.orange}`, background: "transparent", fontSize: 10.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", color: B.orange }}>+ Add</button>
              </div>
              {filteredPatients.map(p => (
                <div key={p.id} onClick={() => selectPatient(p)} style={{
                  padding: "9px 16px", cursor: "pointer",
                  background: patient && patient.id === p.id ? B.orangeT15 : "transparent",
                  borderLeft: patient && patient.id === p.id ? `3px solid ${B.orange}` : "3px solid transparent",
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: B.grey, marginTop: 1 }}>{p.age}/{p.gender} · {p.phone}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 6, paddingTop: 2 }}>
                    <svg onClick={(e) => { e.stopPropagation(); openEditModal(p); }} style={{ cursor: "pointer", opacity: 0.35 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={B.grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    <svg onClick={(e) => { e.stopPropagation(); setDeleteModal(p); }} style={{ cursor: "pointer", opacity: 0.35 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px 4px" }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: B.grey, textTransform: "uppercase", letterSpacing: 1 }}>Saved Templates</span>
                <button onClick={openSaveTemplateModal} style={{ padding: "3px 10px", borderRadius: 5, border: `1.5px solid ${B.green}`, background: "transparent", fontSize: 10.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", color: B.green }}>+ Save</button>
              </div>
              {savedTemplates.length === 0 && (
                <div style={{ padding: "20px 16px", fontSize: 12, color: B.grey, fontStyle: "italic", textAlign: "center" }}>No saved templates yet. Write a prescription and click + Save to create one.</div>
              )}
              {savedTemplates.map(tpl => (
                <div key={tpl.id} style={{ padding: "8px 16px", cursor: "pointer", fontSize: 13, color: B.dark, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div onClick={() => applyTemplate(tpl)} style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{tpl.name}</div>
                    <div style={{ fontSize: 10, color: B.grey, marginTop: 1 }}>{tpl.sections.filter(s => s.content.trim()).map(s => s.label).join(" · ")}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, marginLeft: 8 }}>
                    <svg onClick={(e) => { e.stopPropagation(); openEditTemplateModal(tpl); }} style={{ cursor: "pointer", opacity: 0.35 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={B.grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    <svg onClick={(e) => { e.stopPropagation(); deleteTemplate(tpl.id); }} style={{ cursor: "pointer", opacity: 0.35 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ padding: "10px 16px", borderTop: "1px solid #eee", background: B.lightBg }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: B.grey, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Shortcuts</div>
          <div style={{ fontSize: 10.5, color: B.secondary, lineHeight: 1.9, fontFamily: "monospace" }}>
            <span style={{ color: B.grey }}>⌘R</span> Rx <span style={{ color: B.grey }}>⌘D</span> Diagnosis <span style={{ color: B.grey }}>⌘O</span> Tests<br />
            <span style={{ color: B.grey }}>⌘S</span> Symptoms <span style={{ color: B.grey }}>⌘F</span> Follow Up<br />
            <span style={{ color: B.grey }}>\</span> Phrases <span style={{ color: B.grey }}>\\</span> Add Section
          </div>
        </div>
      </div>
      ) : (
        <div onClick={() => setLeftOpen(true)} style={{ width: 36, minWidth: 36, background: B.white, borderRight: "1px solid #e0e0e0", marginTop: 46, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 12, cursor: "pointer" }}>
          <span style={{ fontSize: 11, color: B.grey }}>▸</span>
        </div>
      )}

      {/* CENTER */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 20px", marginTop: 46, overflow: "hidden" }}>
        <div style={{ width: "100%", maxWidth: 740, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {patient && activePage ? (
            <>
              <div style={{ flex: 1, background: B.white, borderRadius: 3, boxShadow: "0 2px 20px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "16px 28px 12px", borderBottom: `2px solid ${B.orange}`, display: "flex", justifyContent: "space-between", flexShrink: 0, background: "linear-gradient(180deg, #fefefe, #fafaf8)" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{doctor.name}</div>
                    <div style={{ fontSize: 11, color: B.grey, lineHeight: 1.5 }}>{doctor.specialty}<br />{doctor.degrees}<br />Reg. No: {doctor.mci}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>{doctor.clinic}</div>
                    <div style={{ fontSize: 10, color: B.grey, lineHeight: 1.6, whiteSpace: "pre-line" }}>{doctor.address}{"\n"}{doctor.phone}</div>
                  </div>
                </div>
                <div style={{ flex: 1, overflow: "auto" }}>
                  <RxEditor key={activePage.id} patient={patient} initialData={activePage.data} onSave={handleDownloadRx} customPhrases={customPhrases} onSavePhrase={savePhrase} onDeletePhrase={deletePhrase} dataRef={rxDataRef} onLiveConditions={setLiveConditions} onLiveFollowUp={setLiveFollowUp} readOnly={isActiveSigned} signedAt={activePage?.signedAt} />
                </div>
              </div>
              {/* Carousel — per-patient pages only */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "10px 0 2px" }}>
                {patientPages.length > 1 && (
                  <button onClick={() => navigatePage(-1)} disabled={activePatientIdx === 0} style={{
                    width: 20, height: 20, borderRadius: "50%", border: "none", background: "transparent",
                    cursor: activePatientIdx === 0 ? "default" : "pointer", fontSize: 13,
                    color: activePatientIdx === 0 ? "#ddd" : B.grey, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>◂</button>
                )}
                {patientPages.map((page, i) => (
                  <button key={page.id} onClick={() => { if (i !== activePatientIdx) { snapshotCurrentPage(); navigatePage(i - activePatientIdx); } }} style={{
                    width: i === activePatientIdx ? 22 : 10, height: 10, borderRadius: 5, border: "none", cursor: "pointer",
                    background: i === activePatientIdx ? B.orange : page.signed ? B.green : page.saved ? "#a0d8c0" : "#d0ccc4", transition: "all 0.25s",
                    position: "relative",
                  }}>
                    {i === activePatientIdx && <span style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontSize: 8, fontWeight: 700, color: B.grey, whiteSpace: "nowrap", fontFamily: FONT_UI }}>{i + 1}/{patientPages.length}</span>}
                  </button>
                ))}
                {patientPages.length > 1 && (
                  <button onClick={() => navigatePage(1)} disabled={activePatientIdx === patientPages.length - 1} style={{
                    width: 20, height: 20, borderRadius: "50%", border: "none", background: "transparent",
                    cursor: activePatientIdx === patientPages.length - 1 ? "default" : "pointer", fontSize: 13,
                    color: activePatientIdx === patientPages.length - 1 ? "#ddd" : B.grey, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>▸</button>
                )}
                <button onClick={createNewRx} title="New prescription" style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px dashed ${B.grey}`, background: "transparent", cursor: "pointer", fontSize: 13, color: B.grey, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 4 }}>+</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, background: B.white, borderRadius: 3, boxShadow: "0 2px 20px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.15 }}>℞</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: B.secondary, marginBottom: 6 }}>No patient selected</div>
              <div style={{ fontSize: 12, color: B.grey, marginBottom: 16 }}>Add a patient from the left panel to start writing prescriptions</div>
              <button onClick={openAddModal} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: B.green, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", color: B.white }}>+ Add Patient</button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      {rightOpen ? (
      <div style={{ width: 300, minWidth: 300, background: B.white, borderLeft: "1px solid #e0e0e0", display: "flex", flexDirection: "column", marginTop: 46, overflow: "hidden", position: "relative" }}>
        <div onClick={() => setRightOpen(false)} style={{ position: "absolute", top: 8, left: -12, width: 24, height: 24, borderRadius: "50%", background: B.white, border: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, fontSize: 11, color: B.grey }}>▸</div>
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #eee" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: B.grey, textTransform: "uppercase", letterSpacing: 0.8 }}>Patient Context</div>
          {patient ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{patient.name}</div>
              <div style={{ fontSize: 11, color: B.grey, marginTop: 2 }}>{patient.age}/{patient.gender} · Last: {patient.lastVisit}</div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: B.grey, marginTop: 6, fontStyle: "italic" }}>No patient selected</div>
          )}
        </div>
        {patient ? (
        <div style={{ flex: 1, overflow: "auto", padding: "0 0 14px" }}>
          <Card title="Summary Status" color="orange" open={openCards.summary} toggle={() => toggleCard("summary")}>
            {(() => {
              // Conditions: prefer live from active Rx, then patient DB record
              const rawConditions = liveConditions || patient.knownConditions || patient.conditions.join(", ");
              const conditions = rawConditions ? rawConditions.split(",").map(c => c.trim()).filter(Boolean) : [];
              return conditions.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  {conditions.map((c, i) => (
                    <span key={i} style={{ display: "inline-block", background: B.orangeT15, border: `1px solid ${B.orangeT30}`, borderRadius: 12, padding: "2px 10px", fontSize: 11.5, fontWeight: 500, marginRight: 5, marginBottom: 5 }}>{c}</span>
                  ))}
                </div>
              );
            })()}
            {/* Next Follow-Up */}
            {(() => {
              let followUpDisplay = null;
              // Live follow-up from current prescription takes priority
              if (liveFollowUp) {
                const parsed = new Date(liveFollowUp);
                if (!isNaN(parsed.getTime()) && liveFollowUp.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  const formatted = parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
                  followUpDisplay = { label: formatted, color: B.orange };
                } else {
                  followUpDisplay = { label: liveFollowUp, color: B.orange };
                }
              } else {
                // Fall back to last saved prescription
                const patientRxs = savedRxs.filter(r => r.patientId === patient.id);
                const lastRx = patientRxs.length > 0 ? patientRxs[patientRxs.length - 1] : null;
                if (!lastRx) {
                  followUpDisplay = { label: "No prescriptions yet", color: B.grey };
                } else if (!lastRx.followUpText) {
                  followUpDisplay = { label: "No follow-up asked", color: B.grey };
                } else {
                  const parsedRx = new Date(lastRx.followUpText);
                  if (!isNaN(parsedRx.getTime()) && lastRx.followUpText.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const formatted = parsedRx.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
                    followUpDisplay = { label: formatted, color: B.orange };
                  } else {
                    const fuDate = deriveFollowUpDate(lastRx.date, lastRx.followUpText);
                    followUpDisplay = fuDate
                      ? { label: fuDate, color: B.orange, sub: lastRx.followUpText }
                      : { label: lastRx.followUpText, color: B.orange };
                  }
                }
              }
              return (
                <div style={{ background: B.lightBg, borderRadius: 6, padding: "8px 10px", marginBottom: 10 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: B.grey, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>Next Follow-Up</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: followUpDisplay.color }}>{followUpDisplay.label}</div>
                  {followUpDisplay.sub && <div style={{ fontSize: 10.5, color: B.grey, marginTop: 1 }}>{followUpDisplay.sub}</div>}
                </div>
              );
            })()}
            {/* Key Notes (subsection) */}
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: B.green, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>Key Notes</div>
              {currentNotes.length > 0 ? (
                <div style={{ marginBottom: 6 }}>
                  {currentNotes.map((note, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "3px 0", borderBottom: i < currentNotes.length - 1 ? "1px solid #f8f8f6" : "none" }}>
                      <div style={{ flex: 1, fontSize: 12.5, color: B.secondary, lineHeight: 1.5 }}>{note}</div>
                      <svg onClick={() => deleteNote(i)} style={{ cursor: "pointer", opacity: 0.35, flexShrink: 0, marginTop: 3 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: B.grey, fontStyle: "italic", marginBottom: 6 }}>No notes yet.</div>
              )}
              <input
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && noteInput.trim()) { e.preventDefault(); addNote(noteInput); } }}
                placeholder="Type a note and press Enter..."
                style={{ width: "100%", border: "1px solid #e0e0e0", borderRadius: 6, padding: "7px 9px", fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </Card>
          <Card title="OrangeHealthLab's Reports" color="grey" badge="COMING SOON" open={openCards.reports} toggle={() => toggleCard("reports")}>
            <div style={{ textAlign: "center", padding: "16px 0", fontSize: 12, color: B.grey }}>
              <div style={{ fontSize: 24, marginBottom: 6, opacity: 0.3 }}>🧪</div>
              <div style={{ fontWeight: 600, color: B.secondary, marginBottom: 2 }}>Coming Soon</div>
              <div style={{ fontSize: 11 }}>Patient lab reports from Orange Health Labs</div>
            </div>
          </Card>
        </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ textAlign: "center", fontSize: 12, color: B.grey }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.2 }}>👤</div>
              Select or add a patient to see context
            </div>
          </div>
        )}
      </div>
      ) : (
        <div onClick={() => setRightOpen(true)} style={{ width: 36, minWidth: 36, background: B.white, borderLeft: "1px solid #e0e0e0", marginTop: 46, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 12, cursor: "pointer" }}>
          <span style={{ fontSize: 11, color: B.grey }}>◂</span>
        </div>
      )}

      {/* Toast */}
      <div style={{
        position: "fixed", bottom: 20, left: "50%",
        transform: `translateX(-50%) translateY(${toast ? 0 : 20}px)`,
        opacity: toast ? 1 : 0, background: toastMsg.includes("Error") ? "#e74c3c" : B.green, color: B.white,
        padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600,
        boxShadow: "0 4px 20px rgba(23,165,120,0.3)", transition: "all 0.3s", zIndex: 999, pointerEvents: "none",
      }}>{toastMsg.includes("Error") ? "✕" : "✓"} {toastMsg}</div>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Patient">
        <div style={{ fontSize: 13, color: B.secondary, lineHeight: 1.6, marginBottom: 16 }}>
          Are you sure you want to delete <b>{deleteModal?.name}</b>? This action cannot be undone.
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={() => setDeleteModal(null)} style={{ padding: "7px 16px", borderRadius: 6, border: "1.5px solid #ddd", background: "transparent", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", color: B.dark }}>Cancel</button>
          <button onClick={confirmDelete} style={{ padding: "7px 16px", borderRadius: 6, border: "none", background: "#e74c3c", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", color: B.white }}>Delete</button>
        </div>
      </Modal>

      {/* SIGN / DISCARD CONFIRMATION MODAL */}
      <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)} title={confirmAction?.type === "sign" ? "Sign Prescription" : "Discard Prescription"}>
        <div style={{ fontSize: 13, color: B.secondary, lineHeight: 1.6, marginBottom: 16 }}>
          {confirmAction?.message}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={() => setConfirmAction(null)} style={{ padding: "7px 16px", borderRadius: 6, border: "1.5px solid #ddd", background: "transparent", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", color: B.dark }}>Cancel</button>
          <button onClick={confirmAction?.onConfirm} style={{ padding: "7px 16px", borderRadius: 6, border: "none", background: confirmAction?.type === "sign" ? B.orange : "#e74c3c", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", color: B.white }}>
            {confirmAction?.type === "sign" ? "Sign" : "Discard"}
          </button>
        </div>
      </Modal>

      {/* EDIT PATIENT MODAL */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Patient Details" width={420}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Name", key: "name", type: "text" },
            { label: "Gender", key: "gender", type: "text" },
            { label: "Phone", key: "phone", type: "text" },
            { label: "Email", key: "email", type: "email" },
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: B.grey, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</div>
              <input type={f.type || "text"} value={editForm[f.key]} onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.key === "email" ? "patient@example.com" : ""} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: B.grey, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Date of Birth</div>
              <input type="date" value={editForm.dob} onChange={e => handleEditDob(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ width: 80 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: B.grey, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Age</div>
              <input type="number" value={editForm.age} onChange={e => handleEditAge(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ fontSize: 10, color: B.grey, fontStyle: "italic" }}>Age is auto-calculated from DOB. If no DOB, enter age directly.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button onClick={() => setEditModal(null)} style={{ padding: "7px 16px", borderRadius: 6, border: "1.5px solid #ddd", background: "transparent", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", color: B.dark }}>Cancel</button>
          <button onClick={confirmEdit} style={{ padding: "7px 16px", borderRadius: 6, border: "none", background: B.orange, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", color: B.white }}>Save Changes</button>
        </div>
      </Modal>

      {/* ADD PATIENT MODAL */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add New Patient" width={420}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Name", key: "name", type: "text", placeholder: "Full name" },
            { label: "Gender", key: "gender", type: "text", placeholder: "M / F" },
            { label: "Phone", key: "phone", type: "text", placeholder: "98765 43210" },
            { label: "Email", key: "email", type: "email", placeholder: "patient@example.com" },
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: B.grey, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</div>
              <input type={f.type || "text"} value={editForm[f.key]} onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder || ""} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: B.grey, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Date of Birth</div>
              <input type="date" value={editForm.dob} onChange={e => handleEditDob(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ width: 80 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: B.grey, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Age</div>
              <input type="number" value={editForm.age} onChange={e => handleEditAge(e.target.value)} placeholder="0" style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ fontSize: 10, color: B.grey, fontStyle: "italic" }}>Age is auto-calculated from DOB. If no DOB, enter age directly.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button onClick={() => setAddModal(false)} style={{ padding: "7px 16px", borderRadius: 6, border: "1.5px solid #ddd", background: "transparent", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", color: B.dark }}>Cancel</button>
          <button onClick={confirmAdd} style={{ padding: "7px 16px", borderRadius: 6, border: "none", background: B.green, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", color: B.white }}>Add Patient</button>
        </div>
      </Modal>

      {/* DOCTOR SETTINGS MODAL */}
      <Modal open={doctorModal} onClose={() => setDoctorModal(false)} title="Doctor & Clinic Settings" width={480}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Doctor Name", key: "name", placeholder: "Dr. Full Name" },
            { label: "Specialty", key: "specialty", placeholder: "e.g. General Medicine" },
            { label: "Degrees / Qualifications", key: "degrees", placeholder: "e.g. MBBS, MD (Internal Medicine)" },
            { label: "Registration No.", key: "mci", placeholder: "e.g. KA-45892" },
            { label: "Clinic Name", key: "clinic", placeholder: "e.g. Sharma Wellness Clinic" },
            { label: "Phone", key: "phone", placeholder: "+91 80 2664 5500" },
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: B.grey, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</div>
              <input value={doctorForm[f.key]} onChange={e => setDoctorForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: B.grey, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Clinic Address</div>
            <textarea value={doctorForm.address} onChange={e => setDoctorForm(prev => ({ ...prev, address: e.target.value }))} placeholder="Full address (use Enter for new lines)" rows={3} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button onClick={() => setDoctorModal(false)} style={{ padding: "7px 16px", borderRadius: 6, border: "1.5px solid #ddd", background: "transparent", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", color: B.dark }}>Cancel</button>
          <button onClick={confirmDoctorSettings} disabled={!doctorForm.name.trim()} style={{ padding: "7px 16px", borderRadius: 6, border: "none", background: doctorForm.name.trim() ? B.green : "#ccc", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: doctorForm.name.trim() ? "pointer" : "not-allowed", color: B.white }}>Save Settings</button>
        </div>
        <div style={{ borderTop: "1px solid #eee", marginTop: 16, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: B.grey }}>Logged in as {doctor.name || "Doctor"}</span>
          <button onClick={() => { setDoctorModal(false); signOut(); }} style={{ padding: "5px 12px", borderRadius: 6, border: "1.5px solid #e74c3c", background: "transparent", fontSize: 11, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", color: "#e74c3c" }}>Log Out</button>
        </div>
      </Modal>

      {/* SAVE TEMPLATE MODAL */}
      <Modal open={!!templateModal} onClose={() => setTemplateModal(null)} title={templateModal?.editId ? "Edit Template" : "Save as Template"} width={540}>
        {templateModal && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: B.grey, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Template Name <span style={{ color: "#e74c3c" }}>*</span></div>
              <input value={templateModal.name} onChange={e => setTemplateModal(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Viral Fever — Adult" autoFocus style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${templateModal.name.trim() ? "#e0e0e0" : "#e74c3c"}`, borderRadius: 6, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              {!templateModal.name.trim() && <div style={{ fontSize: 10, color: "#e74c3c", marginTop: 3 }}>Template name is required</div>}
            </div>
            <div style={{ maxHeight: 380, overflow: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
              {templateModal.sections.map((sec, idx) => (
                <div key={sec.id}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: sec.id === "rx" ? B.orange : B.green, marginBottom: 3 }}>{sec.label}</div>
                  {sec.id === "followup" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, color: B.dark, whiteSpace: "nowrap" }}>Follow up after</span>
                      <input type="number" min="1" value={sec.content} onChange={e => setTemplateModal(prev => ({ ...prev, sections: prev.sections.map((s, i) => i === idx ? { ...s, content: e.target.value } : s) }))} style={{ width: 60, padding: "8px 10px", border: "1.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", textAlign: "center" }} />
                      <span style={{ fontSize: 13, color: B.dark }}>days</span>
                    </div>
                  ) : (
                    <textarea value={sec.content} onChange={e => setTemplateModal(prev => ({ ...prev, sections: prev.sections.map((s, i) => i === idx ? { ...s, content: e.target.value } : s) }))} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e0e0e0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", lineHeight: "24px", outline: "none", resize: "vertical", minHeight: 36, boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button onClick={() => setTemplateModal(null)} style={{ padding: "7px 16px", borderRadius: 6, border: "1.5px solid #ddd", background: "transparent", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", color: B.dark }}>Cancel</button>
              <button onClick={confirmSaveTemplate} disabled={!templateModal.name.trim()} style={{ padding: "7px 16px", borderRadius: 6, border: "none", background: templateModal.name.trim() ? B.green : "#ccc", fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: templateModal.name.trim() ? "pointer" : "not-allowed", color: B.white }}>{templateModal.editId ? "Update Template" : "Save Template"}</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

function Btn({ label, primary, danger, onClick, disabled, title }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      padding: "5px 13px", borderRadius: 6, fontSize: 12, fontWeight: 600,
      fontFamily: "inherit", cursor: disabled ? "not-allowed" : "pointer",
      border: primary ? "none" : danger ? "1.5px solid #e74c3c" : "1.5px solid #ddd",
      background: primary ? B.orange : "transparent",
      color: primary ? B.white : danger ? "#e74c3c" : B.dark,
      opacity: disabled ? 0.6 : 1,
    }}>{label}</button>
  );
}

function Card({ title, color, badge, open, toggle, children }) {
  const bg = color === "orange" ? B.orangeT15 : color === "green" ? B.greenT15 : B.lightBg;
  return (
    <div style={{ margin: "10px 12px 0", borderRadius: 8, border: "1px solid #eee", overflow: "hidden" }}>
      <div onClick={toggle} style={{ padding: "7px 12px", background: bg, borderBottom: open ? "1px solid #eee" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>{title}</span>
        {badge ? <span style={{ fontSize: 8.5, fontWeight: 700, color: B.grey, background: B.lightBg, padding: "1px 5px", borderRadius: 3 }}>{badge}</span>
          : <span style={{ fontSize: 13, color: B.grey, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", display: "inline-block" }}>▾</span>}
      </div>
      {open && <div style={{ padding: "10px 12px" }}>{children}</div>}
    </div>
  );
}
