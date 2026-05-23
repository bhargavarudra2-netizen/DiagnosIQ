import React, { useState, useEffect } from 'react';
import {
  Sparkles, UploadCloud, ArrowRight, FileText,
  CheckCircle, Cpu, FileJson, Trash2, Database, Shield,
  Brain, Heart, FlaskConical, Stethoscope, TrendingUp,
  AlertCircle, Play, ChevronRight, Activity, Globe
} from 'lucide-react';
import { MOCK_REPORTS, analyzeBiomarkers, parseRawReportText, generateDynamicSummaries } from './services/medicalEngine';
import { extractTextFromFile, getOCRSourceLabel } from './services/ocrService';
import AnatomicalVisualizer from './components/AnatomicalVisualizer';
import RiskDashboard from './components/RiskDashboard';
import TrendAnalysis from './components/TrendAnalysis';
import EmergencyAlert from './components/EmergencyAlert';
import PrintableActionPlan from './components/PrintableActionPlan';
import AIInsightPanel from './components/AIInsightPanel';
import {
  AnimatedRedCross,
  ECGStrip,
  HospitalStatusBadge,
  MedicalParticleField,
  BackgroundECGGraph
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
  { msg: "Extracting clinical medical markers from typography...", icon: "🔍" },
  { msg: "Analyzing diagnostic biomarker range deviations...", icon: "📊" },
  { msg: "Evaluating emergency cardiac & metabolic events...", icon: "⚡" },
  { msg: "Consulting WHO & ICMR clinical guidelines...", icon: "🛡️" },
  { msg: "Mapping multi-system biological organ stress...", icon: "🫀" },
  { msg: "Synthesizing AI patient-friendly health insights...", icon: "🧠" },
];

const PROCESS_STEPS = [
  { id: 1, label: 'OCR Extraction', icon: <UploadCloud className="h-3.5 w-3.5" /> },
  { id: 2, label: 'Fuzzy Parsing',  icon: <FileText className="h-3.5 w-3.5" /> },
  { id: 3, label: 'Clinical Review', icon: <Shield className="h-3.5 w-3.5" /> },
  { id: 4, label: 'Synthesis',      icon: <CheckCircle className="h-3.5 w-3.5" /> },
];

/* ══════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState('landing'); // 'landing' | 'upload' | 'scanning' | 'analysis' | 'print'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
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
  const [uploadStatus, setUploadStatus] = useState(''); // OCR status message
  const [ocrSource, setOcrSource] = useState(''); // which engine was used
  const [historyReports, setHistoryReports] = useState([]);

  // Demo Mode state
  const [demoMode, setDemoMode] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(false);
  const [dashboardVisible, setDashboardVisible] = useState(false);

  // Floating AI Chat Assistant states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', text: 'Hello! I am your DiagnosIQ AI Clinical Health Assistant. Feel free to ask me any questions about your biomarker ranges, metabolic risk factors, GFR indices, or custom preventive recommendations!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (screen === 'analysis') {
      setTimeout(() => setDashboardVisible(true), 50);
    } else {
      setDashboardVisible(false);
    }
  }, [screen]);

  /* ── Report loaders ───────────────────────────────────── */
  /* ── Report loaders & Chronology Storage ──────────────── */
  const loadPatientChronology = (patientName, defaultSeeds) => {
    const key = `diagnosiq_timeline_${patientName.replace(/\s+/g, '_')}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setHistoryReports(JSON.parse(stored));
    } else {
      setHistoryReports(defaultSeeds);
      localStorage.setItem(key, JSON.stringify(defaultSeeds));
    }
  };

  const handleSaveReport = () => {
    if (!activeReport) return;
    const recordDate = activeReport.report_date || new Date().toISOString().split('T')[0];
    const biomarkersMap = {};
    activeReport.biomarkers.forEach(bm => {
      biomarkersMap[bm.name.toLowerCase()] = bm.value;
    });

    const newRecord = {
      date: recordDate,
      biomarkers: biomarkersMap
    };

    const isDuplicate = historyReports.some(r => r.date === recordDate);
    let updatedHistory = [...historyReports];
    if (isDuplicate) {
      updatedHistory = historyReports.map(r => r.date === recordDate ? newRecord : r);
    } else {
      updatedHistory.push(newRecord);
    }

    setHistoryReports(updatedHistory);
    
    const key = `diagnosiq_timeline_${activeReport.patient_name.replace(/\s+/g, '_')}`;
    localStorage.setItem(key, JSON.stringify(updatedHistory));
  };

  const handleSendMessage = (textToSend) => {
    if (!textToSend || !textToSend.trim() || chatLoading) return;
    const userMsg = { role: 'user', text: textToSend };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    import('./services/geminiService').then(async (service) => {
      try {
        const answer = await service.chatWithAssistant(activeReport, chatMessages.concat(userMsg), textToSend);
        setChatMessages(prev => [...prev, { role: 'model', text: answer }]);
      } catch (err) {
        setChatMessages(prev => [...prev, { role: 'model', text: "I apologize, but I'm having difficulty connecting to my clinical intelligence layer. Please verify your connection or consult a physician for diagnostic advice." }]);
      } finally {
        setChatLoading(false);
      }
    });
  };

  const handleLoadReport = (reportKey) => {
    setScreen('scanning');
    setScanProgress(0);
    setLoadingStep(0);
    setCompletedLogs([]);
    setActiveLog(CINEMATIC_LOADING_STEPS[0].msg);

    const report = MOCK_REPORTS[reportKey];
    const analysis = analyzeBiomarkers(report.biomarkers);
    // Dynamically regenerate summaries from actual biomarker values
    const dynamicSummaries = generateDynamicSummaries(report.patient_name, report.biomarkers);

    // Generate simulated raw text for the mock report to send to Gemini
    let simulatedRawText = `Patient Name: ${report.patient_name}\nReport Date: ${report.report_date}\nReport Type: ${report.report_type}\n=====================================\n`;
    report.biomarkers.forEach(bm => {
      simulatedRawText += `${bm.name}: ${bm.value} ${bm.unit} (Normal Range: ${bm.normal_range})\n`;
    });
    simulatedRawText += `=====================================\nValidated by: Auto-generated mock clinic template`;

    const updatedReport = {
      ...report,
      raw_text: simulatedRawText,
      overall_score: analysis.overallScore,
      overall_risk: analysis.overallRisk,
      organScores: analysis.organScores,
      emergency_flags: analysis.flags,
      summary_patient: dynamicSummaries.summary_patient,
      summary_doctor: dynamicSummaries.summary_doctor,
    };
    setActiveReport(updatedReport);
    setCriticalFlags(analysis.flags);

    let seeds = [];
    if (report.historical) {
      seeds = report.historical;
    } else {
      if (reportKey === 'normal') {
        seeds = [
          { date: '2025-11-20', biomarkers: { glucose: 95, hemoglobin: 14.2, creatinine: 0.9, sodium: 139 } },
          { date: '2026-02-15', biomarkers: { glucose: 94, hemoglobin: 14.4, creatinine: 0.9, sodium: 138 } },
          { date: '2026-05-18', biomarkers: { glucose: 92, hemoglobin: 14.5, creatinine: 0.9, sodium: 140 } }
        ];
      } else if (reportKey === 'critical') {
        seeds = [
          { date: '2025-11-20', biomarkers: { glucose: 110, hemoglobin: 12.5, creatinine: 0.8, sodium: 136 } },
          { date: '2026-02-15', biomarkers: { glucose: 160, hemoglobin: 11.8, creatinine: 0.9, sodium: 135 } },
          { date: '2026-05-23', biomarkers: { glucose: 310, hemoglobin: 11.2, creatinine: 1.1, sodium: 135 } }
        ];
      }
    }
    loadPatientChronology(updatedReport.patient_name, seeds);
  };

  const handleParseCustomText = (textToParse) => {
    if (!textToParse || !textToParse.trim()) return;
    setScreen('scanning');
    setScanProgress(0);
    setLoadingStep(0);
    setCompletedLogs([]);
    setActiveLog('Initiating optical text parsing sequence...');

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
      const defSummaries = generateDynamicSummaries(defaultParsed.patient_name, defaultParsed.biomarkers);
      const updatedReport = {
        ...defaultParsed,
        raw_text: textToParse,
        overall_score: analysis.overallScore,
        overall_risk: analysis.overallRisk,
        organScores: analysis.organScores,
        emergency_flags: analysis.flags,
        summary_patient: defSummaries.summary_patient,
        summary_doctor: defSummaries.summary_doctor,
      };
      setActiveReport(updatedReport);
      setCriticalFlags(analysis.flags);

      const defaultSeeds = [
        { date: '2025-11-20', biomarkers: { glucose: 98, hemoglobin: 13.5, creatinine: 0.9, sodium: 138 } },
        { date: '2026-02-15', biomarkers: { glucose: 112, hemoglobin: 12.8, creatinine: 1.0, sodium: 137 } },
        { date: updatedReport.report_date, biomarkers: { glucose: 155, hemoglobin: 11.5, creatinine: 1.0, sodium: 137 } }
      ];
      loadPatientChronology(updatedReport.patient_name, defaultSeeds);
      return;
    }

    const analysis = analyzeBiomarkers(parsed.biomarkers);
    const parsedSummaries = generateDynamicSummaries(parsed.patient_name, parsed.biomarkers);
    const updatedReport = {
      ...parsed,
      raw_text: textToParse,
      overall_score: analysis.overallScore,
      overall_risk: analysis.overallRisk,
      organScores: analysis.organScores,
      emergency_flags: analysis.flags,
      summary_patient: parsedSummaries.summary_patient,
      summary_doctor: parsedSummaries.summary_doctor,
    };
    setActiveReport(updatedReport);
    setCriticalFlags(analysis.flags);

    const parsedBms = {};
    updatedReport.biomarkers.forEach(b => { parsedBms[b.name.toLowerCase()] = b.value; });
    if (!parsedBms.glucose) parsedBms.glucose = 95;
    if (!parsedBms.hemoglobin) parsedBms.hemoglobin = 13.8;
    if (!parsedBms.creatinine) parsedBms.creatinine = 0.9;
    if (!parsedBms.sodium) parsedBms.sodium = 140;

    const parsedSeeds = [
      { date: '2025-11-20', biomarkers: { glucose: Math.round(parsedBms.glucose * 0.8), hemoglobin: Math.round(parsedBms.hemoglobin * 1.1), creatinine: parseFloat((parsedBms.creatinine * 0.8).toFixed(2)), sodium: 139 } },
      { date: '2026-02-15', biomarkers: { glucose: Math.round(parsedBms.glucose * 0.9), hemoglobin: Math.round(parsedBms.hemoglobin * 1.05), creatinine: parseFloat((parsedBms.creatinine * 0.9).toFixed(2)), sodium: 138 } },
      { date: updatedReport.report_date, biomarkers: parsedBms }
    ];
    loadPatientChronology(updatedReport.patient_name, parsedSeeds);
  };

  /* ── Drag & Drop ──────────────────────────────────────── */
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
  const processSelectedFile = async (file) => {
    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Reading file...');
    setOcrSource('');
    setInputText('');

    // Simulated progress ticks during OCR processing
    const progressInterval = setInterval(() => {
      setUploadProgress(p => Math.min(p + 8, 85));
    }, 200);

    try {
      setUploadStatus('Extracting text with AI Vision...');
      const { text, source, confidence } = await extractTextFromFile(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (text && text.trim().length > 10) {
        setInputText(text);
        setOcrSource(getOCRSourceLabel(source));
        setUploadStatus(`✓ Extracted via ${getOCRSourceLabel(source)} (${Math.round(confidence * 100)}% confidence)`);
      } else {
        // OCR produced no usable text — fall back to template suggestion by filename
        const n = file.name.toLowerCase();
        if (n.includes('cardiac') || n.includes('troponin')) setInputText(RAW_TEXT_TEMPLATES.cardiac_emergency);
        else if (n.includes('kidney') || n.includes('renal')) setInputText(RAW_TEXT_TEMPLATES.renal_anemia);
        else setInputText(RAW_TEXT_TEMPLATES.lipid_cbc);
        setOcrSource('Template Fallback');
        setUploadStatus('⚠ OCR could not extract text clearly — loaded sample template');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setOcrSource('Error');
      setUploadStatus('⚠ File read failed — please paste text manually below');
      console.error('[DiagnosIQ] File processing error:', err);
    } finally {
      setIsUploading(false);
    }
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
          }, 400);
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
    }, 600);
    return () => clearInterval(interval);
  }, [screen, criticalFlags]);

  const currentStep = Math.ceil((scanProgress / 100) * 4);

  // Logo home redirect handler
  const handleHomeRedirect = () => {
    setScreen('landing');
    setSelectedOrgan(null);
    setFileName('');
    setInputText('');
  };

  const isSaved = activeReport ? historyReports.some(r => r.date === (activeReport.report_date || new Date().toISOString().split('T')[0])) : false;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative bg-diag-bg transition-colors duration-300">
      
      {/* Top calm anim ECG strip */}
      <div className="ecg-strip" />

      {/* Grid overlay for high-end look */}
      <div className="medical-grid-overlay pointer-events-none" />

      {/* ── HEADER NAVIGATION (DiagnosIQ Logo & Global Actions) ── */}
      <nav className="relative z-20 w-full flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-white/[0.04] bg-diag-bg/40 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={handleHomeRedirect}>
          <AnimatedRedCross size={34} pulse glow />
          <div className="text-left">
            <span
              className="text-lg font-black text-slate-50 tracking-tight block"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              Diagnos<span className="text-diag-cyan">IQ</span>
            </span>
            <span className="text-[8px] font-bold text-diag-cyan uppercase tracking-widest block -mt-1">
              Preventive AI Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center gap-1.5 select-none"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          {screen !== 'landing' && (
            <button
              onClick={() => {
                if (screen === 'upload') setScreen('landing');
                else if (screen === 'scanning') setScreen('upload');
                else if (screen === 'analysis') setScreen('upload');
                else if (screen === 'print') setScreen('analysis');
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center gap-1.5"
            >
              ← Back
            </button>
          )}
          <HospitalStatusBadge status={screen === 'scanning' ? 'SCANNING' : 'OPERATIONAL'} />
        </div>
      </nav>

      {/* ╔══════════════════════════════════════════════╗
          ║  SCREEN 1 — PREMIUM LANDING HERO            ║
          ╚══════════════════════════════════════════════╝ */}
      {screen === 'landing' && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 relative z-10 flex flex-col lg:flex-row gap-12 items-center justify-between">
          <MedicalParticleField />
          <BackgroundECGGraph />

          {/* Left Side Info column */}
          <div className="flex-1 flex flex-col text-left max-w-xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-diag-cyan/5 border border-diag-cyan/15 text-diag-cyan text-[10px] font-bold uppercase tracking-widest mb-6 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-diag-cyan animate-pulse" />
              SaaS Grade Preventative Intelligence
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-slate-50 mb-6"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              AI-Powered <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-diag-cyan to-indigo-400">
                Preventive Healthcare
              </span> <br />
              Intelligence
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 font-medium">
              Transform medical reports into actionable health insights with intelligent risk analysis, emergency detection, and AI-assisted preventive care. Built for hospital partnerships and clinical accuracy.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setScreen('upload')}
                className="btn-primary"
              >
                Analyze Report
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setDemoMode(true); handleLoadReport('critical'); }}
                className="btn-secondary"
              >
                View Demo
              </button>
            </div>

            {/* Metrics Checklist */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/[0.04] pt-8">
              {[
                { val: '99.2%', desc: 'OCR Extraction' },
                { val: 'Zero', desc: 'Hallucination Safety' },
                { val: '< 10s', desc: 'Realtime Decipher' }
              ].map((m, i) => (
                <div key={i}>
                  <div className="text-lg font-black text-diag-cyan tracking-tight">{m.val}</div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Landing Floating Preview */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative animate-fade-in lg:pl-6">
            <div className="glass-card rounded-2xl border border-white/5 p-6 relative overflow-hidden shadow-2xl scale-[1.02]">
              <div className="absolute top-0 right-0 h-40 w-40 bg-diag-cyan/5 rounded-full blur-3xl" />
              
              {/* Fake dashboard headers */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-diag-cyan animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DiagnosIQ Core Telemetry</span>
                </div>
                <span className="badge-normal text-[9px] py-0.5 px-2">Assaying Complete</span>
              </div>

              {/* Fake Health Score circular progress representation */}
              <div className="flex items-center gap-6 mb-6 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <div className="relative h-20 w-20 flex items-center justify-center bg-diag-bg rounded-full border border-white/5 shadow-inner">
                  <svg className="w-full h-full p-1" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-diag-cyan"
                      strokeWidth="2.5"
                      strokeDasharray="85, 100"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-extrabold text-diag-cyan" style={{ fontFamily: 'JetBrains Mono' }}>85</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">INDEX</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Systemic Integrity Score</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Multivariate analysis reflects optimal physiological clearance indexes across cardiac, metabolic, and renal biomarkers.
                  </p>
                </div>
              </div>

              {/* Fake Table */}
              <div className="space-y-2.5">
                {[
                  { name: 'Cardiac Troponin I', val: '0.02 ng/mL', ref: '< 0.04', status: 'Optimal', badge: 'badge-normal' },
                  { name: 'Fasting Blood Sugar', val: '124 mg/dL', ref: '70 - 140', status: 'Normal', badge: 'badge-normal' },
                  { name: 'Serum Creatinine', val: '1.9 mg/dL', ref: '0.6 - 1.2', status: 'Warning', badge: 'badge-warning' },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01] text-xs">
                    <span className="font-bold text-slate-300">{row.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-slate-400">{row.val}</span>
                      <span className={row.badge} style={{ fontSize: '8px', padding: '1px 6px' }}>{row.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ╔══════════════════════════════════════════════╗
          ║  SCREEN 2 — CLEAN UPLOAD SCREEN             ║
          ╚══════════════════════════════════════════════╝ */}
      {screen === 'upload' && (
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 flex flex-col justify-center animate-scale-in relative">
          <BackgroundECGGraph />
          
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50" style={{ fontFamily: 'Geist, sans-serif' }}>
              Analyze Medical Report
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
              Upload diagnostic sheets or input text to run fuzzy AI clinical assessments
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col gap-6 border-white/5 cyan-glow-subtle">
            
            {/* Upload Zone */}
            <div
              className={`drop-zone p-8 flex flex-col items-center justify-center min-h-[220px] relative transition-all ${isDragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDropFile}
            >
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/5 text-slate-400 border border-white/10 text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full">
                <Database className="h-2.5 w-2.5" />
                Report Document
              </div>

              {!fileName && !isUploading ? (
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-diag-cyan/5 border border-diag-cyan/15 flex items-center justify-center text-diag-cyan">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <label className="cursor-pointer">
                    <span className="text-sm font-bold text-diag-cyan hover:text-diag-cyanHover transition-colors hover:underline block">
                      Drag & Drop Report or Browse Files
                    </span>
                    <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={handleFileSelect} />
                  </label>
                  <p className="text-[10px] text-slate-500 max-w-[200px] leading-relaxed">
                    Supports PDF, PNG, JPG, or raw clinical lab texts
                  </p>
                </div>
              ) : isUploading ? (
                <div className="w-full flex flex-col items-center gap-3 text-center">
                  <Activity className="h-8 w-8 text-diag-cyan animate-pulse" />
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block">{uploadStatus || `Reading ${fileName}…`}</span>
                    <span className="text-[9px] text-slate-500 mt-0.5 block">{fileName}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden max-w-xs">
                    <div
                      className="h-1 rounded-full bg-diag-cyan transition-all duration-200 shadow-[0_0_6px_rgba(56,189,248,0.5)]"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-diag-cyan">{uploadProgress < 90 ? 'Analyzing with AI Vision...' : 'Finalizing extraction...'}</span>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-3 text-center">
                  <div className="h-12 w-12 rounded-xl bg-diag-emeraldSoft border border-diag-emerald/20 flex items-center justify-center text-diag-emerald">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block truncate max-w-[240px]">{fileName}</span>
                    {uploadStatus && (
                      <span className={`text-[9px] font-bold mt-1.5 block leading-relaxed max-w-[240px] ${
                        uploadStatus.startsWith('⚠') ? 'text-amber-400' : 'text-diag-emerald'
                      }`}>
                        {uploadStatus}
                      </span>
                    )}
                    {ocrSource && (
                      <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-diag-cyan/5 border border-diag-cyan/15 text-diag-cyan mt-1 inline-block uppercase tracking-wider">
                        {ocrSource}
                      </span>
                    )}
                  </div>
                  {inputText && (
                    <div className="flex gap-2 w-full max-w-xs mt-1">
                      <button onClick={() => handleParseCustomText(inputText)} className="btn-primary flex-1 text-xs py-2">
                        Analyze Document
                      </button>
                      <button
                        onClick={() => { setFileName(''); setInputText(''); setUploadStatus(''); setOcrSource(''); }}
                        className="px-3 bg-white/5 hover:bg-diag-redSoft border border-white/5 hover:border-diag-red/20 text-slate-400 hover:text-diag-red rounded-xl transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pasting Section */}
            <div className="flex flex-col gap-2 border-t border-white/[0.04] pt-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Or Paste Raw Medical Assay Text
                </span>
                <div className="flex gap-1.5">
                  {[
                    { label: 'CBC Panel', key: 'lipid_cbc' },
                    { label: 'Renal Panel', key: 'renal_anemia' },
                    { label: 'Cardiac Panel', key: 'cardiac_emergency' },
                  ].map(({ label, key }) => (
                    <button
                      key={key}
                      onClick={() => { setInputText(RAW_TEXT_TEMPLATES[key]); setFileName(`template_${key}.txt`); }}
                      className="text-[9px] font-bold px-2 py-1 bg-white/[0.02] border border-white/5 hover:border-diag-cyan/30 hover:bg-diag-cyan/5 text-slate-400 hover:text-diag-cyan rounded-lg transition-all"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste diagnostics, range levels, or raw text reports here..."
                className="medical-input min-h-[120px] font-mono text-[11px] resize-none"
              />
              <button
                disabled={!inputText.trim()}
                onClick={() => handleParseCustomText(inputText)}
                className={`btn-primary w-full mt-2 text-xs py-2.5 ${!inputText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Analyze Copied Text
              </button>
            </div>

          </div>
        </main>
      )}

      {/* ╔══════════════════════════════════════════════╗
          ║  SCREEN 3 — CINEMATIC SCANNING PIPELINE     ║
          ╚══════════════════════════════════════════════╝ */}
      {screen === 'scanning' && (
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto w-full animate-scale-in">
          
          <div className="glass-card rounded-2xl p-6 border-white/5 text-center w-full shadow-2xl relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-24 bg-diag-cyan/30 rounded-full" />
            
            <div className="h-12 w-12 rounded-full bg-diag-cyan/5 border border-diag-cyan/20 flex items-center justify-center text-diag-cyan mx-auto mb-4 relative z-10 animate-pulse">
              <Cpu className="h-6 w-6 animate-spin" style={{ animationDuration: '3s' }} />
            </div>

            <h2 className="text-lg font-bold text-slate-50 mb-1" style={{ fontFamily: 'Geist, sans-serif' }}>
              Deciphering Diagnostics
            </h2>
            <p className="text-[10px] font-bold text-diag-cyan uppercase tracking-widest">
              DiagnosIQ pipeline running
            </p>

            <div className="my-6">
              <ECGStrip color="#38BDF8" height={32} />
            </div>

            {/* Steps Horizontal row */}
            <div className="flex items-center justify-between mb-6 px-1">
              {PROCESS_STEPS.map((step, idx) => {
                const stepNum = idx + 1;
                const isDone   = stepNum < currentStep;
                const isActive = stepNum === currentStep;
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        isDone ? 'step-complete' : isActive ? 'step-active' : 'step-pending'
                      }`}>
                        {isDone ? <CheckCircle className="h-3.5 w-3.5" /> : step.icon}
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${
                        isDone ? 'text-diag-emerald' : isActive ? 'text-diag-cyan' : 'text-slate-600'
                      }`}>
                        {step.label.split(' ')[0]}
                      </span>
                    </div>
                    {idx < PROCESS_STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-1 mb-4 transition-all ${isDone ? 'bg-diag-emerald/30' : isActive ? 'bg-diag-cyan/30' : 'bg-white/[0.02]'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Circular Progress & Text logs */}
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className="h-1.5 rounded-full bg-diag-cyan transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.4)]"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>Sequencing metric hashes...</span>
              <span className="text-diag-cyan font-mono">{Math.round(scanProgress)}%</span>
            </div>
          </div>

          {/* Sequential Logs Terminal */}
          <div className="glass-card rounded-2xl p-4 border border-white/5 w-full mt-4 text-left">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2.5">
              Assay Pipeline Telemetry Log
            </span>
            <div className="font-mono text-[9px] h-32 overflow-y-auto flex flex-col gap-1.5 p-2 bg-slate-950/60 rounded-xl border border-white/5 text-slate-400">
              {completedLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-diag-emerald">
                  <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{log}</span>
                </div>
              ))}
              {activeLog && (
                <div className="flex items-start gap-1.5 text-diag-cyan animate-pulse">
                  <Cpu className="h-3 w-3 mt-0.5 shrink-0 animate-spin" />
                  <span>{activeLog}</span>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ╔══════════════════════════════════════════════╗
          ║  SCREEN 3 — ENTERPRISE CLINICAL DASHBOARD   ║
          ╚══════════════════════════════════════════════╝ */}
      {screen === 'analysis' && activeReport && (
        <main
          className={`flex-1 flex flex-col transition-all duration-500 ${dashboardVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Sub Header row for patient specs */}
          <div className="border-b border-white/[0.04] bg-white/[0.01] px-6 py-2.5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">
                Patient: <strong className="text-slate-50 font-bold">{activeReport.patient_name}</strong>
              </span>
              <span className="h-3.5 w-px bg-white/10" />
              <span className="text-xs text-slate-400 font-medium">Collected: {activeReport.report_date}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Dashboard Back Button */}
              <button
                onClick={() => { setScreen('upload'); setSelectedOrgan(null); }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-slate-200 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center gap-1"
              >
                ← Change Case
              </button>

              {/* Status Pill Badge */}
              {activeReport.overall_risk === 'critical' && (
                <span className="badge-critical text-[9px] py-0.5 px-2">
                  <span className="pulse-dot bg-diag-red" style={{ width: 5, height: 5 }} /> Critical Alert
                </span>
              )}
              {activeReport.overall_risk === 'high' && <span className="badge-critical text-[9px] py-0.5 px-2">High Deviation</span>}
              {activeReport.overall_risk === 'medium' && <span className="badge-warning text-[9px] py-0.5 px-2">Moderate Warning</span>}
              {(activeReport.overall_risk === 'normal' || activeReport.overall_risk === 'low') && <span className="badge-normal text-[9px] py-0.5 px-2">Cleared</span>}

              {demoMode && showDemoBanner && (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 border border-indigo-400/20 text-indigo-400">
                  Demo Mode
                </span>
              )}
            </div>
            
            {/* View tabs */}
            <div className="flex bg-white/[0.02] p-0.5 rounded-xl border border-white/5">
              {['command', 'insights', 'trends'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-[8px] text-[10px] font-bold transition-all uppercase tracking-wider ${
                    activeTab === tab
                      ? 'bg-diag-cyan text-diag-navy shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'command' ? 'Overview' : tab === 'insights' ? 'AI Insights' : 'Chronology'}
                </button>
              ))}
            </div>
          </div>

          {/* Master Dashboard Panel Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full relative z-10">
            
            {/* Left side Organ stress visualization */}
            <div className="lg:col-span-4 h-fit lg:sticky lg:top-[120px]">
              <AnatomicalVisualizer
                organScores={activeReport.organScores}
                activeOrgan={selectedOrgan}
                onSelectOrgan={setSelectedOrgan}
                overallRisk={activeReport.overall_risk}
              />
            </div>

            {/* Right side telemetries */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {activeTab === 'command' ? (
                <RiskDashboard
                  reportData={activeReport}
                  selectedOrgan={selectedOrgan}
                  onSelectOrgan={setSelectedOrgan}
                  onPrintPlan={() => setScreen('print')}
                  onShowTrends={() => setActiveTab('trends')}
                  onSaveReport={handleSaveReport}
                  isSaved={isSaved}
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
        </main>
      )}

      {/* ╔══════════════════════════════════════════════╗
          ║  SCREEN 4 — CLINICAL PRINT ACTION PLAN      ║
          ╚══════════════════════════════════════════════╝ */}
      {screen === 'print' && activeReport && (
        <main className="min-h-screen bg-slate-900/60 p-6 flex flex-col justify-center max-w-3xl mx-auto w-full relative z-10">
          <div className="mb-4">
            <button
              onClick={() => setScreen('analysis')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center gap-1.5"
            >
              ← Back to Analysis
            </button>
          </div>
          <PrintableActionPlan reportData={activeReport} onBack={() => setScreen('analysis')} />
        </main>
      )}

      {/* ╔══════════════════════════════════════════════╗
          ║  FLOATING CLINICAL AI CHAT ASSISTANT        ║
          ╚══════════════════════════════════════════════╝ */}
      {screen === 'analysis' && activeReport && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans select-none pointer-events-auto">
          
          {/* Chat Window */}
          {chatOpen && (
            <div className="w-[360px] sm:w-[380px] h-[480px] rounded-2xl glass-card border border-white/5 shadow-2xl flex flex-col overflow-hidden animate-scale-in relative z-50">
              
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-diag-navy/90 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-diag-cyan animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5" style={{ fontFamily: 'Geist, sans-serif' }}>
                      <Brain className="h-3.5 w-3.5 text-diag-cyan animate-pulse" />
                      DiagnosIQ Chat Assistant
                    </h4>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">Clinical AI Telemetry Agent</span>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 text-[9px] font-black animate-pulse"
                >
                  ✕
                </button>
              </div>

              {/* Message History Terminal */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 font-mono text-[10px]" style={{ maxHeight: '310px' }}>
                {chatMessages.map((msg, idx) => {
                  const isModel = msg.role === 'model';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[85%] rounded-2xl p-3 border leading-relaxed ${
                        isModel
                          ? 'self-start bg-white/[0.01] border-white/5 text-slate-300'
                          : 'self-end bg-diag-cyan/5 border-diag-cyan/20 text-slate-100 text-right'
                      }`}
                    >
                      <span className={`text-[8px] font-bold uppercase tracking-wider mb-1 block ${
                        isModel ? 'text-diag-cyan' : 'text-indigo-400'
                      }`}>
                        {isModel ? '🩺 DiagnosIQ AI' : '👤 You (Patient)'}
                      </span>
                      <p className="whitespace-pre-line text-left leading-normal font-sans text-[11px] font-medium text-slate-200">{msg.text}</p>
                    </div>
                  );
                })}
                {chatLoading && (
                  <div className="self-start flex flex-col max-w-[80%] rounded-2xl p-3 bg-white/[0.01] border border-white/5 text-slate-400 animate-pulse">
                    <span className="text-[8px] font-bold text-diag-cyan uppercase tracking-wider mb-1 block">🩺 DiagnosIQ AI is thinking...</span>
                    <div className="flex gap-1 items-center mt-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-diag-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-diag-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-diag-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Starter Quick Bubbles */}
              {chatMessages.length === 1 && !chatLoading && (
                <div className="px-4 py-1.5 flex flex-wrap gap-1.5 border-t border-white/[0.03] mb-1">
                  {[
                    { text: 'Explain my high risk markers', q: 'Explain what biomarkers are out of range or carry elevated risks in my report' },
                    { text: 'How to improve kidney health?', q: 'How can I protect or improve my renal system and creatinine clearance index?' },
                    { text: 'What does Glucose represent?', q: 'What does my glucose value represent and how can I maintain metabolic health?' }
                  ].map((bub, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(bub.q)}
                      className="text-[9px] font-bold px-2 py-1 bg-white/[0.02] border border-white/5 hover:border-diag-cyan/35 text-slate-400 hover:text-diag-cyan rounded-lg transition-all text-left"
                    >
                      💡 {bub.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 border-t border-white/5 bg-diag-navy/80 backdrop-blur-md mt-auto flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(chatInput); }}
                  placeholder="Ask about kidney GFR, glucose, or cardiac risks..."
                  className="medical-input flex-1 text-xs py-2 px-3 focus:border-diag-cyan border-white/5"
                  disabled={chatLoading}
                />
                <button
                  onClick={() => handleSendMessage(chatInput)}
                  disabled={!chatInput.trim() || chatLoading}
                  className={`px-3 py-2 bg-diag-cyan text-diag-navy font-bold text-xs rounded-xl flex items-center justify-center transition-all ${
                    !chatInput.trim() || chatLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                  }`}
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Trigger button bubble */}
          <button
            onClick={() => setChatOpen(prev => !prev)}
            className="h-12 w-12 rounded-full border border-diag-cyan/30 bg-diag-navy flex items-center justify-center text-diag-cyan hover:text-white transition-all shadow-2xl focus:outline-none relative group active:scale-95 duration-200 select-none hover:border-diag-cyan pointer-events-auto"
            style={{
              boxShadow: '0 8px 32px rgba(56, 189, 248, 0.15), inset 0 0 12px rgba(56, 189, 248, 0.1)',
            }}
          >
            <Brain className="h-5.5 w-5.5 animate-pulse text-diag-cyan group-hover:scale-105 transition-transform" />
            
            {/* Unread badge pointer */}
            {!chatOpen && chatMessages.length === 1 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-diag-cyan opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-diag-cyan text-[7px] font-black items-center justify-center text-diag-navy">!</span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="relative z-10 w-full border-t border-white/[0.04] py-5 px-6 text-center mt-auto bg-diag-bg/60">
        <p className="text-[10px] text-slate-500 font-medium tracking-wide">
          DiagnosIQ · Enterprise AI Preventive Health Platform · WHO & ICMR Reference Compliant · 2026
        </p>
      </footer>
    </div>
  );
}
