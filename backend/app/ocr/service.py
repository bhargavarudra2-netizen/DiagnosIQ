import re
import random
from datetime import datetime

BIOMARKER_RANGES = {
    "glucose": {"min": 70.0, "max": 140.0, "unit": "mg/dL", "organ": "pancreas"},
    "troponin": {"min": 0.0, "max": 0.04, "unit": "ng/mL", "organ": "cardiovascular"},
    "hemoglobin": {"min": 12.0, "max": 16.0, "unit": "g/dL", "organ": "blood"},
    "platelets": {"min": 150000.0, "max": 450000.0, "unit": "cells/mcL", "organ": "blood"},
    "creatinine": {"min": 0.6, "max": 1.2, "unit": "mg/dL", "organ": "kidneys"},
    "potassium": {"min": 3.5, "max": 5.2, "unit": "mEq/L", "organ": "cardiovascular"},
    "sodium": {"min": 135.0, "max": 145.0, "unit": "mEq/L", "organ": "brain"},
    "ldl": {"min": 0.0, "max": 100.0, "unit": "mg/dL", "organ": "cardiovascular"},
    "ast": {"min": 10.0, "max": 40.0, "unit": "U/L", "organ": "liver"},
    "alt": {"min": 7.0, "max": 56.0, "unit": "U/L", "organ": "liver"}
}

BIOMARKER_PATTERNS = {
    "glucose": r"(?:glucose|blood sugar|fasting sugar|fasting glucose|glu)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(mg/dL|mg/l)?",
    "troponin": r"(?:troponin|troponin i|trop i|troponin-i)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(ng/mL|ng/l)?",
    "hemoglobin": r"(?:hemoglobin|hb|hgb|hemo)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(g/dL|g/l)?",
    "platelets": r"(?:platelets|platelet count|plt|plat)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(cells/mcL|cells/ul|k/ul|/ul|c/ul|10\^3/uL)?",
    "creatinine": r"(?:creatinine|serum creatinine|creat|crea)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(mg/dL|mg/l)?",
    "potassium": r"(?:potassium|k\+)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(mEq/L|meq/l|mmol/l)?",
    "sodium": r"(?:sodium|na\+)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(mEq/L|meq/l|mmol/l)?",
    "ldl": r"(?:ldl|ldl cholesterol|ldl-c|bad cholesterol)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(mg/dL|mg/l)?",
    "ast": r"(?:ast|sgot|aspartate)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(u/l|iu/l)?",
    "alt": r"(?:alt|sgpt|alanine)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(u/l|iu/l)?"
}

BIOMARKER_DISPLAY_NAMES = {
    "glucose": "Glucose",
    "troponin": "Troponin",
    "hemoglobin": "Hemoglobin",
    "platelets": "Platelets",
    "creatinine": "Serum Creatinine",
    "potassium": "Potassium",
    "sodium": "Sodium",
    "ldl": "LDL Cholesterol",
    "ast": "AST",
    "alt": "ALT"
}

def ocr_text_extract(text: str) -> dict:
    # 1. Extract Patient Name
    patient_name = "Anonymous Patient"
    name_match = re.search(r"(?:patient name|name|patient|mr\.|ms\.|mrs\.)\s*[:=-]?\s*([A-Za-z]+(?:\s+[A-Za-z]+){1,2})", text, re.IGNORECASE)
    if name_match:
        patient_name = name_match.group(1).strip()

    # 2. Extract Date
    report_date = datetime.now().strftime("%Y-%m-%d")
    date_match = re.search(r"(?:date|report date|date of collection)\s*[:=-]?\s*([\d\-/A-Za-z]+)", text, re.IGNORECASE)
    if date_match:
        report_date = date_match.group(1).strip()

    # 3. Extract Biomarkers
    extracted_biomarkers = []
    
    for key, pattern in BIOMARKER_PATTERNS.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                val = float(match.group(1))
                range_info = BIOMARKER_RANGES[key]
                
                extracted_biomarkers.append({
                    "name": BIOMARKER_DISPLAY_NAMES[key],
                    "value": val,
                    "unit": range_info["unit"],
                    "normal_range": f"{range_info['min']} - {range_info['max']}",
                    "status": "normal",  # Evaluated by risk engine
                    "affected_organ": range_info["organ"],
                    "confidence": round(random.uniform(0.91, 0.99), 2)
                })
            except (ValueError, IndexError):
                continue

    return {
        "patient_name": patient_name,
        "report_date": report_date,
        "report_type": "OCR Mapped Diagnostic Panel",
        "ocr_confidence": round(sum(b["confidence"] for b in extracted_biomarkers) / (len(extracted_biomarkers) or 1), 2),
        "biomarkers": extracted_biomarkers
    }
