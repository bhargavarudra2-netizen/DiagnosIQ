export interface Biomarker {
  name: string;
  value: number;
  unit: string;
  normal_range: string;
  status: "normal" | "warning" | "critical";
  affected_organ: string;
  confidence: number;
  plain_english: string;
  clinical_term: string;
  icd10_hint: string;
}

export interface EmergencyFlag {
  marker: string;
  value: number;
  unit: string;
  condition: string;
  severity: "CRITICAL" | "HIGH";
  action: string;
}

export interface ActionPlan {
  diet: string[];
  lifestyle: string[];
  specialist: string;
  urgency: string;
}

export interface ReportData {
  patient_name: string;
  report_date: string;
  report_type: string;
  overall_risk: "low" | "medium" | "high" | "critical";
  ocr_confidence: number;
  overall_score?: number;
  organScores?: {
    cardiovascular: number;
    blood: number;
    kidneys: number;
    liver: number;
    pancreas: number;
    brain: number;
  };
  biomarkers: Biomarker[];
  summary_patient: string;
  summary_doctor: string;
  emergency_flags: EmergencyFlag[];
  action_plan: ActionPlan;
}

export interface HistoricalRecord {
  date: string;
  biomarkers: {
    [key: string]: number;
  };
}
