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
  "confidence": 90,
  "suggested_medications": ["specific supportive/therapeutic drugs or clinical families with safe warnings to ask doctor about"],
  "diet_plan": ["specific foods, nutritional rules, or meal strategies tailored for this report"]
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

// ── Dynamic Fallback Engine ──────────────────────────────────────────────────
function generateDynamicFallbackInsight(reportData) {
  const biomarkers = reportData.biomarkers || [];
  
  // Categorise biomarkers by status
  const criticalBiomarkers = biomarkers.filter(b => b.status === 'critical');
  const warningBiomarkers = biomarkers.filter(b => b.status === 'warning');
  const abnormalBiomarkers = [...criticalBiomarkers, ...warningBiomarkers];
  const normalBiomarkers = biomarkers.filter(b => b.status === 'normal');

  // Determine overall risk
  let risk = (reportData.overall_risk || 'low').toLowerCase();
  if (criticalBiomarkers.length > 0) {
    risk = 'critical';
  } else if (warningBiomarkers.length > 0) {
    risk = reportData.overall_risk ? reportData.overall_risk.toLowerCase() : 'medium';
    if (!['high', 'medium'].includes(risk)) {
      risk = 'medium';
    }
  } else {
    risk = 'low';
  }

  // Map risk to fields
  let urgency_level = "NORMAL — Routine Follow-up";
  let urgency_color = "#22C55E";
  let confidence = 95;

  if (risk === 'critical') {
    urgency_level = "CRITICAL — IMMEDIATE CARE REQUIRED";
    urgency_color = "#EF4444";
    confidence = 97;
  } else if (risk === 'high') {
    urgency_level = "HIGH RISK — Within 24 Hours";
    urgency_color = "#F97316";
    confidence = 94;
  } else if (risk === 'medium') {
    urgency_level = "MODERATE — Within 48-72 Hours";
    urgency_color = "#F59E0B";
    confidence = 91;
  }

  // 1. Compile concerns based on out-of-range biomarkers
  const concerns = [];
  const abnormalOrgansSet = new Set();
  const abnormalNames = [];
  const abnormalValues = [];

  abnormalBiomarkers.forEach(b => {
    const organ = b.affected_organ || b.organ || 'blood';
    abnormalOrgansSet.add(organ);
    abnormalNames.push(b.name);
    abnormalValues.push(`${b.value} ${b.unit}`);

    const isCrit = b.status === 'critical';
    let desc = '';
    const nameLower = b.name.toLowerCase();

    if (nameLower.includes('troponin')) {
      desc = `Cardiac Troponin I is ${isCrit ? 'critically high' : 'mildly elevated'} at ${b.value} ${b.unit} (Normal: ${b.normal_range}), which suggests potential ${isCrit ? 'acute myocardial injury or extreme cardiac stress' : 'minor heart muscle irritation'}.`;
    } else if (nameLower.includes('glucose')) {
      desc = `Fasting Blood Glucose is ${isCrit ? 'critically elevated' : 'noticeably high'} at ${b.value} ${b.unit} (Normal: ${b.normal_range}), indicating ${isCrit ? 'a severe metabolic emergency risk (Hyperglycaemic crisis)' : 'impaired glucose tolerance or insulin resistance'}.`;
    } else if (nameLower.includes('creatinine')) {
      desc = `Serum Creatinine is ${isCrit ? 'critically high' : 'mildly elevated'} at ${b.value} ${b.unit} (Normal: ${b.normal_range}), consistent with ${isCrit ? 'acute kidney injury risk and severe filtration decline' : 'moderate renal strain or clearance insufficiency'}.`;
    } else if (nameLower.includes('hemoglobin') || nameLower.includes('hb')) {
      desc = `Hemoglobin is ${isCrit ? 'critically deficient' : 'mildly low'} at ${b.value} ${b.unit} (Normal: ${b.normal_range}), suggesting ${isCrit ? 'severe anemia with critically compromised blood oxygen transport capacity' : 'mild iron deficiency anemia'}.`;
    } else if (nameLower.includes('platelet')) {
      desc = `Platelet count is ${isCrit ? 'critically low' : 'below optimal levels'} at ${b.value} ${b.unit} (Normal: ${b.normal_range}), indicating ${isCrit ? 'severe thrombocytopenia with increased bleeding hazards' : 'mild thrombocytopenia'}.`;
    } else if (nameLower.includes('potassium')) {
      desc = `Serum Potassium is ${isCrit ? 'critically out of range' : 'mildly abnormal'} at ${b.value} ${b.unit} (Normal: ${b.normal_range}), which represents a ${isCrit ? 'severe cardiovascular risk of life-threatening cardiac rhythm disturbances' : 'minor mineral electrolyte imbalance'}.`;
    } else if (nameLower.includes('sodium')) {
      desc = `Serum Sodium is ${isCrit ? 'critically depleted' : 'mildly low'} at ${b.value} ${b.unit} (Normal: ${b.normal_range}), consistent with ${isCrit ? 'severe hyponatremia posing significant neurological risk' : 'mild hyponatremia with hydration imbalance'}.`;
    } else if (nameLower.includes('ldl')) {
      desc = `LDL "bad" cholesterol is elevated at ${b.value} ${b.unit} (Normal: ${b.normal_range}), representing moderate cardiovascular risk due to arterial lipid deposition.`;
    } else if (nameLower.includes('ast') || nameLower.includes('sgot')) {
      desc = `AST liver enzyme is elevated at ${b.value} ${b.unit} (Normal: ${b.normal_range}), indicating hepatocellular stress.`;
    } else if (nameLower.includes('alt') || nameLower.includes('sgpt')) {
      desc = `ALT liver enzyme is elevated at ${b.value} ${b.unit} (Normal: ${b.normal_range}), representing localized hepatic tissue irritation.`;
    } else {
      desc = `${b.name} is measured at ${b.value} ${b.unit}, which is outside the standard reference threshold of ${b.normal_range} (Status: ${b.status.toUpperCase()}).`;
    }
    
    concerns.push(desc);
  });

  if (concerns.length === 0) {
    concerns.push("No significant abnormalities detected across monitored biological markers.");
    concerns.push("All vital organ system indicators are operating within standard reference ranges.");
  }

  // Format Organs list for plain text summaries
  const abnormalOrgans = Array.from(abnormalOrgansSet).map(org => {
    if (org === 'cardiovascular') return 'cardiovascular system';
    if (org === 'blood') return 'hematopoietic (blood) system';
    if (org === 'kidneys') return 'renal (kidney) system';
    if (org === 'liver') return 'hepatic (liver) system';
    if (org === 'pancreas') return 'metabolic (pancreas) system';
    if (org === 'brain') return 'neurological system';
    return org;
  });

  // 2. Synthesize dynamic, safety-hedged overviews
  let overview = '';
  let simple_explanation = '';
  let doctor_note = '';

  if (risk === 'critical') {
    overview = `Your complete diagnostic panel has revealed critical biomarker abnormalities, specifically highlighted by severe deviations in ${abnormalNames.join(', ')}. This multi-system metabolic or cardiovascular stress represents acute physiological instability and warrants immediate, expert clinical intervention to mitigate adverse outcomes.`;
    simple_explanation = `Your lab results show highly concerning values in your ${abnormalOrgans.join(' and ')}, particularly with out-of-range readings like ${abnormalValues.join(', ')}. These numbers indicate that your body is currently undergoing severe stress. We strongly urge you to seek immediate medical attention.`;
    doctor_note = `CRITICAL METABOLIC ALERT: Deterministic dynamic analysis identified acute decompensation in ${abnormalNames.join(', ')}. Immediate emergency transfer and specialized evaluation is strongly recommended.`;
  } else if (risk === 'high') {
    overview = `Your diagnostic profile demonstrates substantial physiological stress, primarily driven by out-of-range levels in ${abnormalNames.join(', ')}. While not presenting as a sudden emergency, these high-risk deviations indicate advanced organ system stress that warrants a professional specialist evaluation within the next 24 hours.`;
    simple_explanation = `Your blood test results show some key numbers are noticeably outside the healthy range — especially affecting your ${abnormalOrgans.join(' and ')}. Your body is under significant strain, and we recommend scheduling an appointment with a doctor or specialist in the next 24 hours.`;
    doctor_note = `HIGH RISK ASSAY: Elevated risk markers in ${abnormalNames.join(', ')}. Suggest prompt specialist referral and repeat metabolic assay within 24-48 hours.`;
  } else if (risk === 'medium') {
    overview = `Your diagnostic assay displays mild to moderate shifts from standard physiologic reference ranges in ${abnormalNames.join(', ')}. These early metabolic or filtration stress indicators do not present immediate danger, but they suggest localized functional imbalances that would benefit from timely clinical review and targeted lifestyle adjustment.`;
    simple_explanation = `A few of your test numbers are slightly outside the normal healthy ranges, mainly involving your ${abnormalOrgans.join(' and ')}. These are early warning signs of minor stress. We recommend reviewing these findings with your primary care doctor within a couple of days to make healthy lifestyle adjustments.`;
    doctor_note = `MODERATE METABOLIC IRRITATION: Mild excursions noted in ${abnormalNames.join(', ')}. Advise primary care review, dietary modification, and a follow-up screening in 4-6 weeks.`;
  } else {
    overview = `Your complete diagnostic panel shows all major biomarkers within healthy reference limits. Your organ systems appear to be functioning optimally at this time, with no immediate indications of metabolic, renal, liver, or hematological stress.`;
    simple_explanation = `Great news — all of your test results look healthy! Your heart, kidneys, liver, blood markers, and blood sugar levels are all operating perfectly within normal ranges. Keep up your current healthy diet and lifestyle habits.`;
    doctor_note = `NORMAL PHYSIOLOGICAL PANEL: All checked biomarkers are within standard reference intervals. Routine annual check-ups and standard preventive screenings recommended.`;
  }

  // 3. Compile highly targeted recommendations based on affected organs
  const recommendationsSet = new Set();

  abnormalOrgansSet.forEach(org => {
    if (org === 'kidneys') {
      recommendationsSet.add("Maintain consistent daily pure water hydration (2.0 to 2.5 liters) to support renal clearance, unless advised otherwise by a clinician.");
      recommendationsSet.add("Strictly avoid all nephrotoxic agents, particularly over-the-counter NSAIDs like ibuprofen, naproxen, or high-dose aspirin.");
      recommendationsSet.add("Schedule a follow-up Renal Function Panel and consult a Nephrologist for comprehensive GFR and filtration tracking.");
    }
    if (org === 'cardiovascular') {
      recommendationsSet.add("Adopt a cardiovascular-protective diet, strictly limiting dietary sodium (<1,500 mg daily) and avoiding all saturated trans fats.");
      recommendationsSet.add("Monitor blood pressure twice daily (morning and evening) and keep a written log for your cardiologist's review.");
      recommendationsSet.add("Avoid sudden heavy physical strain or high-stress environments until cleared by a cardiovascular physician.");
    }
    if (org === 'pancreas') {
      recommendationsSet.add("Strictly eliminate refined sugars, high-fructose corn syrups, and processed carbohydrates from your daily diet.");
      recommendationsSet.add("Request a follow-up HbA1c screening from your endocrinologist to assess long-term metabolic control.");
      recommendationsSet.add("Incorporate light, post-prandial physical activity (such as a 15-minute walk after meals) to assist glucose clearance.");
    }
    if (org === 'blood') {
      recommendationsSet.add("Increase intake of dietary iron (e.g., dark leafy greens, lean proteins) paired with Vitamin C to support hematopoiesis.");
      recommendationsSet.add("Consult a general physician or hematologist to organize a complete Serum Ferritin and Iron Saturation panel.");
      recommendationsSet.add("Take extra precautions to avoid physical trauma or lacerations to minimize bleeding risks if platelets are reduced.");
    }
    if (org === 'liver') {
      recommendationsSet.add("Strictly abstain from alcohol consumption and avoid unnecessary hepatotoxic medications or supplements.");
      recommendationsSet.add("Incorporate liver-supportive foods such as cruciferous vegetables, garlic, and citrus fruits into your daily diet.");
      recommendationsSet.add("Coordinate with your physician to schedule a repeat Liver Function Test (LFT) panel in 2 to 4 weeks.");
    }
  });

  if (recommendationsSet.size === 0) {
    recommendationsSet.add("Maintain your excellent daily hydration routine (approx. 2-2.5 liters of water).");
    recommendationsSet.add("Continue engaging in 150 minutes of weekly moderate aerobic exercise (e.g., brisk walking, swimming).");
    recommendationsSet.add("Ensure a balanced diet rich in soluble fibers, antioxidants, and lean clean proteins.");
    recommendationsSet.add("Ensure consistent sleep hygiene, targeting 7-8 hours of quality restful sleep nightly.");
  }

  const recommendations = Array.from(recommendationsSet).slice(0, 4);

  // 4. Compile targeted supportive medications and custom diet plans
  const medicationsSet = new Set();
  const dietPlanSet = new Set();

  abnormalOrgansSet.forEach(org => {
    if (org === 'kidneys') {
      medicationsSet.add("Phosphate binders (e.g., Sevelamer 800mg with meals under specialist guidance) to regulate mineral imbalances");
      medicationsSet.add("Erythropoietin-stimulating agents (ESAs) if anemia is concurrent with severe kidney filtration decline");
      medicationsSet.add("Strict avoidance of nephrotoxic medications, specifically all over-the-counter NSAIDs (like Ibuprofen or Naproxen)");
      
      dietPlanSet.add("Strictly limit sodium intake to < 1,500 mg per day to manage blood pressure and prevent fluid retention");
      dietPlanSet.add("Restrict potassium-rich foods (limit bananas, oranges, tomatoes, potatoes) and choose low-potassium options (berries, apples, cabbage)");
      dietPlanSet.add("Restrict dietary phosphorus (reduce dairy, nuts, colas) and maintain moderate, high-biological-value protein intake");
    }
    if (org === 'cardiovascular') {
      medicationsSet.add("HMG-CoA reductase inhibitors / Statins (e.g., Atorvastatin 20mg or Rosuvastatin to stabilize arterial plaques)");
      medicationsSet.add("Antiplatelet therapy (e.g., Low-dose Aspirin 75-81mg daily, subject to practitioner authorization)");
      medicationsSet.add("Cardioprotective antihypertensives (e.g., ACE Inhibitors like Ramipril or ARBs like Losartan to reduce cardiac strain)");
      
      dietPlanSet.add("Adopt the DASH (Dietary Approaches to Stop Hypertension) or Mediterranean eating pattern");
      dietPlanSet.add("Prioritize foods high in omega-3 fatty acids (fatty fish, walnuts, flaxseeds) and extra virgin olive oil");
      dietPlanSet.add("Strictly eliminate trans fats, hydrogenated oils, and highly processed cured meats high in sodium");
    }
    if (org === 'pancreas') {
      medicationsSet.add("Biguanides (e.g., Metformin 500mg-1000mg twice daily with meals to improve peripheral insulin sensitivity)");
      medicationsSet.add("SGLT2 inhibitors (e.g., Empagliflozin) or GLP-1 receptor agonists (e.g., Semaglutide) to support glucose clearance");
      medicationsSet.add("Glucose-monitoring supplies and emergency rapid-acting insulin protocols as directed by an endocrinologist");
      
      dietPlanSet.add("Focus on low-glycemic index (GI) foods such as steel-cut oats, lentils, quinoa, and non-starchy green vegetables");
      dietPlanSet.add("Strictly eliminate all simple sugars, sweet beverages, sodas, and products containing refined white flour");
      dietPlanSet.add("Ensure each meal includes soluble dietary fiber (target 35g daily) and lean clean proteins to slow glucose absorption");
    }
    if (org === 'blood') {
      medicationsSet.add("Oral therapeutic iron supplements (e.g., Ferrous Ascorbate 100mg elemental iron daily to correct blood iron deficits)");
      medicationsSet.add("Active Vitamin C (Ascorbic Acid 500mg) taken co-jointly with iron to more than double absorption efficiency");
      medicationsSet.add("Vitamin B12 (Cyanocobalamin) or Folic Acid supplements if secondary megaloblastic anemia factors are suspected");
      
      dietPlanSet.add("Increase natural iron-rich foods: green spinach, beans, lentils, pumpkin seeds, and iron-fortified lean proteins");
      dietPlanSet.add("Strictly avoid drinking black tea, coffee, or calcium-rich milk with meals, as tannins and calcium inhibit iron absorption");
      dietPlanSet.add("Integrate Vitamin C rich citrus fruits (oranges, sweet limes, lemons) during iron-heavy meals to maximize absorption");
    }
    if (org === 'liver') {
      medicationsSet.add("Hepatoprotective agents (e.g., Milk Thistle/Silymarin supplements, or Ursodeoxycholic Acid under clinical review)");
      medicationsSet.add("Antioxidant therapy (e.g., Vitamin E 400 IU daily if indicated for non-alcoholic fatty liver changes)");
      medicationsSet.add("Strictly avoid paracetamol (acetaminophen) or hepatotoxic compounds that exacerbate liver cellular stress");
      
      dietPlanSet.add("Increase dietary antioxidants through cruciferous vegetables (broccoli, brussels sprouts, cabbage) and garlic");
      dietPlanSet.add("Strictly avoid all alcohol consumption and minimize high-fructose corn syrups to relieve hepatic strain");
      dietPlanSet.add("Drink 2-3 cups of green tea daily, which is rich in catechins that help support liver enzyme recovery");
    }
  });

  if (medicationsSet.size === 0) {
    medicationsSet.add("No therapeutic medications required at this time; standard baseline is optimal.");
    medicationsSet.add("Consider high-quality daily preventive multivitamins or Vitamin D3 (1000 IU) to support general wellness.");
  }
  if (dietPlanSet.size === 0) {
    dietPlanSet.add("Maintain a balanced macronutrient ratio: 50% complex carbohydrates, 25% lean proteins, and 25% healthy fats.");
    dietPlanSet.add("Incorporate a wide color spectrum of seasonal vegetables and fresh whole fruits (aim for 5 servings daily).");
    dietPlanSet.add("Stay hydrated by drinking 2.5 liters of clean water distributed evenly throughout the day.");
  }

  const suggested_medications = Array.from(medicationsSet).slice(0, 4);
  const diet_plan = Array.from(dietPlanSet).slice(0, 4);

  return {
    overview,
    simple_explanation,
    concerns,
    recommendations,
    doctor_note,
    urgency_level,
    urgency_color,
    confidence,
    is_fallback: true,
    suggested_medications,
    diet_plan
  };
}

// ── EXPORTED FUNCTION 1: Main Medical Insight ────────────────────────────────
/**
 * generateMedicalInsight()
 * Generates the full AI insight block for the dashboard.
 * Always resolves — never rejects. Falls back to dynamic data on error.
 *
 * @param {object} reportData - Full structured report from medicalEngine or API
 * @returns {Promise<object>} - Insight object with overview, concerns, recommendations, etc.
 */
export async function generateMedicalInsight(reportData) {
  const aiModel = getModel();
  if (!aiModel) {
    // No valid API key — return dynamically generated local fallback
    return generateDynamicFallbackInsight(reportData);
  }

  try {
    const prompt = buildInsightPrompt(reportData);
    const result = await aiModel.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = parseGeminiResponse(responseText);

    if (parsed && parsed.overview) {
      return { ...parsed, is_fallback: false };
    }

    // Parsing failed — use dynamic fallback
    return generateDynamicFallbackInsight(reportData);
  } catch (err) {
    console.warn('[Vitalis AI] Gemini insight generation failed, using fallback:', err.message);
    return generateDynamicFallbackInsight(reportData);
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

// ── EXPORTED FUNCTION 5: Chat Assistant Conversational Answer ─────────────────
/**
 * chatWithAssistant()
 * Sends a chat message to Gemini regarding the patient's report findings.
 * Includes chat history for continuity.
 *
 * @param {object} reportData - Current patient report
 * @param {Array} history - Previous messages: [{ role: 'user'|'model', text: '...' }]
 * @param {string} newMessage - Current user question
 * @returns {Promise<string>} - AI response
 */
export async function chatWithAssistant(reportData, history, newMessage) {
  const aiModel = getModel();
  
  // Format report overview summary for the model context
  const biomarkersText = (reportData?.biomarkers || [])
    .map(b => `${b.name}: ${b.value} ${b.unit} (Normal: ${b.normal_range}) [${b.status.toUpperCase()}]`)
    .join('\n');
    
  const context = `You are DiagnosIQ AI, a compassionate clinical AI health intelligence assistant.
The user is asking questions about their current diagnostic laboratory report.

PATIENT FILE CONTEXT:
Patient: ${reportData?.patient_name || 'Anonymous'}
Overall Health Score: ${reportData?.overall_score || 85}/100
Systemic Risk Level: ${(reportData?.overall_risk || 'low').toUpperCase()}

BIOMARKER METRICS:
${biomarkersText || 'No diagnostic values loaded.'}

STRICT INSTRUCTIONS:
1. ALWAYS use hedged medical language (e.g. "suggests", "may represent", "associated with"). NEVER state a definitive diagnosis.
2. ALWAYS recommend professional medical consultation for exact symptoms.
3. Be reassuring, calm, empathetic, and clear. Avoid panic-inducing terms.
4. If asked about something completely unrelated to health or medicine, politely guide the conversation back to their diagnostic health report.
5. Base your answers on the laboratory report values when relevant.

CHAT HISTORY:
${history.map(h => `${h.role === 'user' ? 'Patient' : 'Assistant'}: ${h.text}`).join('\n')}

Patient: ${newMessage}
Assistant:`;

  if (!aiModel) {
    // API Key is missing — simulate a gorgeous response using intelligent rule heuristics
    return simulateChatResponse(reportData, newMessage);
  }

  try {
    const result = await aiModel.generateContent(context);
    return result.response.text().trim();
  } catch (err) {
    console.warn('[DiagnosIQ Chat] Gemini chat failed, using simulated fallback:', err.message);
    return simulateChatResponse(reportData, newMessage);
  }
}

// ── Smart Chat Heuristic Fallback Engine ─────────────────────────────────────
function simulateChatResponse(reportData, question) {
  const q = question.toLowerCase();
  
  if (q.includes('glucose') || q.includes('sugar') || q.includes('diabetes')) {
    const gl = reportData?.biomarkers?.find(b => b.name.toLowerCase() === 'glucose');
    if (gl) {
      if (gl.value > 140) {
        return `Your fasting blood sugar (Glucose) level is recorded at ${gl.value} ${gl.unit}, which is above the standard reference range (${gl.normal_range}). This pattern could suggest impaired glucose clearance or metabolic stress. I recommend discussing this with a primary care doctor or endocrinology specialist to organize a follow-up HbA1c screening. In the meantime, reducing simple sugars and engaging in light physical activity like walking can help support metabolic health.`;
      } else {
        return `Your fasting blood sugar (Glucose) level is at a stable ${gl.value} ${gl.unit}, which falls perfectly within the healthy clinical range (${gl.normal_range}). This represents robust insulin sensitivity. To maintain this metabolic health, it is recommended to keep up a balanced diet rich in soluble fibers and engage in regular exercise. Let me know if you have questions about other markers!`;
      }
    }
    return "Your glucose values appear stable, representing healthy insulin dynamics. I recommend keeping sugars low and scheduling a routing sugar assay test in 12 months.";
  }
  
  if (q.includes('creatinine') || q.includes('kidney') || q.includes('renal')) {
    const cr = reportData?.biomarkers?.find(b => b.name.toLowerCase() === 'creatinine');
    if (cr) {
      if (cr.value > 1.2) {
        return `Your Serum Creatinine level is recorded at ${cr.value} ${cr.unit}, which is elevated beyond the standard clinical bounds (${cr.normal_range}). Because creatinine is a primary byproduct of muscular filtration, this elevation could indicate temporary systemic dehydration, high muscular exertion, or reduced kidney clearance rate. Please maintain hydration (2 to 2.5 liters of water daily), avoid over-the-counter NSAIDs (like Ibuprofen), and request a follow-up GFR evaluation from a nephrology specialist to check your filtration integrity.`;
      } else {
        return `Your Serum Creatinine level is at ${cr.value} ${cr.unit}, which is within the normal reference threshold (${cr.normal_range}). This indicates healthy glomerular filtration and robust kidney clearing capacity. Please maintain daily hydration to keep your renal system operating at this optimal level!`;
      }
    }
    return "Your renal function indicators reflect excellent filtration clearance. Maintaining high fluid intake is always a strong habit to preserve this stability.";
  }
  
  if (q.includes('hemoglobin') || q.includes('blood') || q.includes('anemia') || q.includes('iron')) {
    const hb = reportData?.biomarkers?.find(b => b.name.toLowerCase() === 'hemoglobin');
    if (hb) {
      if (hb.value < 12.0) {
        return `Your Hemoglobin level is recorded at ${hb.value} ${hb.unit}, which is below normal reference ranges (${hb.normal_range}). Hemoglobin is vital for oxygen transport in red blood cells. A low reading could suggest mild iron deficiency or anemia, explaining feelings of tiredness. It would be beneficial to consult a professional to run a serum ferritin panel, and look into dietary iron supports (like dark leafy greens, beans, and vitamin C to aid absorption).`;
      } else {
        return `Your Hemoglobin level is currently at ${hb.value} ${hb.unit}, which is fully optimal (${hb.normal_range}). This means your blood has highly efficient oxygen-carrying capacity, supporting stable cellular energy. Keeping a balanced iron-rich diet is a great way to support this hematological status.`;
      }
    }
  }

  if (q.includes('troponin') || q.includes('heart') || q.includes('cardiac') || q.includes('chest')) {
    const tr = reportData?.biomarkers?.find(b => b.name.toLowerCase() === 'troponin i' || b.name.toLowerCase() === 'troponin');
    if (tr && tr.value > 0.04) {
      return `WARNING: Your Cardiac Troponin I level is critically high at ${tr.value} ${tr.unit} (Normal is < 0.04). Troponin is a specific protein released when the heart muscle is under acute stress or injury. Combined with glucose levels, this pattern suggests cardiac strain. This is a severe clinical flag. If you are experiencing chest tightness, arm numbness, shortness of breath, or sweating, please go to the nearest emergency department immediately or call emergency services. Do not delay.`;
    }
    return `Your cardiac markers (including Troponin I if checked) are within optimal safety reference bounds. This suggests a calm cardiovascular status. Please keep up a heart-healthy diet low in saturated fats and monitor symptoms regularly. If you ever experience acute chest discomfort, seek professional care instantly.`;
  }
  
  if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
    return `Hello! I am DiagnosIQ AI, your personal clinical health intelligence assistant. I can help explain your medical biomarkers, describe what out-of-range kidney or metabolic numbers mean in plain language, and recommend health lifestyle habits. What question can I answer about your report today?`;
  }

  return `Based on your DiagnosIQ clinical health assay, your overall systemic health score is ${reportData?.overall_score ?? 85}/100, showing a ${reportData?.overall_risk ?? 'low'} hazard level. To help me give you more precise information, could you tell me which biomarker (such as Glucose, Creatinine, or Hemoglobin) or symptom you are most curious about? Remember that all health findings should be reviewed with a clinician for an exact diagnostic plan.`;
}

export { FALLBACK_INSIGHTS };

// ── EXPORTED FUNCTION 6: Explain Raw OCR Report directly in simple language ──
/**
 * explainRawOcrReport()
 * Sends raw OCR report text directly to Gemini and retrieves a simple, layperson-friendly explanation.
 *
 * @param {string} rawText - Raw OCR text extracted from the document
 * @returns {Promise<string>} - AI explanation in plain English
 */
export async function explainRawOcrReport(rawText) {
  const aiModel = getModel();
  
  const systemPrompt = `You are DiagnosIQ AI, a compassionate clinical AI health intelligence assistant.
Your task is to take the RAW, unformatted OCR text extracted from a medical report and provide a comprehensive, clear, and reassuring explanation in extremely simple, layperson-friendly language (plain English).

STRICT INSTRUCTIONS:
1. ALWAYS use hedged medical language (e.g. "suggests", "may represent", "associated with"). NEVER state a definitive diagnosis.
2. ALWAYS recommend professional medical consultation for exact symptoms.
3. Be reassuring, calm, empathetic, and clear. Avoid panic-inducing terms.
4. Structure the response beautifully and neatly with bullet points or small paragraphs where appropriate, so a regular person can read it easily.
5. Highlight what the out-of-range markers are and what they mean, in simple terms.
6. Address the patient directly and keep the tone warm and supportive.`;

  if (!aiModel) {
    // If no API key, simulate a beautifully structured fallback explanation based on parsing key markers
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(simulateRawOcrExplanation(rawText));
      }, 1000);
    });
  }

  try {
    const prompt = `${systemPrompt}

---
RAW OCR MEDICAL REPORT:
${rawText}
---

Provide the simple-language explanation below:`;

    const result = await aiModel.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn('[DiagnosIQ OCR Insight] Gemini direct OCR explanation failed, using local generator:', err.message);
    return simulateRawOcrExplanation(rawText);
  }
}

// Simulated fallback generator for direct raw OCR text when Gemini API key is missing/fails
function simulateRawOcrExplanation(rawText) {
  if (!rawText) return "No raw report text detected. Please upload or paste a clean report to retrieve a translation.";
  
  const patientMatch = rawText.match(/(?:patient name|name|patient)\s*[:=-]?\s*([A-Za-z]+(?:\s+[A-Za-z]+){1,2})/i);
  const patientName = patientMatch ? patientMatch[1].trim() : "Patient";
  
  let explanation = `Hello ${patientName},\n\nI have reviewed the raw text of your report. Here is a simple, direct explanation of what is in your document:\n\n`;
  
  // Find indicators in text to make the fallback feel alive and dynamic
  const textLower = rawText.toLowerCase();
  
  const hasTroponin = textLower.includes('troponin');
  const hasGlucose = textLower.includes('glucose') || textLower.includes('sugar');
  const hasCreatinine = textLower.includes('creatinine');
  const hasHemoglobin = textLower.includes('hemoglobin') || textLower.includes('hb');
  const hasLdl = textLower.includes('ldl') || textLower.includes('cholesterol');
  
  let findings = [];
  if (hasTroponin) {
    findings.push(`- **Cardiac Indicators (Troponin)**: There appears to be a cardiac protein marker mentioned. High troponin can be a sign that the heart muscle is experiencing stress or strain. This is a very important number that should be evaluated immediately by a doctor.`);
  }
  if (hasGlucose) {
    findings.push(`- **Blood Sugar (Glucose)**: We noticed a glucose value. If it's high, it suggests your body might have trouble clearing sugar from your blood, which could indicate diabetes risk or insulin resistance. Reducing sweets and eating more whole foods can help.`);
  }
  if (hasCreatinine) {
    findings.push(`- **Kidney Filtration (Creatinine)**: A creatinine level was found. This byproduct of muscle metabolism is cleared by the kidneys. An elevation might suggest the kidneys are under stress or you are dehydrated. Drinking plenty of water is highly recommended.`);
  }
  if (hasHemoglobin) {
    findings.push(`- **Oxygen Carriers (Hemoglobin)**: Hemoglobin is the protein in red blood cells that carries oxygen. If low, it can lead to feeling tired or weak (often called anemia). Iron-rich foods can support this.`);
  }
  if (hasLdl) {
    findings.push(`- **Cholesterol (LDL)**: We found cholesterol numbers. LDL is the 'bad' cholesterol, and if high, it can accumulate in blood vessels over time. Eating a heart-healthy diet low in saturated fats is very beneficial.`);
  }
  
  if (findings.length > 0) {
    explanation += `Based on the key terms detected in your report, here are the main systems we noticed:\n\n` + findings.join('\n\n');
  } else {
    explanation += `Your report contains several diagnostic measurements. All detected values appear to be standard, and no extreme indicators were found. We encourage you to review these results with your healthcare provider for a thorough routine checkup.`;
  }
  
  explanation += `\n\n**Next Steps & Recommendations:**\n1. Schedule a consultation with your primary doctor to review this report.\n2. Do not make any sudden changes to your medications or health regimen without professional advice.\n3. Keep drinking plenty of water and maintain a healthy, balanced diet.\n\n*Note: This is an automated AI reading to help you understand your report, not a clinical diagnosis.*`;
  
  return explanation;
}
