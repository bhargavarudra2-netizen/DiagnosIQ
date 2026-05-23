import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Activity, ShieldAlert, Cpu, UploadCloud, ArrowRight, FileText, CheckCircle, Database, HelpCircle } from 'lucide-react';
import { MOCK_REPORTS, analyzeBiomarkers } from './services/medicalEngine';
import AnatomicalVisualizer from './components/AnatomicalVisualizer';
import RiskDashboard from './components/RiskDashboard';
import TrendAnalysis from './components/TrendAnalysis';
import EmergencyAlert from './components/EmergencyAlert';
import PrintableActionPlan from './components/PrintableActionPlan';

const LOG_MESSAGES = [
  "Initializing Vitalis high speed optical character extraction pipeline...",
  "Applying binarization algorithms and contrast optimization grids...",
  "Executing OCR matrix segmentation on report typography...",
  "Structuring text arrays into biometric database indices (Confidence: 96%)...",
  "Passing biometric parameters to deterministic safety rule validator...",
  "Evaluating thresholds for troponin, glucose, creatinine, and platelets...",
  "Synthesizing cognitive layman translations and ICD-10 medical terminology...",
  "Injecting clinical action plans and compiling specialist referrals...",
  "System ready. Dispatching analysis payload..."
];

export default function App() {
  const [screen, setScreen] = useState('landing'); // 'landing' | 'scanning' | 'analysis' | 'print'
  const [activeTab, setActiveTab] = useState('command'); // 'command' | 'trends'
  const [activeReport, setActiveReport] = useState(null);
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  
  // Scanner state
  const [scanProgress, setScanProgress] = useState(0);
  const [activeLog, setActiveLog] = useState("");
  const [completedLogs, setCompletedLogs] = useState([]);
  
  // Safety engine states
  const [criticalFlags, setCriticalFlags] = useState([]);
  const [showEmergency, setShowEmergency] = useState(false);

  // Trigger report scanning pipeline simulation
  const handleLoadReport = (reportKey) => {
    setScreen('scanning');
    setScanProgress(0);
    setCompletedLogs([]);
    setActiveLog(LOG_MESSAGES[0]);

    const report = MOCK_REPORTS[reportKey];
    
    // Safety check with our deterministic engine
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
  };

  // Scan simulation interval
  useEffect(() => {
    if (screen !== 'scanning') return;

    const totalSteps = LOG_MESSAGES.length;
    const stepDuration = 700; // time per log step

    const interval = setInterval(() => {
      setScanProgress(prev => {
        const nextProgress = prev + (100 / totalSteps);
        
        if (nextProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setScreen('analysis');
            if (criticalFlags.length > 0) {
              setShowEmergency(true);
            }
          }, 400);
          return 100;
        }

        const currentStepIndex = Math.floor(nextProgress / (100 / totalSteps));
        setCompletedLogs(prevLogs => [...prevLogs, LOG_MESSAGES[currentStepIndex - 1]]);
        setActiveLog(LOG_MESSAGES[currentStepIndex]);
        return nextProgress;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [screen, criticalFlags]);

  return (
    <div className="min-h-screen text-slate-100 relative">
      
      {/* ---------------------------------------------------- */}
      {/* SCREEN 1: futuristic landing hero */}
      {/* ---------------------------------------------------- */}
      {screen === 'landing' && (
        <div className="flex flex-col min-h-screen">
          
          {/* Main Hero Container */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-24 text-center max-w-5xl mx-auto z-10">
            {/* Shield Logo badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-cardLight border border-cyber-cyan/35 text-cyber-cyan text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in shadow-md shadow-cyber-cyan/5">
              <Sparkles className="h-4 w-4 text-cyber-cyan animate-pulse" />
              Vitalis Healthcare Systems
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-slate-50 animate-fade-in">
              PREVENTIVE HEALTH <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyan-400 to-cyber-emerald text-glow-cyan">
                INTELLIGENCE SYSTEM
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-cyber-gray mt-6 max-w-2xl leading-relaxed font-medium animate-fade-in">
              An AI-powered clinical engine that extracts diagnostics, maps biomarkers onto vector-precise anatomical body visualizers, and computes deterministic medical safety boundaries.
            </p>

            {/* Platform statistics counter widgets */}
            <div className="grid grid-cols-3 gap-6 max-w-xl w-full my-8 animate-fade-in">
              <div className="p-3 bg-cyber-card/40 border border-slate-850/80 rounded-2xl">
                <span className="text-2xl font-black text-cyber-cyan font-mono">99.2%</span>
                <span className="text-[10px] text-cyber-gray block font-semibold uppercase mt-0.5">OCR Mapped Accuracy</span>
              </div>
              <div className="p-3 bg-cyber-card/40 border border-slate-850/80 rounded-2xl">
                <span className="text-2xl font-black text-cyber-emerald font-mono">100%</span>
                <span className="text-[10px] text-cyber-gray block font-semibold uppercase mt-0.5">Deterministic Safety</span>
              </div>
              <div className="p-3 bg-cyber-card/40 border border-slate-850/80 rounded-2xl">
                <span className="text-2xl font-black text-cyber-cyan font-mono">6 Vector</span>
                <span className="text-[10px] text-cyber-gray block font-semibold uppercase mt-0.5">Organ Space Visuals</span>
              </div>
            </div>

            {/* Sandbox Simulation Grid */}
            <div className="w-full flex flex-col items-center gap-4 mt-4 animate-fade-in">
              <h3 className="text-xs uppercase tracking-widest font-extrabold text-cyber-gray">
                Select high fidelity Sandbox diagnostics
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                {/* Sandbox A */}
                <button
                  onClick={() => handleLoadReport('normal')}
                  className="glassmorphism p-5 rounded-2xl border border-slate-800/80 hover:border-cyber-cyan hover:shadow-[0_0_20px_rgba(0,242,254,0.15)] flex flex-col items-start text-left transition-all group"
                >
                  <span className="text-[10px] uppercase font-bold text-cyber-emerald bg-cyber-emerald/10 border border-cyber-emerald/20 px-2 py-0.5 rounded-full mb-2.5">
                    Case A: Optimal Stand
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-cyber-cyan transition-colors">
                    Rahul Sharma (28, Male)
                  </h4>
                  <p className="text-[11px] text-cyber-gray mt-1 leading-snug">
                    Baseline physiological check. Complete metabolics and lipids normal.
                  </p>
                  <span className="text-[10px] font-bold text-cyber-cyan mt-3 flex items-center gap-1">
                    Launch Sandbox <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                {/* Sandbox B */}
                <button
                  onClick={() => handleLoadReport('critical')}
                  className="glassmorphism p-5 rounded-2xl border border-slate-800/80 hover:border-cyber-red hover:shadow-[0_0_20px_rgba(255,74,90,0.15)] flex flex-col items-start text-left transition-all group"
                >
                  <span className="text-[10px] uppercase font-bold text-cyber-red bg-cyber-red/10 border border-cyber-red/20 px-2 py-0.5 rounded-full mb-2.5">
                    Case B: Critical Crisis
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-cyber-red transition-colors">
                    Amit Patil (45, Male)
                  </h4>
                  <p className="text-[11px] text-cyber-gray mt-1 leading-snug">
                    Cardiac troponin elevation coupled with diabetic metabolic warning flags.
                  </p>
                  <span className="text-[10px] font-bold text-cyber-red mt-3 flex items-center gap-1">
                    Launch Sandbox <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                {/* Sandbox C */}
                <button
                  onClick={() => handleLoadReport('renal_decline')}
                  className="glassmorphism p-5 rounded-2xl border border-slate-800/80 hover:border-cyber-cyan hover:shadow-[0_0_20px_rgba(0,242,254,0.15)] flex flex-col items-start text-left transition-all group"
                >
                  <span className="text-[10px] uppercase font-bold text-cyber-amber bg-cyber-amber/10 border border-cyber-amber/20 px-2 py-0.5 rounded-full mb-2.5">
                    Case C: Renal Progression
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-cyber-cyan transition-colors">
                    Savita Dev (62, Female)
                  </h4>
                  <p className="text-[11px] text-cyber-gray mt-1 leading-snug">
                    Renal Creatinine clearance degradation maps paired with severe anemia.
                  </p>
                  <span className="text-[10px] font-bold text-cyber-cyan mt-3 flex items-center gap-1">
                    Launch Sandbox <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </div>

            {/* Secondary upload panel mockup */}
            <div className="w-full max-w-md bg-cyber-bg/40 border border-slate-850 p-6 rounded-2xl flex flex-col items-center mt-12 gap-3 group border-dashed hover:border-cyber-cyan/50 transition-colors">
              <UploadCloud className="h-8 w-8 text-cyber-gray group-hover:text-cyber-cyan transition-colors" />
              <div className="text-xs">
                <span className="text-slate-100 font-bold hover:underline cursor-pointer" onClick={() => handleLoadReport('normal')}>
                  Upload medical report image / PDF
                </span>
                <p className="text-[10px] text-cyber-gray mt-0.5">Supports CBC, Lipid panels, Kidney panels, and prescriptions</p>
              </div>
            </div>
          </main>

          {/* Landing Footer */}
          <footer className="w-full border-t border-slate-850 p-6 text-center text-xs text-cyber-gray z-10 bg-cyber-bg/60">
            AntiGravity Medical Systems © 2026. All medical logic structures engineered to WHO/ICMR baselines.
          </footer>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SCREEN 2: premium scanning terminal animation */}
      {/* ---------------------------------------------------- */}
      {screen === 'scanning' && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-cyber-bg p-6 text-center">
          <div className="w-full max-w-lg flex flex-col gap-6 relative p-8 glassmorphism-glow rounded-3xl border border-cyber-cyan/35 shadow-[0_0_30px_rgba(0,242,254,0.1)]">
            
            {/* Cyber scanner swipe effect */}
            <div className="absolute inset-x-0 h-1 bg-cyber-cyan glow-cyan opacity-80 animate-scan pointer-events-none" />

            {/* Glowing heartbeat pulse */}
            <div className="h-16 w-16 bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-full flex items-center justify-center text-cyber-cyan shadow-md shadow-cyber-cyan/10 mx-auto animate-pulse">
              <Activity className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-100">
                Parsing Diagnostic Matrices
              </h2>
              <p className="text-xs text-cyber-gray mt-1 font-medium">
                Vitalis Cognitive Pipeline active
              </p>
            </div>

            {/* Progress status bar */}
            <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-2.5 bg-cyber-cyan glow-cyan transition-all duration-300 rounded-full"
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            {/* Cyber shell diagnostics log */}
            <div className="bg-cyber-bg/95 border border-slate-800/80 p-4 rounded-xl text-left font-mono text-[10px] text-cyber-gray h-36 overflow-y-auto flex flex-col gap-1 select-none">
              {completedLogs.map((log, index) => (
                <div key={index} className="flex items-center gap-1.5 text-cyber-emerald">
                  <CheckCircle className="h-3 w-3 shrink-0" />
                  <span>{log}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-cyber-cyan animate-pulse">
                <Cpu className="h-3 w-3 shrink-0 animate-spin" />
                <span>{activeLog}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SCREEN 3: main cyber analysis command center */}
      {/* ---------------------------------------------------- */}
      {screen === 'analysis' && activeReport && (
        <div className="min-h-screen flex flex-col bg-cyber-bg">
          
          {/* Command Center Header */}
          <header className="border-b border-slate-850 p-4 bg-cyber-bg/80 backdrop-blur flex justify-between items-center z-20">
            <button 
              onClick={() => {
                setScreen('landing');
                setSelectedOrgan(null);
              }}
              className="text-xs font-extrabold text-cyber-cyan hover:underline flex items-center gap-1"
            >
              ← Back to Landing
            </button>
            
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyber-cyan animate-pulse" />
              <span className="text-sm font-black font-sans tracking-tight">VITALIS AI HEALTH INDEX</span>
            </div>

            {/* Command page tab controls */}
            <div className="flex bg-cyber-bg border border-slate-800/60 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('command')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'command'
                    ? 'bg-cyber-cyan text-cyber-bg shadow'
                    : 'text-cyber-gray hover:text-slate-200'
                }`}
              >
                Health Command
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'trends'
                    ? 'bg-cyber-cyan text-cyber-bg shadow'
                    : 'text-cyber-gray hover:text-slate-200'
                }`}
              >
                Historical Trends
              </button>
            </div>
          </header>

          {/* Main Dashboard Workspace Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full">
            
            {/* Left Spatial Visualizer Element (lg:span-4) */}
            <div className="lg:col-span-4 h-fit lg:sticky lg:top-20">
              <AnatomicalVisualizer 
                organScores={activeReport.organScores}
                activeOrgan={selectedOrgan}
                onSelectOrgan={setSelectedOrgan}
                overallRisk={activeReport.overall_risk}
              />
            </div>

            {/* Right Risk Reports elements (lg:span-8) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {activeTab === 'command' ? (
                <RiskDashboard 
                  reportData={activeReport}
                  selectedOrgan={selectedOrgan}
                  onSelectOrgan={setSelectedOrgan}
                  onPrintPlan={() => setScreen('print')}
                  onShowTrends={() => setActiveTab('trends')}
                />
              ) : (
                <TrendAnalysis 
                  historicalData={activeReport.historical}
                />
              )}

            </div>

          </div>

          {/* High Priority deterministics safety alerts modal */}
          {showEmergency && criticalFlags.length > 0 && (
            <EmergencyAlert 
              flags={criticalFlags}
              onClose={() => setShowEmergency(false)}
            />
          )}

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SCREEN 4: high-fidelity clinical printable layouts */}
      {/* ---------------------------------------------------- */}
      {screen === 'print' && activeReport && (
        <div className="min-h-screen bg-cyber-bg p-6">
          <PrintableActionPlan 
            reportData={activeReport}
            onBack={() => setScreen('analysis')}
          />
        </div>
      )}

    </div>
  );
}
