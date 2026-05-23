import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Activity, UploadCloud, ArrowRight, FileText,
  CheckCircle, Cpu, FileJson, Trash2, Database, Shield,
  Brain, Heart, FlaskConical, Stethoscope, TrendingUp, MessageCircle,
  Zap, AlertCircle, Play, ChevronRight
} from 'lucide-react';
import { MOCK_REPORTS, analyzeBiomarkers, parseRawReportText } from './services/medicalEngine';
import AnatomicalVisualizer from './components/AnatomicalVisualizer';
import RiskDashboard from './components/RiskDashboard';
import TrendAnalysis from './components/TrendAnalysis';
import EmergencyAlert from './components/EmergencyAlert';
import PrintableActionPlan from './components/PrintableActionPlan';
import AIInsightPanel from './components/AIInsightPanel';
import {
  AnimatedRedCross,
  ECGStrip,
  BloodDrops,
  BloodCells,
  BloodStreaks,
  DataStreams,
  HospitalStatusBadge,
  MedicalParticleField,
  FloatingCrosses,
} from './components/HospitalEffects';

/* ══════════════════════════════════════════════════════════
   REPORT TEMPLATES
   ══════════════════════════════════════════════════════════ */
const RAW_TEXT_TEMPLATES = {
  lipid_cbc: `Patient Name: John Doe
Date: 2026-05-23
---------------------------------------------
VITAL METABOLIC LABORATORY REPORT
---------------------------------------------
Glucose (Fasting)     280 mg/dL   70 - 140
Hemoglobin (Hb)       8.5 g/dL    13.0 - 17.0
Platelets             42000 cells/mcL 150000 - 450000
Serum Creatinine      1.0 mg/dL   0.6 - 1.2
LDL Cholesterol       185 mg/dL   < 100
SGOT (AST)            42 U/L      10 - 40
SGPT (ALT)            45 U/L      7 - 56
---------------------------------------------
Validated by: Dr. Sarah Jenkins, MD`,

  renal_anemia: `Patient Name: Maria Hernandez
Report Date: 12-May-2026
---------------------------------------------
METROPOLIS DIAGNOSTICS INC.
---------------------------------------------
Creatinine Level:     3.2 mg/dL   (Normal: 0.6 - 1.2)
Hemoglobin Count:     7.2 g/dL    (Normal: 12.0 - 16.0)
Sodium Level (Na+):   129 mEq/L   (Normal: 135 - 145)
Potassium (K+):       5.8 mEq/L   (Normal: 3.5 - 5.2)
Fasting Glucose:      95 mg/dL    (Normal: 70 - 140)
---------------------------------------------
Clinical Report status: Verified`,

  cardiac_emergency: `Patient Name: James Sterling
Collection Date: 23/05/2026
---------------------------------------------
APOLLO CLINICAL RESEARCH SYSTEM
---------------------------------------------
Troponin I            2.4 ng/mL   (Normal: < 0.04)
Fasting Glucose       310 mg/dL   (Normal: 70 - 140)
LDL Cholesterol       215 mg/dL   (Normal: < 100)
Platelet Count        210000 cells/mcL (Normal: 150000 - 450000)
Hemoglobin            14.2 g/dL   (Normal: 13.0 - 17.0)
---------------------------------------------
Verified by laboratory computer auto-signature`
};

const CINEMATIC_LOADING_STEPS = [
  { msg: "Initializing optical character extraction pipeline...", icon: "🔬" },
  { msg: "Applying binarization & contrast optimization...", icon: "⚙️" },
  { msg: "Extracting diagnostic markers from report typography...", icon: "📊" },
  { msg: "Analyzing hematological patterns...", icon: "🩸" },
  { msg: "Running WHO/ICMR clinical threshold validation...", icon: "🛡️" },
  { msg: "Evaluating organ-level risk correlations...", icon: "🫀" },
  { msg: "Synthesizing AI patient explanation layer...", icon: "🧠" },
  { msg: "Generating preventive healthcare recommendations...", icon: "💊" },
  { msg: "Analysis complete. Dispatching intelligence payload...", icon: "✅" },
];

const PROCESS_STEPS = [
  { id: 1, label: 'OCR Scan',     icon: <UploadCloud className="h-3.5 w-3.5" /> },
  { id: 2, label: 'Parse Values', icon: <FileText className="h-3.5 w-3.5" /> },
  { id: 3, label: 'Risk Check',   icon: <Shield className="h-3.5 w-3.5" /> },
  { id: 4, label: 'Complete',     icon: <CheckCircle className="h-3.5 w-3.5" /> },
];

const FEATURES = [
  {
    icon: <Brain className="h-5 w-5" />,
    color: 'bg-blue-50 text-blue-600 border border-blue-100',
    title: 'AI-Powered Extraction',
    desc: 'Advanced OCR with 99.2% accuracy extracts all biomarkers from any report format.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-red-50 text-red-600 border border-red-100',
    title: 'Emergency Risk Detection',
    desc: 'Deterministic WHO/ICMR rule engine instantly flags life-threatening values.',
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    title: 'Historical Trends',
    desc: 'Compare biomarkers across time to detect progressive deterioration early.',
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    color: 'bg-violet-50 text-violet-600 border border-violet-100',
    title: 'Plain Language Explain',
    desc: 'Clinical findings translated into clear patient-friendly language.',
  },
];

// Animated counter hook
function useAnimatedCounter(target, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

function StatCounter({ value, suffix = '', prefix = '' }) {
  // Extract numeric part
  const numericVal = parseFloat(value.replace(/[^0-9.]/g, ''));
  const hasLt = value.startsWith('<');
  const hasPct = value.includes('%');
  const hasSec = value.includes('s');
  const animated = useAnimatedCounter(numericVal, 2000);
  
  let display = animated;
  if (hasLt) display = `< ${animated}`;
  if (hasPct) display = `${animated}%`;
  if (hasSec) display = `< ${animated}s`;
  
  return <span>{display}</span>;
}

/* ══════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState('landing');
  const [activeTab, setActiveTab] = useState('command');
  const [activeReport, setActiveReport] = useState(null);
  const [selectedOrgan, setSelectedOrgan] = useState(null);

  const [scanProgress, setScanProgress] = useState(0);
  const [activeLog, setActiveLog] = useState('');
  const [completedLogs, setCompletedLogs] = useState([]);
  const [loadingStep, setLoadingStep] = useState(0);

  const [criticalFlags, setCriticalFlags] = useState([]);
  const [showEmergency, setShowEmergency] = useState(false);

  const [inputText, setInputText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [historyReports, setHistoryReports] = useState([]);

  // Demo Mode state
  const [demoMode, setDemoMode] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(false);

  // Dashboard reveal animation
  const [dashboardVisible, setDashboardVisible] = useState(false);

  useEffect(() => {
    if (screen === 'analysis') {
      setTimeout(() => setDashboardVisible(true), 100);
    } else {
      setDashboardVisible(false);
    }
  }, [screen]);

  /* ── Report loaders ───────────────────────────────────── */
  const handleLoadReport = (reportKey) => {
    setScreen('scanning');
    setScanProgress(0);
    setLoadingStep(0);
    setCompletedLogs([]);
    setActiveLog(CINEMATIC_LOADING_STEPS[0].msg);

    const report = MOCK_REPORTS[reportKey];
    const analysis = analyzeBiomarkers(report.biomarkers);
    const updatedReport = {
      ...report,
      overall_score: analysis.overallScore,
      overall_risk: analysis.overallRisk,
      organScores: analysis.organScores,
      emergency_flags: analysis.flags
    };
    setActiveReport(updatedReport);
    setCriticalFlags(analysis.flags);

    if (report.historical) {
      setHistoryReports(report.historical);
    } else {
      if (reportKey === 'normal') {
        setHistoryReports([
          { date: '2025-11-20', biomarkers: { glucose: 95, hemoglobin: 14.2, creatinine: 0.9, sodium: 139 } },
          { date: '2026-02-15', biomarkers: { glucose: 94, hemoglobin: 14.4, creatinine: 0.9, sodium: 138 } },
          { date: '2026-05-18', biomarkers: { glucose: 92, hemoglobin: 14.5, creatinine: 0.9, sodium: 140 } }
        ]);
      } else if (reportKey === 'critical') {
        setHistoryReports([
          { date: '2025-11-20', biomarkers: { glucose: 110, hemoglobin: 12.5, creatinine: 0.8, sodium: 136 } },
          { date: '2026-02-15', biomarkers: { glucose: 160, hemoglobin: 11.8, creatinine: 0.9, sodium: 135 } },
          { date: '2026-05-23', biomarkers: { glucose: 310, hemoglobin: 11.2, creatinine: 1.1, sodium: 135 } }
        ]);
      } else {
        setHistoryReports([]);
      }
    }
  };

  // Demo mode loader — instant gratification
  const handleDemoMode = () => {
    setDemoMode(true);
    setShowDemoBanner(true);
    handleLoadReport('critical');
  };

  const handleParseCustomText = (textToParse) => {
    setScreen('scanning');
    setScanProgress(0);
    setLoadingStep(0);
    setCompletedLogs([]);
    setActiveLog('Initiating Regex OCR Mapping Sequence...');

    const parsed = parseRawReportText(textToParse);
    if (!parsed || parsed.biomarkers.length === 0) {
      const defaultParsed = {
        patient_name: 'Anonymous Patient',
        report_date: new Date().toISOString().split('T')[0],
        report_type: 'OCR Mapped Diagnostic Panel',
        overall_risk: 'medium',
        ocr_confidence: 0.94,
        biomarkers: [
          { name: 'Hemoglobin', value: 11.5, unit: 'g/dL', normal_range: '12.0 - 16.0', status: 'warning', affected_organ: 'blood', confidence: 0.96, plain_english: 'Iron transport capability is slightly low.', clinical_term: 'Mild Anemia', icd10_hint: 'D64.9' },
          { name: 'Glucose', value: 155, unit: 'mg/dL', normal_range: '70 - 140', status: 'warning', affected_organ: 'pancreas', confidence: 0.98, plain_english: 'Your fasting blood sugar is elevated. Consider a sugar screening.', clinical_term: 'Impaired Glucose Tolerance', icd10_hint: 'R73.09' }
        ],
        summary_patient: 'MODERATE RISK: Imbalances found in Hemoglobin and Glucose.',
        summary_doctor: 'METABOLIC INSTABILITY: Elevated warning thresholds recorded.',
        action_plan: {
          diet: ['Soluble oat fibers', 'Increase green leafy vegetables', 'Reduce refined sugars'],
          lifestyle: ['Ensure 7.5 hours sleep', 'Aim for 30 minutes walking daily'],
          specialist: 'Primary Care Physician',
          urgency: 'Within 48–72 Hours'
        }
      };
      const analysis = analyzeBiomarkers(defaultParsed.biomarkers);
      const updatedReport = { ...defaultParsed, overall_score: analysis.overallScore, overall_risk: analysis.overallRisk, organScores: analysis.organScores, emergency_flags: analysis.flags };
      setActiveReport(updatedReport);
      setCriticalFlags(analysis.flags);
      setHistoryReports([
        { date: '2025-11-20', biomarkers: { glucose: 98, hemoglobin: 13.5, creatinine: 0.9, sodium: 138 } },
        { date: '2026-02-15', biomarkers: { glucose: 112, hemoglobin: 12.8, creatinine: 1.0, sodium: 137 } },
        { date: updatedReport.report_date, biomarkers: { glucose: 155, hemoglobin: 11.5, creatinine: 1.0, sodium: 137 } }
      ]);
      return;
    }

    const analysis = analyzeBiomarkers(parsed.biomarkers);
    const updatedReport = { ...parsed, overall_score: analysis.overallScore, overall_risk: analysis.overallRisk, organScores: analysis.organScores, emergency_flags: analysis.flags };
    setActiveReport(updatedReport);
    setCriticalFlags(analysis.flags);

    const parsedBms = {};
    updatedReport.biomarkers.forEach(b => { parsedBms[b.name.toLowerCase()] = b.value; });
    if (!parsedBms.glucose) parsedBms.glucose = 95;
    if (!parsedBms.hemoglobin) parsedBms.hemoglobin = 13.8;
    if (!parsedBms.creatinine) parsedBms.creatinine = 0.9;
    if (!parsedBms.sodium) parsedBms.sodium = 140;

    setHistoryReports([
      { date: '2025-11-20', biomarkers: { glucose: parsedBms.glucose * 0.8, hemoglobin: parsedBms.hemoglobin * 1.1, creatinine: parsedBms.creatinine * 0.8, sodium: 139 } },
      { date: '2026-02-15', biomarkers: { glucose: parsedBms.glucose * 0.9, hemoglobin: parsedBms.hemoglobin * 1.05, creatinine: parsedBms.creatinine * 0.9, sodium: 138 } },
      { date: updatedReport.report_date, biomarkers: parsedBms }
    ]);
  };

  /* ── DnD ──────────────────────────────────────────────── */
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDropFile = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) processSelectedFile(files[0]);
  };
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) processSelectedFile(files[0]);
  };
  const processSelectedFile = (file) => {
    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        const n = file.name.toLowerCase();
        if (n.includes('cardiac') || n.includes('troponin')) setInputText(RAW_TEXT_TEMPLATES.cardiac_emergency);
        else if (n.includes('kidney') || n.includes('renal')) setInputText(RAW_TEXT_TEMPLATES.renal_anemia);
        else setInputText(RAW_TEXT_TEMPLATES.lipid_cbc);
      }
    }, 150);
  };

  /* ── Scan simulation ──────────────────────────────────── */
  useEffect(() => {
    if (screen !== 'scanning') return;
    const totalSteps = CINEMATIC_LOADING_STEPS.length;
    let stepIndex = 0;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const next = prev + (100 / totalSteps);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setScreen('analysis');
            if (criticalFlags.length > 0) setShowEmergency(true);
          }, 500);
          return 100;
        }
        stepIndex = Math.floor(next / (100 / totalSteps));
        const prevMsg = CINEMATIC_LOADING_STEPS[stepIndex - 1]?.msg;
        if (prevMsg) setCompletedLogs(logs => [...logs, prevMsg]);
        const curr = CINEMATIC_LOADING_STEPS[stepIndex];
        if (curr) {
          setActiveLog(curr.msg);
          setLoadingStep(stepIndex);
        }
        return next;
      });
    }, 650);
    return () => clearInterval(interval);
  }, [screen, criticalFlags]);

  const currentStep = Math.ceil((scanProgress / 100) * 4);

  /* ══════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen" style={{ color: '#0F172A' }}>

      {/* ── Top ECG strip (always visible) ─────────────── */}
      <div className="ecg-strip" />

      {/* ╔══════════════════════════════════════════════╗
          ║  SCREEN 1 — HOSPITAL INTELLIGENCE LANDING   ║
          ╚══════════════════════════════════════════════╝ */}
      {screen === 'landing' && (
        <div className="flex flex-col min-h-screen hospital-hero-bg">
          <BloodCells />
          <BloodStreaks />
          <FloatingCrosses />
          <DataStreams count={5} />
          <MedicalParticleField />

          {/* Medical grid overlay */}
          <div className="medical-grid-overlay" />

          {/* ── Navigation ─────────────────────────── */}
          <nav className="relative z-10 w-full flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <AnimatedRedCross size={36} pulse spin glow />
              <div>
                <span
                  className="text-xl font-black text-slate-900 block"
                  style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em', lineHeight: 1.1 }}
                >
                  Vitalis <span className="text-gradient-red">AI</span>
                </span>
                <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">
                  Medical Intelligence
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HospitalStatusBadge status="OPERATIONAL" />
              {/* Demo Mode Toggle */}
              <button
                onClick={() => demoMode ? setDemoMode(false) : handleDemoMode()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  demoMode
                    ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-200'
                    : 'bg-white/80 border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600'
                }`}
              >
                <Play className="h-3 w-3" />
                {demoMode ? 'Demo ON' : 'Demo Mode'}
              </button>
            </div>
          </nav>

          {/* ── ECG strip below nav ─────────────────── */}
          <div className="relative z-10 w-full px-6 max-w-7xl mx-auto">
            <ECGStrip color="#DC143C" height={48} />
          </div>

          {/* ── Hero Section ────────────────────────── */}
          <main className="relative z-10 flex-1 flex flex-col items-center px-6 pt-6 pb-16 max-w-6xl mx-auto w-full">

            {/* Large Red Cross + headline */}
            <div className="flex flex-col items-center mb-8 animate-fade-in">
              {/* Hero cross + badge row */}
              <div className="flex items-center gap-4 mb-6">
                <AnimatedRedCross size={72} pulse spin glow />
                <div className="text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                    Emergency Medical AI · Live
                  </div>
                  <h1
                    className="text-5xl sm:text-6xl font-black leading-[1.0]"
                    style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em', color: '#0F172A' }}
                  >
                    Your Medical Reports,
                  </h1>
                  <h1
                    className="text-5xl sm:text-6xl font-black leading-[1.0] mt-1"
                    style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}
                  >
                    <span className="text-gradient-red">Intelligently</span>{' '}
                    <span className="text-gradient-blue">Decoded</span>
                  </h1>
                </div>
              </div>

              <p className="text-base sm:text-lg text-slate-500 text-center max-w-2xl leading-relaxed font-medium mb-2">
                Upload any medical report. In seconds, get extracted biomarkers, organ-level risk analysis,
                trend projections, and clinical action plans in one futuristic hospital dashboard.
              </p>
            </div>

            {/* ── Stats Row (animated) ─────────────── */}
            <div className="grid grid-cols-3 gap-4 max-w-lg w-full mb-10 animate-fade-in">
              {[
                { value: '99', suffix: '%', label: 'OCR Accuracy',  color: '#DC143C' },
                { value: '100', suffix: '%',  label: 'Rule Safety',    color: '#2563EB' },
                { value: '30', prefix: '< ', suffix: 's', label: 'Full Analysis',  color: '#22C55E' },
              ].map((stat, i) => (
                <div key={i} className="glass-card-red rounded-2xl p-4 text-center vitals-glow">
                  <div className="text-2xl font-black mb-1 vitals-counter" style={{ color: stat.color, fontFamily: 'Outfit, sans-serif' }}>
                    {stat.prefix || ''}<StatCounter value={`${stat.value}${stat.suffix}`} />{stat.suffix === '%' ? '' : stat.suffix}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Blood Drop Decorative ──────────────── */}
            <BloodDrops count={6} className="mb-2 w-full max-w-3xl" />

            {/* ── Feature Cards ───────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl w-full mb-10 animate-fade-in">
              {FEATURES.map((f, i) => (
                <div key={i} className="glass-card glass-card-hover rounded-2xl p-4 text-left scan-beam-wrap">
                  <div className="scan-beam" />
                  <div className={`inline-flex p-2 rounded-xl ${f.color} mb-3`}>
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {f.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-snug">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* ── How It Works Section ─────────────────── */}
            <div className="w-full max-w-4xl mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(220,20,60,0.3), transparent)' }} />
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">How It Works</span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(220,20,60,0.3), transparent)' }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { step: '01', icon: '📄', title: 'Upload Report', desc: 'Drop any PDF, image, or paste text' },
                  { step: '02', icon: '🔬', title: 'AI OCR Scan', desc: 'Extract all biomarker values instantly' },
                  { step: '03', icon: '🛡️', title: 'Risk Analysis', desc: 'WHO/ICMR safety rule validation' },
                  { step: '04', icon: '📊', title: 'Dashboard', desc: 'Full intelligence command center' },
                ].map((s, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 text-center relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">{s.step}</div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-snug">{s.desc}</p>
                    {i < 3 && (
                      <ChevronRight className="h-4 w-4 text-red-300 absolute top-1/2 -right-2 -translate-y-1/2 hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Sandbox Selector ────────────────────── */}
            <div className="w-full max-w-4xl animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(220,20,60,0.3), transparent)' }} />
                <div className="flex items-center gap-2">
                  <AnimatedRedCross size={16} pulse={false} glow={false} spin={false} />
                  <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                    Try a Demo Case
                  </span>
                  <AnimatedRedCross size={16} pulse={false} glow={false} spin={false} />
                </div>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(220,20,60,0.3), transparent)' }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {/* Case A: Normal */}
                <button
                  onClick={() => handleLoadReport('normal')}
                  className="glass-card glass-card-hover rounded-2xl p-5 text-left border border-slate-200 hover:border-emerald-200 group transition-all scan-beam-wrap relative overflow-hidden"
                >
                  <div className="scan-beam" style={{ animationDelay: '0s', animationDuration: '4s' }} />
                  <span className="badge-normal mb-3 inline-block">Case A · Optimal</span>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Rahul Sharma (28, Male)
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug mb-3">
                    Baseline physiological check. Complete metabolics and lipids normal.
                  </p>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    Launch Demo <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                {/* Case B: Critical */}
                <button
                  onClick={() => handleLoadReport('critical')}
                  className="glass-card glass-card-hover rounded-2xl p-5 text-left border border-slate-200 hover:border-red-300 group transition-all scan-beam-wrap relative overflow-hidden vitals-glow"
                >
                  <div className="scan-beam" style={{ animationDelay: '1s', animationDuration: '3.5s' }} />
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge-critical">Case B · Critical</span>
                    <AnimatedRedCross size={20} pulse glow spin={false} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Amit Patil (45, Male)
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug mb-3">
                    Cardiac troponin elevation coupled with diabetic metabolic crisis.
                  </p>
                  <span className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                    Launch Demo <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                {/* Case C: Renal */}
                <button
                  onClick={() => handleLoadReport('renal_decline')}
                  className="glass-card glass-card-hover rounded-2xl p-5 text-left border border-slate-200 hover:border-amber-200 group transition-all scan-beam-wrap relative overflow-hidden"
                >
                  <div className="scan-beam" style={{ animationDelay: '2s', animationDuration: '5s' }} />
                  <span className="badge-warning mb-3 inline-block">Case C · Warning</span>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-amber-700 transition-colors mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Savita Dev (62, Female)
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug mb-3">
                    Renal creatinine clearance degradation with progressive anemia.
                  </p>
                  <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                    Launch Demo <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>

              {/* ── Upload & Paste Panel ──────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Drop Zone */}
                <div
                  className={`drop-zone p-6 flex flex-col items-center justify-center min-h-[240px] relative transition-all ${isDragOver ? 'dragover' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDropFile}
                >
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-50 text-red-500 border border-red-100 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full">
                    <Database className="h-2.5 w-2.5" />
                    File Input
                  </div>

                  {!fileName && !isUploading ? (
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-400">
                          <UploadCloud className="h-8 w-8" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                          <AnimatedRedCross size={20} pulse glow spin={false} />
                        </div>
                      </div>
                      <label className="cursor-pointer">
                        <span className="text-sm font-bold text-red-500 hover:text-red-600 hover:underline block">
                          Drag & Drop or Browse
                        </span>
                        <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={handleFileSelect} />
                      </label>
                      <p className="text-[11px] text-slate-400 max-w-[180px] leading-snug">
                        PDF, PNG, JPG or TXT lab reports accepted
                      </p>
                    </div>
                  ) : isUploading ? (
                    <div className="w-full flex flex-col items-center gap-3 text-center">
                      <Activity className="h-8 w-8 text-red-500 animate-pulse" />
                      <span className="text-xs font-semibold text-slate-600">Uploading {fileName}</span>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg, #DC143C, #EF4444)' }}
                        />
                      </div>
                      <span className="text-[11px] font-black text-red-600">{uploadProgress}%</span>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center gap-3 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-700 block truncate max-w-[160px]">{fileName}</span>
                        <span className="badge-normal mt-2 inline-block">OCR Pre-loaded</span>
                      </div>
                      <div className="flex gap-2 w-full mt-1">
                        <button onClick={() => handleParseCustomText(inputText)} className="btn-emergency flex-1 text-xs py-2">
                          <Sparkles className="h-3.5 w-3.5" />
                          Run OCR Analysis
                        </button>
                        <button
                          onClick={() => { setFileName(''); setInputText(''); }}
                          className="p-2 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-400 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Raw Text OCR Panel */}
                <div className="glass-card-red rounded-2xl p-5 flex flex-col min-h-[240px] relative">
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full">
                    <FileJson className="h-2.5 w-2.5" />
                    Live Text OCR
                  </div>
                  <div className="flex justify-end gap-1.5 mt-1 mb-2">
                    {[
                      { label: 'CBC',    key: 'lipid_cbc' },
                      { label: 'Renal',  key: 'renal_anemia' },
                      { label: 'Cardiac', key: 'cardiac_emergency' },
                    ].map(({ label, key }) => (
                      <button
                        key={key}
                        onClick={() => setInputText(RAW_TEXT_TEMPLATES[key])}
                        className="text-[10px] font-bold px-2.5 py-1 bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-lg transition-all"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste raw report text here, or click a template above…"
                    className="medical-input flex-1 font-mono text-[11px] resize-none min-h-[130px]"
                  />
                  <button onClick={() => handleParseCustomText(inputText)} className="btn-emergency w-full mt-3 text-xs py-2.5">
                    <Cpu className="h-3.5 w-3.5" />
                    Analyze Report Text
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* ── Footer with ECG ─────────────────────── */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
            <ECGStrip color="rgba(220,20,60,0.4)" height={32} />
          </div>
          <footer className="relative z-10 w-full border-t border-red-50 py-5 px-6 text-center bg-white/60">
            <p className="text-xs text-slate-400 font-medium">
              Vitalis AI · Hospital Intelligence Command Center · WHO/ICMR Safety Standards · 2026
            </p>
          </footer>
        </div>
      )}

      {/* ╔══════════════════════════════════════════════╗
          ║  SCREEN 2 — MEDICAL SCANNING TERMINAL       ║
          ╚══════════════════════════════════════════════╝ */}
      {screen === 'scanning' && (
        <div
          className="flex flex-col items-center justify-center min-h-screen px-6 py-16 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #fff5f5 0%, #F8FBFF 50%, #FFF 100%)' }}
        >
          <BloodCells />
          <FloatingCrosses />
          <DataStreams count={4} />

          <div className="w-full max-w-md relative z-10 animate-scale-in">

            {/* Large cross above card */}
            <div className="flex justify-center mb-6">
              <AnimatedRedCross size={64} pulse spin glow />
            </div>

            {/* Header Card */}
            <div className="glass-card-red rounded-3xl p-8 text-center mb-4">
              <HospitalStatusBadge status="SCANNING" className="mb-4 mx-auto" />

              <h2 className="text-2xl font-black text-slate-800 mb-1.5" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
                Analysing Your Report
              </h2>
              <p className="text-sm text-slate-400 font-medium mb-4">
                Vitalis Hospital AI Pipeline Running
              </p>

              {/* ECG in scanning */}
              <ECGStrip color="#DC143C" height={44} className="mb-5" />

              {/* Step Indicators */}
              <div className="flex items-center justify-between mb-5 px-1">
                {PROCESS_STEPS.map((step, i) => {
                  const stepNum = i + 1;
                  const isDone   = stepNum < currentStep;
                  const isActive = stepNum === currentStep;
                  return (
                    <React.Fragment key={step.id}>
                      <div className="flex flex-col items-center gap-1">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                          isDone ? 'step-complete' : isActive ? 'step-active' : 'step-pending'
                        }`}>
                          {isDone
                            ? <CheckCircle className="h-4 w-4" />
                            : isActive
                              ? <AnimatedRedCross size={16} pulse={false} glow={false} spin={false} />
                              : step.icon
                          }
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-wide ${
                          isDone ? 'text-emerald-600' : isActive ? 'text-red-500' : 'text-slate-300'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {i < PROCESS_STEPS.length - 1 && (
                        <div className={`flex-1 h-px mx-1.5 mb-5 transition-all ${isDone ? 'bg-emerald-300' : isActive ? 'bg-red-200' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${scanProgress}%`,
                    background: 'linear-gradient(90deg, #DC143C 0%, #EF4444 50%, #2563EB 100%)',
                    boxShadow: '0 0 8px rgba(220,20,60,0.4)',
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>Processing…</span>
                <span className="text-red-500 font-black vitals-counter">{Math.round(scanProgress)}%</span>
              </div>
            </div>

            {/* Log Terminal */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Processing Log</span>
              </div>
              <div
                className="font-mono text-[10px] h-40 overflow-y-auto flex flex-col gap-1.5 rounded-xl p-3 border"
                style={{ background: '#FFF8F8', borderColor: 'rgba(220,20,60,0.08)' }}
              >
                {completedLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-emerald-600">
                    <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{log}</span>
                  </div>
                ))}
                {activeLog && (
                  <div className="flex items-start gap-2 text-red-500 animate-pulse">
                    <Cpu className="h-3 w-3 mt-0.5 shrink-0 animate-spin" />
                    <span>{activeLog}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ╔══════════════════════════════════════════════╗
          ║  SCREEN 3 — CLINICAL DASHBOARD              ║
          ╚══════════════════════════════════════════════╝ */}
      {screen === 'analysis' && activeReport && (
        <div
          className={`min-h-screen flex flex-col transition-all duration-700 ${dashboardVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'linear-gradient(160deg, #FFF8F8 0%, #F0F6FF 60%, #EFF6FF 100%)' }}
        >

          {/* ── Dashboard Header ────────────────────── */}
          <header className="bg-white/90 backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-20"
            style={{ borderColor: 'rgba(220,20,60,0.12)' }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setScreen('landing'); setSelectedOrgan(null); setDashboardVisible(false); }}
                className="text-xs font-semibold text-slate-500 hover:text-red-500 flex items-center gap-1.5 transition-colors"
              >
                ← Back
              </button>
              <div className="flex items-center gap-2">
                <AnimatedRedCross size={28} pulse glow spin={false} />
                <span className="text-sm font-black text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Vitalis <span className="text-gradient-red">AI</span>
                </span>
              </div>
            </div>

            {/* Patient + Risk */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">{activeReport.patient_name}</span>
              {activeReport.overall_risk === 'critical' && (
                <span className="badge-critical">
                  <span className="pulse-dot" style={{ width: 6, height: 6 }} /> Critical
                </span>
              )}
              {activeReport.overall_risk === 'high' && <span className="badge-critical">High Risk</span>}
              {activeReport.overall_risk === 'medium' && <span className="badge-warning">Warning</span>}
              {(activeReport.overall_risk === 'normal' || activeReport.overall_risk === 'low') && <span className="badge-normal">Normal</span>}
              {demoMode && showDemoBanner && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-100 border border-violet-200 text-violet-700">
                  Demo Mode
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {['command', 'insights', 'trends'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  style={activeTab === tab ? { color: '#DC143C' } : {}}
                >
                  {tab === 'command' ? '📊 Analysis' : tab === 'insights' ? '🧠 AI Insights' : '📈 Trends'}
                </button>
              ))}
            </div>
          </header>

          {/* ECG bar below header */}
          <ECGStrip color="rgba(220,20,60,0.5)" height={28} />

          {/* Main Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full">
            <div className="lg:col-span-4 h-fit lg:sticky lg:top-[88px]">
              <AnatomicalVisualizer
                organScores={activeReport.organScores}
                activeOrgan={selectedOrgan}
                onSelectOrgan={setSelectedOrgan}
                overallRisk={activeReport.overall_risk}
              />
            </div>
            <div className="lg:col-span-8 flex flex-col gap-6">
              {activeTab === 'command' ? (
                <RiskDashboard
                  reportData={activeReport}
                  selectedOrgan={selectedOrgan}
                  onSelectOrgan={setSelectedOrgan}
                  onPrintPlan={() => setScreen('print')}
                  onShowTrends={() => setActiveTab('trends')}
                />
              ) : activeTab === 'insights' ? (
                <AIInsightPanel reportData={activeReport} />
              ) : (
                <TrendAnalysis historicalData={historyReports} />
              )}
            </div>
          </div>

          {showEmergency && criticalFlags.length > 0 && (
            <EmergencyAlert flags={criticalFlags} onClose={() => setShowEmergency(false)} />
          )}
        </div>
      )}

      {/* ╔══════════════════════════════════════════════╗
          ║  SCREEN 4 — PRINT ACTION PLAN               ║
          ╚══════════════════════════════════════════════╝ */}
      {screen === 'print' && activeReport && (
        <div className="min-h-screen bg-slate-50 p-6">
          <PrintableActionPlan reportData={activeReport} onBack={() => setScreen('analysis')} />
        </div>
      )}
    </div>
  );
}
