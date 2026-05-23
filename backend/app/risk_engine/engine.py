# Deterministic safety rule parameters matching WHO/ICMR clinical values

EMERGENCY_RULES = {
    "Glucose": {
        "critical_high": 250.0,
        "critical_low": 50.0,
        "condition": "Hyperglycaemic Crisis / Severe Hypoglycemia",
        "organ": "pancreas",
        "action": "Urgent endocrinologist review or ER visit immediately."
    },
    "Troponin": {
        "critical_high": 2.0,
        "condition": "Possible Active Cardiac Event",
        "organ": "cardiovascular",
        "action": "Call ambulance or visit emergency department immediately."
    },
    "Hemoglobin": {
        "critical_low": 7.0,
        "condition": "Severe Anemia (Oxygen Depletion)",
        "organ": "blood",
        "action": "Urgent primary care physician review within 24 hours."
    },
    "Platelets": {
        "critical_low": 50000.0,
        "condition": "Severe Thrombocytopenia (Bleeding Risk)",
        "organ": "blood",
        "action": "Consult clinical hematologist. Avoid any physical strains."
    },
    "Serum Creatinine": {
        "critical_high": 4.5,
        "condition": "Acute Kidney Injury Risk",
        "organ": "kidneys",
        "action": "Urgent nephrology evaluation. Monitor daily fluid balances."
    },
    "Sodium": {
        "critical_low": 120.0,
        "condition": "Severe Hyponatremia (Neurological Strain)",
        "organ": "brain",
        "action": "Urgent hospitalization for careful saline replenishment."
    }
}

ORGAN_WEIGHTS = {
    "cardiovascular": 0.25,
    "blood": 0.20,
    "kidneys": 0.20,
    "liver": 0.15,
    "pancreas": 0.10,
    "brain": 0.10
}

def evaluate_biomarkers(biomarkers: list) -> dict:
    flags = []
    organ_scores = {
        "cardiovascular": 100,
        "blood": 100,
        "kidneys": 100,
        "liver": 100,
        "pancreas": 100,
        "brain": 100
    }
    
    for bm in biomarkers:
        name = bm["name"]
        val = bm["value"]
        
        # Check rule boundaries
        status = "normal"
        score_impact = 0
        
        # 1. Critical Rules Checks
        if name in EMERGENCY_RULES:
            rule = EMERGENCY_RULES[name]
            if "critical_high" in rule and val >= rule["critical_high"]:
                status = "critical"
                score_impact = 50
                flags.append({
                    "marker": name,
                    "value": val,
                    "unit": bm["unit"],
                    "condition": rule["condition"],
                    "severity": "CRITICAL",
                    "action": rule["action"]
                })
            elif "critical_low" in rule and val <= rule["critical_low"]:
                status = "critical"
                score_impact = 50
                flags.append({
                    "marker": name,
                    "value": val,
                    "unit": bm["unit"],
                    "condition": rule["condition"],
                    "severity": "CRITICAL",
                    "action": rule["action"]
                })
        
        # 2. General Warning bounds
        if status != "critical":
            # standard threshold cleaner
            try:
                min_v, max_v = map(float, bm["normal_range"].split(" - "))
                if val < min_v or val > max_v:
                    status = "warning"
                    score_impact = 20
            except ValueError:
                pass
                
        bm["status"] = status
        
        # Enrich descriptions
        bm.update(enrich_biomarker_text(name, status, val, bm["unit"]))
        
        # Deduct organ scores
        organ = bm["affected_organ"]
        if organ in organ_scores:
            organ_scores[organ] = max(10, organ_scores[organ] - score_impact)

    # Calculate overall index
    overall_score = 0
    for organ, weight in ORGAN_WEIGHTS.items():
        overall_score += organ_scores[organ] * weight
        
    overall_score = round(overall_score)
    
    # Risk Classification
    overall_risk = "low"
    if flags:
        overall_risk = "critical"
    elif any(b["status"] == "warning" for b in biomarkers):
        overall_risk = "medium"

    # Dynamic summaries
    summary_patient = f"Your overall health score is {overall_score}/100. All active physiological channels are balanced and operating correctly."
    summary_doctor = f"SYSTEM STABILITY: Biochemical assay representing stable baseline metrics. Normal follow-up advised."
    
    criticals = [b["name"] for b in biomarkers if b["status"] == "critical"]
    warnings = [b["name"] for b in biomarkers if b["status"] == "warning"]
    
    if criticals:
        summary_patient = f"CRITICAL CONCERN: Out-of-bounds levels detected in your {', '.join(criticals)}. Immediate physician consultation is requested. Avoid any sudden exercises."
        summary_doctor = f"CLINICAL INSIGHT: Assay alert triggered for {', '.join(criticals)}. Patient displays active functional indicators of systemic collapse risk. ER assessment suggested."
    elif warnings:
        summary_patient = f"MODERATE CONCERN: Elevated ranges detected in your {', '.join(warnings)}. These indicate minor cellular stress. Re-hydrate and consult your primary care doctor."
        summary_doctor = f"SYSTEM INSTABILITY: Minor functional transaminitis or glycemic strain in {', '.join(warnings)}. Primary physician check suggested."

    # Dynamic action plan
    diet = ["Maintain optimal hydration (2.5L water/day)", "Consume rich source of green leafy vegetables"]
    lifestyle = ["Ensure 7.5 hours of sleep", "Aim for 30 minutes of low impact daily exercises"]
    specialist = "GP / General Practitioner"
    urgency = "Routine checkup (12 Months)"
    
    if flags:
        urgency = "IMMEDIATE (Emergency Department)"
        if "cardiovascular" in [b["affected_organ"] for b in biomarkers if b["status"] == "critical"]:
            specialist = "Cardiologist"
            diet = ["Strict sodium elimination", "Fluid balance restricted"]
        elif "pancreas" in [b["affected_organ"] for b in biomarkers if b["status"] == "critical"]:
            specialist = "Endocrinologist"
            diet = ["Eliminate all processed simple sugars"]
        elif "kidneys" in [b["affected_organ"] for b in biomarkers if b["status"] == "critical"]:
            specialist = "Nephrologist"
            diet = ["Regulate liquid volumes", "Restrict potassium/sodium heavy salts"]

    return {
        "overall_score": overall_score,
        "overall_risk": overall_risk,
        "organScores": organ_scores,
        "emergency_flags": flags,
        "summary_patient": summary_patient,
        "summary_doctor": summary_doctor,
        "action_plan": {
            "diet": diet,
            "lifestyle": lifestyle,
            "specialist": specialist,
            "urgency": urgency
        }
      }

def enrich_biomarker_text(name: str, status: str, val: float, unit: str) -> dict:
    # Provides realistic clinical and layman terminology for non-medical users
    plain_english = f"Your {name} is optimal at {val} {unit}."
    clinical_term = f"Serum {name}"
    icd10_hint = "Z00.0"
    
    if name == "Glucose":
        if status == "warning":
            plain_english = "Blood sugar is elevated, which can suggest pre-diabetic tendencies."
            clinical_term = "Impaired Fasting Glucose"
            icd10_hint = "R73.09"
        elif status == "critical":
            plain_english = "Sugar is critically high, posing acute metabolic crisis risks."
            clinical_term = "Severe Hyperglycaemia"
            icd10_hint = "E11.9"
    elif name == "Hemoglobin":
        if status == "warning":
            plain_english = "Hemoglobin is mildly low, which can impact energy levels."
            clinical_term = "Mild Anemia"
            icd10_hint = "D64.9"
        elif status == "critical":
            plain_english = "Hemoglobin is critically low. Severe anemia, consult doctor."
            clinical_term = "Severe Anemia"
            icd10_hint = "D64.9"
    elif name == "Serum Creatinine":
        if status == "warning":
            plain_english = "Kidney waste clearance is slightly low, suggesting mild kidney strain."
            clinical_term = "Renal Insufficiency"
            icd10_hint = "N18.3"
        elif status == "critical":
            plain_english = "Creatinine is critically elevated, showing acute kidney strain risk."
            clinical_term = "Acute Kidney Injury Risk"
            icd10_hint = "N17.9"
            
    return {
        "plain_english": plain_english,
        "clinical_term": clinical_term,
        "icd10_hint": icd10_hint
    }
