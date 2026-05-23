import re
from app.utils.reference_ranges import REFERENCE_RANGES

# Custom typographical mappings to resolve OCR scanning mistakes
BIOMARKER_ALIASES = {
    "hemoglobin": [r"hemoglobin", r"hb", r"hgb", r"hemo", r"h3moglob1n", r"hem0glob1n", r"hemoglob1n"],
    "glucose": [r"glucose", r"blood sugar", r"fasting sugar", r"fasting glucose", r"glu", r"gluc0s3", r"gluc0se", r"glc"],
    "platelets": [r"platelets", r"platelet count", r"plt", r"plat", r"plate1ets", r"plate1et"],
    "creatinine": [r"creatinine", r"serum creatinine", r"creat", r"crea", r"cr3atinin3", r"creatinin3", r"cr3at"],
    "sodium": [r"sodium", r"na\+", r"s0dium", r"sod"],
    "potassium": [r"potassium", r"k\+", r"p0tassium", r"pot"],
    "troponin": [r"troponin", r"troponin i", r"trop i", r"tr0p0nin", r"troponin-i"],
    "ldl": [r"ldl", r"ldl-c", r"ldl cholesterol", r"bad cholesterol", r"ch0lesterol"],
    "ast": [r"ast", r"sgot", r"aspartate"],
    "alt": [r"alt", r"sgpt", r"alanine"],
    "wbc": [r"wbc", r"white blood cells", r"w\.b\.c", r"leukocytes"],
    "rbc": [r"rbc", r"red blood cells", r"r\.b\.c", r"erythrocytes"],
    "bilirubin": [r"bilirubin", r"total bilirubin", r"b1l1rub1n", r"bil"]
}

def parse_extracted_text(text: str) -> dict:
    """
    Parses messy OCR text using medical aliases and regular expressions
    and structures them into dynamic patient metadata and biomarker records.
    """
    # 1. Extract Patient Name
    patient_name = "Anonymous Patient"
    name_match = re.search(r"(?:patient name|name|patient|mr\.|ms\.|mrs\.)\s*[:=-]?\s*([A-Za-z]+(?:\s+[A-Za-z]+){1,2})", text, re.IGNORECASE)
    if name_match:
        patient_name = name_match.group(1).strip()

    # 2. Extract Patient Age
    patient_age = 35  # default
    age_match = re.search(r"(?:age|yrs|yr|years|y\.o\.)\s*[:=-]?\s*(\d+)", text, re.IGNORECASE)
    if age_match:
        try:
            patient_age = int(age_match.group(1))
        except ValueError:
            pass

    # 3. Extract Patient Gender
    patient_gender = "Male"  # default
    gender_match = re.search(r"(?:gender|sex)\s*[:=-]?\s*(male|female|m|f|fem)", text, re.IGNORECASE)
    if gender_match:
        g_raw = gender_match.group(1).lower()
        if g_raw.startswith("f"):
            patient_gender = "Female"
        else:
            patient_gender = "Male"

    # 4. Extract Collection Date
    report_date = "2026-05-23"
    date_match = re.search(r"(?:date|report date|collection date|date of collection)\s*[:=-]?\s*([\d\-/A-Za-z]+)", text, re.IGNORECASE)
    if date_match:
        raw_date = date_match.group(1).strip()
        cleaned_date = re.sub(r"[^\d\-/A-Za-z]", "", raw_date)
        if len(cleaned_date) >= 6:
            report_date = cleaned_date

    # 5. Extract Biomarkers using Alias Match Loop
    parsed_tests = {}
    
    for key, aliases in BIOMARKER_ALIASES.items():
        val = None
        for alias in aliases:
            # Pattern: matches alias followed by possible spaces, punctuation, then floats
            pattern = rf"{alias}\s*(?:\(Fasting\)|\(Hb\))?\s*[:=-]?\s*(\d+(?:\.\d+)?)"
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    val = float(match.group(1))
                    break  # break inner loop if value successfully mapped
                except ValueError:
                    continue
                    
        if val is not None:
            # Standardize ranges using reference guidelines dataset
            ref = REFERENCE_RANGES[key]
            
            # Select gender specific thresholds
            gender_key = patient_gender.lower()
            range_bounds = ref[gender_key]
            
            parsed_tests[key] = {
                "name": ref["name"],
                "value": val,
                "unit": ref["unit"],
                "normal_range": f"{range_bounds['low']} - {range_bounds['high']}",
                "affected_organ": ref["organ"],
                "status": "normal"  # Initialized, re-evaluated by risk analyzer
            }

    return {
        "patient_info": {
            "name": patient_name,
            "age": patient_age,
            "gender": patient_gender
        },
        "report_date": report_date,
        "report_type": "OCR Mapped Diagnostic Panel",
        "tests": parsed_tests
    }
