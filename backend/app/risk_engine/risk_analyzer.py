from app.utils.reference_ranges import REFERENCE_RANGES

# Standard weights to compute the total Health Index Score
ORGAN_WEIGHTS = {
    "cardiovascular": 0.25,
    "blood": 0.20,
    "kidneys": 0.20,
    "liver": 0.15,
    "pancreas": 0.10,
    "brain": 0.10
}

def analyze_parsed_results(parsed_data: dict) -> dict:
    """
    Evaluates structured diagnostics against the WHO reference database
    and structures organ-specific functional indexes, emergency triggers,
    and layman translations.
    """
    patient_info = parsed_data["patient_info"]
    gender = patient_info["gender"].lower()
    
    tests = parsed_data["tests"]
    
    emergency_alerts = []
    abnormalities = []
    
    organ_scores = {
        "cardiovascular": 100,
        "blood": 100,
        "kidneys": 100,
        "liver": 100,
        "pancreas": 100,
        "brain": 100
    }
    
    biomarkers_list = []
    
    # 1. Loop through parsed tests to identify deviations
    for key, test_data in tests.items():
        val = test_data["value"]
        ref_db = REFERENCE_RANGES[key]
        
        status = "normal"
        severity = "Normal"
        explanation = f"Your {ref_db['name']} is optimal at {val} {ref_db['unit']}."
        score_impact = 0
        
        # A. Deterministic Critical Check
        if ref_db["critical_low"] is not None and val <= ref_db["critical_low"]:
            status = "critical"
            severity = "High"
            explanation = f"Critical Low: {ref_db['condition']} risk detected."
            score_impact = 50
            emergency_alerts.append({
                "marker": ref_db["name"],
                "value": val,
                "unit": ref_db["unit"],
                "condition": ref_db["condition"],
                "severity": "CRITICAL",
                "action": ref_db["recommendation"]
            })
        elif ref_db["critical_high"] is not None and val >= ref_db["critical_high"]:
            status = "critical"
            severity = "High"
            explanation = f"Critical High: {ref_db['condition']} risk detected."
            score_impact = 50
            emergency_alerts.append({
                "marker": ref_db["name"],
                "value": val,
                "unit": ref_db["unit"],
                "condition": ref_db["condition"],
                "severity": "CRITICAL",
                "action": ref_db["recommendation"]
            })
            
        # B. Warning reference check
        if status != "critical":
            bounds = ref_db[gender]
            if val < bounds["low"] or val > bounds["high"]:
                status = "warning"
                severity = "Medium"
                explanation = f"Imbalance: {ref_db['name']} is outside normal reference bounds."
                score_impact = 20
                abnormalities.append({
                    "test": ref_db["name"],
                    "value": val,
                    "unit": ref_db["unit"],
                    "severity": "Medium",
                    "explanation": f"Mild localized stress on {ref_db['organ']} system."
                })
                
        # Deduct system-level health scores
        organ = ref_db["organ"]
        if organ in organ_scores:
            organ_scores[organ] = max(10, organ_scores[organ] - score_impact)
            
        # Formulate descriptions
        dict_text = get_clinical_dict_text(ref_db["name"], status, val, ref_db["unit"])
        
        # Standardize for dashboard
        test_data["status"] = status
        biomarkers_list.append({
            "name": ref_db["name"],
            "value": val,
            "unit": ref_db["unit"],
            "normal_range": test_data["normal_range"],
            "status": status,
            "affected_organ": organ,
            "confidence": 0.95,
            "plain_english": dict_text["plain_english"],
            "clinical_term": dict_text["clinical_term"],
            "icd10_hint": dict_text["icd10_hint"]
        })

    # Calculate health index score
    health_score = 0
    for org, weight in ORGAN_WEIGHTS.items():
        health_score += organ_scores[org] * weight
    health_score = round(health_score)
    
    # Calculate Risk Levels
    risk_level = "Low"
    if emergency_alerts:
        risk_level = "Critical"
    elif abnormalities:
        risk_level = "Medium"
        
    # Auto Generate Summaries
    critical_names = [e["marker"] for e in emergency_alerts]
    abnormal_names = [a["test"] for a in abnormalities]
    
    summary_patient = "All dynamic diagnostic systems represent healthy and stable operational capacities. Continue current dietary standards."
    summary_doctor = "STABILITY AUDIT: Clinical metrics are within reference intervals. Normal follow-up recommended."
    
    if critical_names:
        summary_patient = f"CRITICAL ALARM: Severely out-of-bounds levels detected in your {', '.join(critical_names)}. Immediate medical assessment is advised. Avoid physical strain."
        summary_doctor = f"CLINICAL RISK ALERT: Deterministic validation failed for {', '.join(critical_names)}. Systemic organ decompensation risk is high. Emergency department transfer recommended."
    elif abnormal_names:
        summary_patient = f"MODERATE CONCERN: Minor imbalances flagged in your {', '.join(abnormal_names)}. These indicate localized system stress. Review with your practitioner in 2-3 days."
        summary_doctor = f"METABOLIC IRRITATION: Elevated thresholds registered for {', '.join(abnormal_names)}. Primary care review is recommended."

    # Synthesize action items
    diet = ["Maintain optimal cellular hydration (2.5L water/day)", "Consume rich source of green leafy vegetables"]
    lifestyle = ["Ensure 7.5 hours of consistent nocturnal sleep", "Aim for 30 minutes of low impact daily exercises"]
    specialist = "GP / Internist"
    urgency = "Routine checkup (12 Months)"
    
    if emergency_alerts:
        urgency = "IMMEDIATE (Emergency Department)"
        organs_critical = [b["affected_organ"] for b in biomarkers_list if b["status"] == "critical"]
        if "cardiovascular" in organs_critical:
            specialist = "Interventional Cardiologist"
            diet = ["Strict sodium elimination", "Fluid balance restricted"]
        elif "pancreas" in organs_critical:
            specialist = "Endocrinologist"
            diet = ["Strict processed sugars elimination"]
        elif "kidneys" in organs_critical:
            specialist = "Nephrologist"
            diet = ["Regulate liquid inputs", "Restrict high potassium/sodium meals"]
            
    return {
        "patient_name": patient_info["name"],
        "report_date": parsed_data["report_date"],
        "report_type": parsed_data["report_type"],
        "overall_risk": risk_level.lower(),
        "risk_level": risk_level,
        "ocr_confidence": parsed_data.get("ocr_confidence", 0.95),
        "overall_score": health_score,
        "health_score": health_score,
        "organScores": organ_scores,
        "biomarkers": biomarkers_list,
        "tests": tests,
        "emergency_flags": emergency_alerts,
        "emergency_alerts": emergency_alerts,
        "abnormalities": abnormalities,
        "summary_patient": summary_patient,
        "summary_doctor": summary_doctor,
        "action_plan": {
            "diet": diet,
            "lifestyle": lifestyle,
            "specialist": specialist,
            "urgency": urgency
        }
    }

def get_clinical_dict_text(name: str, status: str, val: float, unit: str) -> dict:
    plain_english = f"Your {name} is within a healthy target range."
    clinical_term = f"Serum {name}"
    icd10_hint = "Z00.0"
    
    if name == "Glucose":
        if status == "warning":
            plain_english = "Glucose is elevated, which can indicate pre-diabetic insulin resistance."
            clinical_term = "Impaired Fasting Glucose"
            icd10_hint = "R73.09"
        elif status == "critical":
            plain_english = "Fasting glucose is critically high, raising diabetic emergency risk."
            clinical_term = "Severe Hyperglycaemia"
            icd10_hint = "E11.9"
    elif name == "Hemoglobin":
        if status == "warning":
            plain_english = "Hemoglobin is mildly low, which may contribute to sluggish tiredness."
            clinical_term = "Mild Anemia"
            icd10_hint = "D64.9"
        elif status == "critical":
            plain_english = "Hemoglobin is critically low, creating severe anemia concerns."
            clinical_term = "Severe Anemia"
            icd10_hint = "D64.9"
    elif name == "Serum Creatinine":
        if status == "warning":
            plain_english = "Kidney waste clearance is slightly low, suggesting mild kidney strain."
            clinical_term = "Renal Insufficiency"
            icd10_hint = "N18.3"
        elif status == "critical":
            plain_english = "Creatinine is dangerously high, suggesting severe kidney failure concerns."
            clinical_term = "Acute Kidney Injury Risk"
            icd10_hint = "N17.9"
            
    return {
        "plain_english": plain_english,
        "clinical_term": clinical_term,
        "icd10_hint": icd10_hint
    }
