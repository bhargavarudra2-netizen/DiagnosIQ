# Structured clinical reference guidelines based on WHO & ICMR clinical standards

REFERENCE_RANGES = {
    "hemoglobin": {
        "name": "Hemoglobin",
        "male": {"low": 13.0, "high": 17.0},
        "female": {"low": 12.0, "high": 16.0},
        "unit": "g/dL",
        "organ": "blood",
        "critical_low": 7.0,
        "critical_high": None,
        "condition": "Severe Anemia",
        "recommendation": "Consult hematologist or General Physician within 24 hours. Red cell transfusion may be required."
    },
    "glucose": {
        "name": "Glucose",
        "male": {"low": 70.0, "high": 140.0},
        "female": {"low": 70.0, "high": 140.0},
        "unit": "mg/dL",
        "organ": "pancreas",
        "critical_low": 50.0,
        "critical_high": 250.0,
        "condition": "Severe Hyperglycaemia / Hypoglycaemic Crisis",
        "recommendation": "Consult endocrinologist or seek urgent emergency clinical assessment."
    },
    "platelets": {
        "name": "Platelets",
        "male": {"low": 150000.0, "high": 450000.0},
        "female": {"low": 150000.0, "high": 450000.0},
        "unit": "cells/mcL",
        "organ": "blood",
        "critical_low": 50000.0,
        "critical_high": None,
        "condition": "Severe Thrombocytopenia (Bleeding Risk)",
        "recommendation": "Seek immediate medical consultation. Rest strictly and avoid any physical collision/injury risks."
    },
    "creatinine": {
        "name": "Serum Creatinine",
        "male": {"low": 0.6, "high": 1.2},
        "female": {"low": 0.5, "high": 1.1},
        "unit": "mg/dL",
        "organ": "kidneys",
        "critical_low": None,
        "critical_high": 4.5,
        "condition": "Acute Kidney Injury Risk",
        "recommendation": "Urgent nephrologist consultation within 24-48 hours. Monitor daily liquid inputs."
    },
    "sodium": {
        "name": "Sodium",
        "male": {"low": 135.0, "high": 145.0},
        "female": {"low": 135.0, "high": 145.0},
        "unit": "mEq/L",
        "organ": "brain",
        "critical_low": 120.0,
        "critical_high": 160.0,
        "condition": "Severe Electrolyte Imbalance (Neurological Risk)",
        "recommendation": "Seek emergency medical evaluation. Can induce severe brain swelling if managed carelessly."
    },
    "potassium": {
        "name": "Potassium",
        "male": {"low": 3.5, "high": 5.2},
        "female": {"low": 3.5, "high": 5.2},
        "unit": "mEq/L",
        "organ": "cardiovascular",
        "critical_low": 2.8,
        "critical_high": 6.2,
        "condition": "Severe Hyperkalemia / Hypokalemia (Arrhythmia Risk)",
        "recommendation": "Immediate emergency room care. Skewed potassium blocks cardiac rhythm pathways."
    },
    "troponin": {
        "name": "Troponin I",
        "male": {"low": 0.0, "high": 0.04},
        "female": {"low": 0.0, "high": 0.04},
        "unit": "ng/mL",
        "organ": "cardiovascular",
        "critical_low": None,
        "critical_high": 2.0,
        "condition": "Acute Coronary Strain",
        "recommendation": "Immediate cardiac critical transfer. Do not wait."
    },
    "ldl": {
        "name": "LDL Cholesterol",
        "male": {"low": 0.0, "high": 100.0},
        "female": {"low": 0.0, "high": 100.0},
        "unit": "mg/dL",
        "organ": "cardiovascular",
        "critical_low": None,
        "critical_high": 190.0,
        "condition": "Severe Hypercholesterolaemia",
        "recommendation": "Consult cardiologist and implement strict trans-fat restricted dietary protocols."
    },
    "ast": {
        "name": "AST",
        "male": {"low": 10.0, "high": 40.0},
        "female": {"low": 10.0, "high": 35.0},
        "unit": "U/L",
        "organ": "liver",
        "critical_low": None,
        "critical_high": 150.0,
        "condition": "Hepatic cellular Transaminitis",
        "recommendation": "Consult hepatologist. Discontinue unnecessary OTC pharmaceuticals."
    },
    "alt": {
        "name": "ALT",
        "male": {"low": 7.0, "high": 56.0},
        "female": {"low": 7.0, "high": 45.0},
        "unit": "U/L",
        "organ": "liver",
        "critical_low": None,
        "critical_high": 180.0,
        "condition": "Active Hepatic Stress / ALT Elevation",
        "recommendation": "Hepatology evaluation suggested. Implement metabolic diet changes."
    },
    "wbc": {
        "name": "White Blood Cells",
        "male": {"low": 4.5, "high": 11.0},
        "female": {"low": 4.5, "high": 11.0},
        "unit": "k/uL",
        "organ": "blood",
        "critical_low": 2.0,
        "critical_high": 30.0,
        "condition": "Leukocytosis / Severe Leukopenia",
        "recommendation": "Consult primary physician to determine if severe systemic infection is present."
    },
    "rbc": {
        "name": "Red Blood Cells",
        "male": {"low": 4.3, "high": 5.9},
        "female": {"low": 3.5, "high": 5.5},
        "unit": "M/uL",
        "organ": "blood",
        "critical_low": 2.5,
        "critical_high": 7.5,
        "condition": "Erythrocytopenia / Polycythemia",
        "recommendation": "Hematology check recommended to audit iron counts."
    },
    "bilirubin": {
        "name": "Total Bilirubin",
        "male": {"low": 0.1, "high": 1.2},
        "female": {"low": 0.1, "high": 1.2},
        "unit": "mg/dL",
        "organ": "liver",
        "critical_low": None,
        "critical_high": 5.0,
        "condition": "Hyperbilirubinemia (Jaundice Risk)",
        "recommendation": "Urgent liver profile checks. Monitor for yellowing of skin or eyes."
    }
}
