"""
ai_insights.py — FastAPI router for Gemini AI intelligence endpoint
POST /api/ai/insight  — accepts full report JSON, returns enriched response with ai_summary
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from app.ai.gemini_service import (
    generate_medical_summary,
    generate_emergency_recommendation,
    generate_doctor_summary,
)

router = APIRouter()

# ── Request Schema ────────────────────────────────────────────────────────────
class BiomarkerItem(BaseModel):
    name: str
    value: float
    unit: str
    normal_range: Optional[str] = ""
    status: Optional[str] = "normal"
    affected_organ: Optional[str] = ""

class EmergencyFlag(BaseModel):
    marker: str
    value: float
    unit: str
    condition: str
    severity: Optional[str] = "CRITICAL"

class AIInsightRequest(BaseModel):
    patient_name: Optional[str] = "Anonymous"
    report_date: Optional[str] = ""
    report_type: Optional[str] = "Diagnostic Panel"
    overall_risk: Optional[str] = "low"
    overall_score: Optional[int] = 0
    health_score: Optional[int] = 0
    organScores: Optional[dict] = {}
    biomarkers: Optional[List[dict]] = []
    emergency_alerts: Optional[List[dict]] = []
    emergency_flags: Optional[List[dict]] = []
    summary_doctor: Optional[str] = ""
    mode: Optional[str] = "full"  # "full" | "simple" | "emergency" | "doctor"

# ── POST /api/ai/insight ─────────────────────────────────────────────────────
@router.post("/insight")
async def get_ai_insight(payload: AIInsightRequest):
    """
    Accepts a structured medical report and returns Gemini AI enriched insights.
    
    Mode options:
      - "full"      → generates complete insight object
      - "emergency" → generates only emergency recommendation text
      - "doctor"    → generates only clinical doctor summary
    """
    report_dict = payload.model_dump()

    try:
        if payload.mode == "emergency":
            flags = payload.emergency_alerts or payload.emergency_flags or []
            if not flags:
                return {"emergency_recommendation": ""}
            text = await generate_emergency_recommendation(flags)
            return {"emergency_recommendation": text}

        elif payload.mode == "doctor":
            text = await generate_doctor_summary(report_dict)
            return {"doctor_summary": text}

        else:
            # Full insight
            insight = await generate_medical_summary(report_dict)

            # Also generate doctor summary if critical/high
            doctor_note = ""
            risk = (payload.overall_risk or "low").lower()
            if risk in ("critical", "high"):
                doctor_note = await generate_doctor_summary(report_dict)

            return {
                "ai_summary": insight,
                "doctor_summary": doctor_note or insight.get("doctor_note", ""),
                "is_fallback": insight.get("is_fallback", True),
            }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI insight generation error: {str(e)}"
        )

# ── GET /api/ai/health ───────────────────────────────────────────────────────
@router.get("/health")
async def ai_health_check():
    """Check if Gemini AI is configured and reachable."""
    import os
    has_key = bool(os.getenv("GEMINI_API_KEY", ""))
    return {
        "gemini_configured": has_key,
        "fallback_available": True,
        "status": "ready" if has_key else "fallback_only"
    }
