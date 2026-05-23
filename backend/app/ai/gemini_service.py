"""
gemini_service.py
─────────────────────────────────────────────────────────────────────────────
Vitalis AI — Python Gemini Intelligence Layer

Calls Google Gemini 1.5 Flash to generate:
  1. generate_medical_summary()     — full AI insight block
  2. explain_in_simple_language()  — per-biomarker plain explanation
  3. generate_emergency_recommendation() — critical flag guidance
  4. generate_doctor_summary()     — clinical professional summary

SAFETY GUARANTEE: All prompts enforce hedged, non-diagnostic language.
FALLBACK GUARANTEE: Every function returns a safe static string on failure.
─────────────────────────────────────────────────────────────────────────────
"""

import os
import json
import logging
from typing import Optional

logger = logging.getLogger("vitalis_ai.gemini")

# ── Optional import (won't crash if not installed) ───────────────────────────
try:
    import google.generativeai as genai
    _GENAI_AVAILABLE = True
except ImportError:
    _GENAI_AVAILABLE = False
    logger.warning("google-generativeai not installed. Gemini features will use fallback responses.")

# ── Initialise client ────────────────────────────────────────────────────────
_model = None

def _get_model():
    global _model
    if _model is not None:
        return _model

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or not _GENAI_AVAILABLE:
        return None

    try:
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel("gemini-1.5-flash")
        return _model
    except Exception as e:
        logger.warning(f"Gemini initialisation failed: {e}")
        return None

# ── System Safety Prompt ─────────────────────────────────────────────────────
SYSTEM_SAFETY_PROMPT = """You are Vitalis AI, a responsible AI healthcare assistant designed to explain medical findings safely.

STRICT RULES:
1. NEVER provide a definitive diagnosis. Use: "may indicate", "could suggest", "findings are consistent with".
2. ALWAYS recommend professional medical consultation.
3. Be empathetic, calm, and precise.
4. Never cause panic — be serious but reassuring.
5. All advice encourages (never replaces) professional evaluation."""

# ── Static Fallbacks ─────────────────────────────────────────────────────────
FALLBACK_SUMMARIES = {
    "critical": {
        "overview": "Your diagnostic panel has revealed several values significantly outside normal clinical reference ranges. This pattern warrants urgent professional medical evaluation.",
        "simple_explanation": "Your test results show some very concerning numbers. Please seek emergency medical care immediately.",
        "concerns": [
            "Cardiac protein markers appear significantly elevated, which may be associated with myocardial stress",
            "Blood glucose levels are critically above the normal threshold",
            "Multiple organ systems are showing simultaneous stress indicators"
        ],
        "recommendations": [
            "Seek emergency medical evaluation immediately",
            "Avoid all physical exertion",
            "Do not self-medicate",
            "Bring this report to the emergency department"
        ],
        "doctor_note": "Findings suggest possible active myocardial injury concurrent with hyperglycaemic crisis. Immediate ED evaluation strongly advised.",
        "urgency_level": "CRITICAL — IMMEDIATE CARE REQUIRED",
        "urgency_color": "#EF4444",
        "confidence": 97
    },
    "high": {
        "overview": "Your panel shows significant abnormalities across metabolic and renal indicators requiring specialist evaluation within 24 hours.",
        "simple_explanation": "Your results show numbers noticeably out of the healthy range. See a doctor within 24 hours.",
        "concerns": ["Renal function markers suggest reduced kidney filtration", "Hematological indicators show possible oxygen-carrying inefficiency"],
        "recommendations": ["Schedule specialist within 24 hours", "Avoid NSAIDs", "Maintain hydration"],
        "doctor_note": "Elevated creatinine and concurrent anemia markers. Nephrology referral recommended within 24-48 hours.",
        "urgency_level": "HIGH RISK — Within 24 Hours",
        "urgency_color": "#F97316",
        "confidence": 93
    },
    "medium": {
        "overview": "Your panel shows mild to moderate deviations suggesting early metabolic changes benefiting from timely medical review.",
        "simple_explanation": "Some results are slightly outside the healthy range. See a doctor within a few days.",
        "concerns": ["Some biomarker values mildly elevated", "Early metabolic strain indicators detected"],
        "recommendations": ["Primary care visit within 48-72 hours", "Reduce processed sugars", "30 minutes daily walking"],
        "doctor_note": "Mild metabolic irregularities. Primary care review and lifestyle counseling recommended.",
        "urgency_level": "MODERATE — Within 48-72 Hours",
        "urgency_color": "#F59E0B",
        "confidence": 90
    },
    "low": {
        "overview": "Your complete diagnostic panel shows all major biomarkers within healthy clinical reference ranges.",
        "simple_explanation": "Great news — all your test results look healthy!",
        "concerns": ["No significant abnormalities detected"],
        "recommendations": ["Continue healthy lifestyle", "7-8 hours sleep", "Routine check-up in 12 months"],
        "doctor_note": "Complete biochemical panel within physiological reference intervals. Routine annual follow-up recommended.",
        "urgency_level": "NORMAL — Routine Follow-up",
        "urgency_color": "#22C55E",
        "confidence": 98
    }
}

# ── Helper: Build Prompt ─────────────────────────────────────────────────────
def _build_insight_prompt(report_data: dict) -> str:
    biomarkers = report_data.get("biomarkers", [])
    flags = report_data.get("emergency_alerts", report_data.get("emergency_flags", []))
    organ_scores = report_data.get("organScores", {})
    risk_level = report_data.get("overall_risk", "low")
    health_score = report_data.get("overall_score", report_data.get("health_score", 0))

    bm_lines = "\n".join(
        f"  - {b['name']}: {b['value']} {b['unit']} (Normal: {b.get('normal_range','N/A')}) — {b.get('status','normal').upper()}"
        for b in biomarkers
    )

    flag_lines = "\n".join(
        f"  ⚠ CRITICAL: {f['marker']} = {f['value']} {f['unit']} — {f['condition']}"
        for f in flags
    ) or "  None detected"

    organ_text = ", ".join(f"{org}: {score}/100" for org, score in organ_scores.items())

    return f"""{SYSTEM_SAFETY_PROMPT}

---

PATIENT REPORT DATA:
Patient: {report_data.get('patient_name', 'Anonymous')}
Date: {report_data.get('report_date', 'Unknown')}
Type: {report_data.get('report_type', 'Diagnostic Panel')}
Overall Risk: {risk_level.upper()}
Health Score: {health_score}/100

BIOMARKERS:
{bm_lines}

EMERGENCY FLAGS:
{flag_lines}

ORGAN SCORES: {organ_text}

---

Respond ONLY with valid JSON (no markdown, no code fences):
{{
  "overview": "2-3 sentence clinical overview using hedged language",
  "simple_explanation": "2-3 sentence plain patient explanation",
  "concerns": ["concern 1", "concern 2", "concern 3"],
  "recommendations": ["action 1", "action 2", "action 3"],
  "doctor_note": "1 sentence clinical summary",
  "urgency_level": "CRITICAL — IMMEDIATE CARE REQUIRED | HIGH RISK — Within 24 Hours | MODERATE — Within 48-72 Hours | NORMAL — Routine Follow-up",
  "urgency_color": "#EF4444 | #F97316 | #F59E0B | #22C55E",
  "confidence": 90
}}"""

# ── Helper: Parse response ───────────────────────────────────────────────────
def _parse_response(text: str) -> Optional[dict]:
    try:
        cleaned = text.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except (json.JSONDecodeError, ValueError):
        return None

# ── FUNCTION 1: generate_medical_summary ─────────────────────────────────────
async def generate_medical_summary(report_data: dict) -> dict:
    """
    Main AI insight generator. Returns full insight object.
    Always resolves — never raises.
    """
    risk_key = report_data.get("overall_risk", "low").lower()
    normalized = risk_key if risk_key in FALLBACK_SUMMARIES else "low"
    fallback = {**FALLBACK_SUMMARIES[normalized], "is_fallback": True}

    model = _get_model()
    if not model:
        return fallback

    try:
        prompt = _build_insight_prompt(report_data)
        response = model.generate_content(prompt)
        parsed = _parse_response(response.text)
        if parsed and parsed.get("overview"):
            return {**parsed, "is_fallback": False}
        return fallback
    except Exception as e:
        logger.warning(f"Gemini summary failed: {e}")
        return fallback

# ── FUNCTION 2: explain_in_simple_language ───────────────────────────────────
async def explain_in_simple_language(biomarker: str, value: float, unit: str, status: str) -> str:
    """Per-biomarker plain language explanation."""
    status_map = {
        "normal": "within the healthy range",
        "warning": "slightly outside the normal range and may need attention",
        "critical": "significantly outside the normal range and requires urgent evaluation"
    }
    fallback = f"Your {biomarker} level is {value} {unit}. This reading is {status_map.get(status, 'being reviewed')}."

    model = _get_model()
    if not model:
        return fallback

    try:
        prompt = f"""{SYSTEM_SAFETY_PROMPT}

Explain what a {biomarker} reading of {value} {unit} means to a patient in 1-2 sentences. Status: {status.upper()}. Be empathetic. No jargon. Use hedged language. Respond with ONLY the explanation text."""
        response = model.generate_content(prompt)
        return response.text.strip() or fallback
    except Exception as e:
        logger.warning(f"Gemini simple explain failed: {e}")
        return fallback

# ── FUNCTION 3: generate_emergency_recommendation ────────────────────────────
async def generate_emergency_recommendation(flags: list) -> str:
    """Concise AI emergency guidance for critical flag situations."""
    if not flags:
        return ""

    flag_text = "; ".join(
        f"{f['marker']}: {f['value']} {f['unit']} ({f['condition']})"
        for f in flags
    )
    markers = ", ".join(f["marker"] for f in flags)
    fallback = (
        f"Critical values detected in {markers}. These findings may indicate a medical emergency. "
        "Please seek immediate professional medical evaluation — do not drive yourself. "
        "Call emergency services or go to the nearest emergency department now."
    )

    model = _get_model()
    if not model:
        return fallback

    try:
        prompt = f"""{SYSTEM_SAFETY_PROMPT}

The following CRITICAL emergency flags were detected:
{flag_text}

Write a 2-3 sentence calm but serious emergency guidance message for the patient. Use hedged language. Encourage immediate professional care. No diagnosis. Respond with ONLY the guidance text."""
        response = model.generate_content(prompt)
        return response.text.strip() or fallback
    except Exception as e:
        logger.warning(f"Gemini emergency rec failed: {e}")
        return fallback

# ── FUNCTION 4: generate_doctor_summary ─────────────────────────────────────
async def generate_doctor_summary(report_data: dict) -> str:
    """Clinical professional-grade summary for physicians."""
    abnormals = [
        b for b in report_data.get("biomarkers", [])
        if b.get("status") != "normal"
    ]
    fallback = report_data.get("summary_doctor", "Clinical review required. Please review diagnostic panel findings with appropriate specialist referral.")

    model = _get_model()
    if not model:
        return fallback

    try:
        bm_text = ", ".join(
            f"{b['name']}: {b['value']} {b['unit']} [{b['status'].upper()}]"
            for b in abnormals
        ) or "No significant abnormalities"

        prompt = f"""{SYSTEM_SAFETY_PROMPT}

Generate a concise 2-sentence clinical summary for a physician reviewing:
{bm_text}
Overall Risk: {report_data.get('overall_risk', 'low')}
Health Score: {report_data.get('overall_score', 100)}/100

Use clinical terminology. Recommend appropriate specialist referral. Respond with ONLY the clinical summary."""
        response = model.generate_content(prompt)
        return response.text.strip() or fallback
    except Exception as e:
        logger.warning(f"Gemini doctor summary failed: {e}")
        return fallback
