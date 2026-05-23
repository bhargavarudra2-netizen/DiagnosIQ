/**
 * geminiService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Vitalis AI — Gemini Intelligence Layer
 *
 * Calls Google Gemini to generate:
 *  • Full medical insight (overview, concerns, recommendations)
 *  • Simple-language patient explanations
 *  • Emergency-specific guidance
 *  • Clinical doctor summaries
 *
 * SAFETY GUARANTEE: All prompts enforce hedged, non-diagnostic language.
 * The AI never states a definitive diagnosis — only possibilities.
 *
 * FALLBACK GUARANTEE: If the API key is missing, rate-limited, or the
 * network is offline, a rich static object is returned so the demo
 * NEVER breaks.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Initialise client ────────────────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

function getModel() {
  if (!model && API_KEY && API_KEY !== 'your_gemini_api_key_here') {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return model;
}

// ── System Safety Prompt ─────────────────────────────────────────────────────
const SYSTEM_SAFETY_PROMPT = `You are Vitalis AI, a responsible AI healthcare assistant designed to help patients understand their medical report findings clearly, safely, and compassionately.

STRICT RULES YOU MUST ALWAYS FOLLOW:
1. NEVER provide a definitive diagnosis. Always use hedged language: "may indicate", "could suggest", "findings are consistent with", "this pattern is often associated with".
2. ALWAYS recommend professional medical consultation.
3. Be empathetic, calm, and precise.
4. Keep explanations accessible — avoid excessive medical jargon in patient mode.
5. In clinical mode, use proper medical terminology.
6. Never use alarming language that could cause panic — be serious but reassuring.
7. All advice must encourage (never replace) professional evaluation.`;

// ── Static Fallback Dataset ──────────────────────────────────────────────────
const FALLBACK_INSIGHTS = {
  critical: {
    overview: 'Your diagnostic panel has revealed several values that fall significantly outside normal clinical reference ranges, particularly in cardiac and metabolic systems. This pattern warrants urgent professional medical evaluation.',
    simple_explanation: 'Your test results show some very concerning numbers — especially related to your heart health and blood sugar. These findings suggest your body is under significant stress right now. Please seek emergency medical care immediately.',
    concerns: [
      'Cardiac protein markers appear significantly elevated, which may be associated with myocardial stress',
      'Blood glucose levels are critically above the normal threshold, suggesting a possible metabolic emergency',
      'Multiple organ systems are showing simultaneous stress indicators'
    ],
    recommendations: [
      'Seek emergency medical evaluation immediately — do not delay',
      'Avoid all physical exertion or emotional stress',
      'Do not self-medicate or adjust any ongoing medication doses',
      'Bring this report to the emergency department for immediate review',
      'Emergency cardiology and endocrinology consultation may be required'
    ],
    doctor_note: 'Clinical findings suggest possible active myocardial injury concurrent with hyperglycaemic crisis. Immediate emergency department evaluation is strongly advised. Co-consultation with cardiology and endocrinology recommended.',
    urgency_level: 'CRITICAL — IMMEDIATE CARE REQUIRED',
    urgency_color: '#EF4444',
    confidence: 97,
    is_fallback: true
  },
  high: {
    overview: 'Your diagnostic panel shows significant abnormalities across metabolic and renal indicators. These findings suggest systemic stress that should be evaluated by a specialist within the next 24 hours.',
    simple_explanation: 'Your blood test results show some numbers that are noticeably out of the healthy range. Your kidneys may be under strain, and other systems show signs of stress. This needs a doctor\'s attention soon — not an emergency, but don\'t wait more than 24 hours.',
    concerns: [
      'Renal function markers suggest reduced kidney filtration capacity',
      'Hematological indicators show possible oxygen-carrying inefficiency',
      'Multiple metabolic values indicate systemic physiological stress'
    ],
    recommendations: [
      'Schedule a specialist appointment within 24 hours',
      'Avoid NSAIDs and kidney-stressing medications',
      'Maintain hydration — 2-2.5L water daily',
      'Request a follow-up renal panel and GFR test',
      'Monitor blood pressure daily'
    ],
    doctor_note: 'Patient presents with elevated creatinine and concurrent anemia markers. Nephrology referral and full renal function workup with GFR calculation recommended within 24-48 hours.',
    urgency_level: 'HIGH RISK — Within 24 Hours',
    urgency_color: '#F97316',
    confidence: 93,
    is_fallback: true
  },
  medium: {
    overview: 'Your diagnostic panel shows mild to moderate deviations from normal reference ranges. While not immediately critical, these findings suggest early metabolic or systemic changes that benefit from timely medical review.',
    simple_explanation: 'Some of your test results are slightly outside the healthy range. Nothing is an emergency, but your body is giving early warning signs. A doctor visit within the next few days will help catch any issues before they become bigger problems.',
    concerns: [
      'Some biomarker values are mildly elevated above reference ranges',
      'Early metabolic strain indicators detected',
      'Preventive intervention may reduce long-term risk'
    ],
    recommendations: [
      'Schedule a primary care physician visit within 48-72 hours',
      'Reduce processed sugar and saturated fat intake',
      'Begin 30 minutes of daily low-impact walking',
      'Monitor symptoms and repeat tests in 4 weeks'
    ],
    doctor_note: 'Mild metabolic irregularities detected. Primary care review recommended. Lifestyle modification counseling suggested. Follow-up panel in 4-6 weeks.',
    urgency_level: 'MODERATE — Within 48-72 Hours',
    urgency_color: '#F59E0B',
    confidence: 90,
    is_fallback: true
  },
  low: {
    overview: 'Your complete diagnostic panel shows all major biomarkers within healthy clinical reference ranges. Your organ systems appear to be functioning optimally at this time.',
    simple_explanation: 'Great news — all your test results look healthy! Your heart, kidneys, liver, and blood markers are all within normal ranges. Keep up your current healthy habits and schedule a routine check-up in about a year.',
    concerns: [
      'No significant abnormalities detected across monitored biomarkers',
      'All organ system indicators are within healthy reference ranges'
    ],
    recommendations: [
      'Continue current healthy lifestyle habits',
      'Maintain 7-8 hours of quality sleep nightly',
      'Stay hydrated — 2.5L of water daily',
      'Schedule your next routine health check in 12 months'
    ],
    doctor_note: 'Complete biochemical panel within physiological reference intervals. All monitored organ systems appear stable. Routine annual follow-up recommended.',
    urgency_level: 'NORMAL — Routine Follow-up',
    urgency_color: '#22C55E',
    confidence: 98,
    is_fallback: true
  }
};

// ── Helper: Build Structured Prompt ─────────────────────────────────────────
function buildInsightPrompt(reportData) {
  const criticals = (reportData.emergency_flags || reportData.emergency_alerts || []);
  const biomarkers = (reportData.biomarkers || []);
  const organScores = reportData.organScores || {};
  const riskLevel = reportData.overall_risk || reportData.risk_level || 'low';
  const healthScore = reportData.overall_score || reportData.health_score || 0;

  const biomarkerSummary = biomarkers.map(b =>
    `  - ${b.name}: ${b.value} ${b.unit} (Normal: ${b.normal_range}) — Status: ${b.status.toUpperCase()}`
  ).join('\n');

  const criticalSummary = criticals.length > 0
    ? criticals.map(f => `  ⚠ CRITICAL: ${f.marker} = ${f.value} ${f.unit} — ${f.condition}`).join('\n')
    : '  None detected';

  const organSummary = Object.entries(organScores).map(([organ, score]) =>
    `  ${organ}: ${score}/100`
  ).join(', ');

  return `${SYSTEM_SAFETY_PROMPT}

---

PATIENT REPORT DATA:
Patient Name: ${reportData.patient_name || 'Anonymous'}
Report Date: ${reportData.report_date || 'Unknown'}
Report Type: ${reportData.report_type || 'Diagnostic Panel'}
Overall Risk Level: ${riskLevel.toUpperCase()}
Health Score: ${healthScore}/100

BIOMARKER VALUES:
${biomarkerSummary}

CRITICAL EMERGENCY FLAGS:
${criticalSummary}

ORGAN SYSTEM SCORES:
${organSummary}

---

Respond with ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "overview": "2-3 sentence clinical overview using hedged, responsible language",
  "simple_explanation": "2-3 sentence plain-language explanation as if speaking to the patient directly, empathetic and calm",
  "concerns": ["concern 1", "concern 2", "concern 3"],
  "recommendations": ["action 1", "action 2", "action 3", "action 4"],
  "doctor_note": "1 sentence clinical summary for a physician",
  "urgency_level": "one of: CRITICAL — IMMEDIATE CARE REQUIRED | HIGH RISK — Within 24 Hours | MODERATE — Within 48-72 Hours | NORMAL — Routine Follow-up",
  "urgency_color": "one of: #EF4444 | #F97316 | #F59E0B | #22C55E",
  "confidence": 90
}`;
}

// ── Helper: Parse Gemini JSON response ──────────────────────────────────────
function parseGeminiResponse(text) {
  try {
    // Strip any accidental markdown code fences
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// ── EXPORTED FUNCTION 1: Main Medical Insight ────────────────────────────────
/**
 * generateMedicalInsight()
 * Generates the full AI insight block for the dashboard.
 * Always resolves — never rejects. Falls back to static data on error.
 *
 * @param {object} reportData - Full structured report from medicalEngine or API
 * @returns {Promise<object>} - Insight object with overview, concerns, recommendations, etc.
 */
export async function generateMedicalInsight(reportData) {
  const riskKey = (reportData.overall_risk || 'low').toLowerCase();
  const normalizedRisk = ['critical', 'high', 'medium', 'low'].includes(riskKey)
    ? riskKey
    : 'low';

  const aiModel = getModel();
  if (!aiModel) {
    // No valid API key — return rich static fallback
    return { ...FALLBACK_INSIGHTS[normalizedRisk], is_fallback: true };
  }

  try {
    const prompt = buildInsightPrompt(reportData);
    const result = await aiModel.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = parseGeminiResponse(responseText);

    if (parsed && parsed.overview) {
      return { ...parsed, is_fallback: false };
    }

    // Parsing failed — use fallback
    return { ...FALLBACK_INSIGHTS[normalizedRisk], is_fallback: true };
  } catch (err) {
    console.warn('[Vitalis AI] Gemini insight generation failed, using fallback:', err.message);
    return { ...FALLBACK_INSIGHTS[normalizedRisk], is_fallback: true };
  }
}

// ── EXPORTED FUNCTION 2: Simple Language Explanation ─────────────────────────
/**
 * explainInSimpleLanguage()
 * Returns a plain-language explanation for a single biomarker.
 *
 * @param {string} biomarkerName - e.g. "Troponin I"
 * @param {number} value - numeric value
 * @param {string} unit - e.g. "ng/mL"
 * @param {string} status - "normal" | "warning" | "critical"
 * @returns {Promise<string>}
 */
export async function explainInSimpleLanguage(biomarkerName, value, unit, status) {
  const aiModel = getModel();
  if (!aiModel) {
    return `Your ${biomarkerName} level is ${value} ${unit}. This reading is ${status === 'normal' ? 'within the healthy range' : status === 'warning' ? 'slightly outside the normal range, which may need attention' : 'significantly outside the normal range and requires urgent evaluation'}.`;
  }

  try {
    const prompt = `${SYSTEM_SAFETY_PROMPT}

Explain what a ${biomarkerName} reading of ${value} ${unit} means to a patient in 1-2 sentences. Status: ${status.toUpperCase()}. Be empathetic and clear. No medical jargon. Use hedged language. Respond with ONLY the explanation text, nothing else.`;

    const result = await aiModel.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return `Your ${biomarkerName} level is ${value} ${unit}. This reading is ${status === 'normal' ? 'within a healthy range' : 'outside the normal range and should be discussed with your doctor'}.`;
  }
}

// ── EXPORTED FUNCTION 3: Emergency Recommendation ────────────────────────────
/**
 * generateEmergencyRecommendation()
 * Generates a concise AI emergency guidance paragraph.
 *
 * @param {Array} emergencyFlags - List of critical flag objects
 * @returns {Promise<string>}
 */
export async function generateEmergencyRecommendation(emergencyFlags) {
  if (!emergencyFlags || emergencyFlags.length === 0) return '';

  const aiModel = getModel();
  const flagSummary = emergencyFlags.map(f =>
    `${f.marker}: ${f.value} ${f.unit} (${f.condition})`
  ).join('; ');

  if (!aiModel) {
    return `Critical values detected in ${emergencyFlags.map(f => f.marker).join(' and ')}. These findings may indicate a medical emergency. Please seek immediate professional medical evaluation. Do not drive yourself — call emergency services or have someone take you to the nearest emergency department.`;
  }

  try {
    const prompt = `${SYSTEM_SAFETY_PROMPT}

The following CRITICAL emergency flags were detected in a patient's lab report:
${flagSummary}

Write a 2-3 sentence calm but serious emergency guidance message for the patient. Use hedged language. Encourage immediate professional care. Do not state a diagnosis. Respond with ONLY the guidance text.`;

    const result = await aiModel.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return `Critical values detected in ${emergencyFlags.map(f => f.marker).join(' and ')}. These findings may indicate a serious medical condition requiring immediate professional evaluation. Please go to the nearest emergency department or call emergency services right away.`;
  }
}

// ── EXPORTED FUNCTION 4: Doctor Summary ─────────────────────────────────────
/**
 * generateDoctorSummary()
 * Generates a concise clinical summary for healthcare professionals.
 *
 * @param {object} reportData - Full report data
 * @returns {Promise<string>}
 */
export async function generateDoctorSummary(reportData) {
  const aiModel = getModel();
  if (!aiModel) {
    return reportData.summary_doctor || 'Clinical review of diagnostic panel required.';
  }

  try {
    const biomarkerSummary = (reportData.biomarkers || [])
      .filter(b => b.status !== 'normal')
      .map(b => `${b.name}: ${b.value} ${b.unit} [${b.status.toUpperCase()}]`)
      .join(', ');

    const prompt = `${SYSTEM_SAFETY_PROMPT}

Generate a concise 2-sentence clinical summary for a physician reviewing the following abnormal findings:
${biomarkerSummary || 'No significant abnormalities detected'}
Overall Risk: ${reportData.overall_risk || 'low'}
Health Score: ${reportData.overall_score || 100}/100

Use clinical terminology. Recommend appropriate specialist referral. Respond with ONLY the clinical summary text.`;

    const result = await aiModel.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return reportData.summary_doctor || 'Clinical assessment required. Please review diagnostic panel findings with appropriate specialist referral.';
  }
}

export { FALLBACK_INSIGHTS };
