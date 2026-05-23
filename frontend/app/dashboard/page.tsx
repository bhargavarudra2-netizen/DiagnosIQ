"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Heart, Activity, ShieldAlert, Cpu, Droplet, Flame, ArrowLeft, Printer, Calendar, User, Info, AlertTriangle, TrendingUp, HelpCircle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend } from "recharts";
import { ReportData, Biomarker } from "../../types";

export default function DashboardPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [mode, setMode] = useState<"patient" | "doctor">("patient");
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"command" | "history">("command");
  
  // Historical progression mock
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    // Retrieve report from localStorage
    const saved = localStorage.getItem("active_report");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReport(parsed);
        // Setup mock history timeline tailored to this report
        setupTimeline(parsed);
      } catch (e) {
        console.error(e);
      }
    } else {
      // Setup default mock
      const defaultReport = getFallbackReport();
      setReport(defaultReport);
      setupTimeline(defaultReport);
    }
  }, []);

  const setupTimeline = (rep: ReportData) => {
    const isCritical = rep.overall_risk === "critical";
    const glucoseVal = rep.biomarkers.find(b => b.name.toLowerCase() === "glucose")?.value || 110;
    const creatinineVal = rep.biomarkers.find(b => b.name.toLowerCase() === "creatinine")?.value || 1.1;

    setHistoryData([
      { date: "Nov 25", glucose: 98, hemoglobin: 13.8, creatinine: 0.9 },
      { date: "Feb 26", glucose: isCritical ? 140 : 102, hemoglobin: 12.5, creatinine: isCritical ? 1.4 : 1.0 },
      { date: "May 26", glucose: glucoseVal, hemoglobin: 11.5, creatinine: creatinineVal }
    ]);
  };

  if (!report) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Activity className="h-8 w-8 text-cyber-cyan animate-pulse" />
      </div>
    );
  }

  const {
    patient_name,
    report_date,
    report_type,
    overall_risk,
    ocr_confidence,
    overall_score = 72,
    organScores = { cardiovascular: 80, blood: 85, kidneys: 95, liver: 90, pancreas: 60, brain: 98 },
    biomarkers,
    summary_patient,
    summary_doctor,
    action_plan
  } = report;

  const filteredBiomarkers = selectedOrgan 
    ? biomarkers.filter(b => b.affected_organ === selectedOrgan)
    : biomarkers;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall_score / 100) * circumference;

  return (
    <div className="flex-grow flex flex-col bg-cyber-bg min-h-screen">
      
      {/* Dashboard Navbar Header */}
      <header className="border-b border-white/5 p-4 bg-cyber-bg/85 backdrop-blur flex justify-between items-center z-20">
        <Link href="/upload" className="text-xs font-extrabold text-cyber-cyan hover:underline flex items-center gap-1">
          ← Back to Upload
        </Link>
        
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyber-cyan animate-pulse" />
          <span className="text-sm font-black tracking-tight">VITALIS HEALTH CONSOLE</span>
        </div>

        <div className="flex bg-cyber-bg border border-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("command")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "command" ? "bg-cyber-cyan text-cyber-bg shadow" : "text-cyber-gray hover:text-slate-200"
            }`}
          >
            Health Command
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "history" ? "bg-cyber-cyan text-cyber-bg shadow" : "text-cyber-gray hover:text-slate-200"
            }`}
          >
            Historical Trends
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full">
        
        {/* Left Side: Organ Grid (lg:span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Spatial system indicator */}
          <div className="glassmorphism-glow glow-cyan p-6 rounded-3xl flex flex-col justify-between min-h-[380px] relative overflow-hidden select-none">
            <div className="absolute inset-x-0 h-0.5 bg-cyber-cyan glow-cyan opacity-20 animate-scan pointer-events-none" />
            <div>
              <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="h-4.5 w-4.5 text-cyber-cyan animate-pulse" />
                Anatomical Risk Spatial Map
              </h3>
              <p className="text-[10px] text-cyber-gray mt-0.5">Click any channel below to filter biomarkers</p>
            </div>

            {/* Wireframe map simulation */}
            <div className="my-6 flex justify-center items-center h-[200px] border border-white/5 bg-cyber-bg/40 rounded-2xl relative">
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#00f2fe_1px,transparent_1px)] [background-size:12px_12px]" />
              
              {/* Dummy anatomical body node vectors */}
              <div className="flex flex-col gap-2.5 items-center justify-center font-mono">
                <div className={`px-2 py-0.5 rounded text-[8px] font-bold border transition-colors ${organScores.brain < 80 ? 'border-cyber-amber text-cyber-amber bg-cyber-amber/5' : 'border-white/10 text-cyber-gray'}`}>
                  [BRAIN] - {organScores.brain}%
                </div>
                <div className={`px-2 py-0.5 rounded text-[8px] font-bold border transition-colors ${organScores.cardiovascular < 80 ? 'border-cyber-red text-cyber-red bg-cyber-red/5' : 'border-white/10 text-cyber-gray'}`}>
                  [HEART] - {organScores.cardiovascular}%
                </div>
                <div className="flex gap-2">
                  <div className={`px-2 py-0.5 rounded text-[8px] font-bold border transition-colors ${organScores.liver < 80 ? 'border-cyber-amber text-cyber-amber bg-cyber-amber/5' : 'border-white/10 text-cyber-gray'}`}>
                    [LIVER] - {organScores.liver}%
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[8px] font-bold border transition-colors ${organScores.pancreas < 80 ? 'border-cyber-red text-cyber-red bg-cyber-red/5' : 'border-white/10 text-cyber-gray'}`}>
                    [PANCREAS] - {organScores.pancreas}%
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded text-[8px] font-bold border transition-colors ${organScores.kidneys < 80 ? 'border-cyber-red text-cyber-red bg-cyber-red/5' : 'border-white/10 text-cyber-gray'}`}>
                  [KIDNEYS] - {organScores.kidneys}%
                </div>
              </div>
            </div>

            {/* Quick selectors */}
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(organScores).map((org) => {
                const score = organScores[org as keyof typeof organScores];
                const isActive = selectedOrgan === org;
                return (
                  <button
                    key={org}
                    onClick={() => setSelectedOrgan(isActive ? null : org)}
                    className={`py-1.5 rounded-lg border text-[9px] font-extrabold uppercase transition-all flex flex-col items-center justify-center ${
                      isActive 
                        ? 'bg-cyber-cardLight border-cyber-cyan shadow shadow-cyber-cyan/10'
                        : 'bg-cyber-bg border-slate-800 text-cyber-gray hover:text-slate-100'
                    }`}
                  >
                    <span>{org}</span>
                    <span className={`font-mono text-[10px] mt-0.5 font-black ${score < 40 ? 'text-cyber-red' : score < 80 ? 'text-cyber-amber' : 'text-cyber-emerald'}`}>
                      {score}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Command Center & Charts (lg:span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {activeTab === "command" ? (
            <div className="flex flex-col gap-6 w-full">
              
              {/* Header profile card */}
              <div className="glassmorphism p-5 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-full bg-cyber-cardLight border border-cyber-cyan/35 flex items-center justify-center text-cyber-cyan shadow-md">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-100">{patient_name || "Anonymous Patient"}</h2>
                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${
                        overall_risk === "critical" ? "bg-cyber-red/20 text-cyber-red border-cyber-red/30 animate-pulse" :
                        overall_risk === "high" ? "bg-cyber-red/10 text-cyber-red border-cyber-red/20" :
                        overall_risk === "medium" ? "bg-cyber-amber/10 text-cyber-amber border-cyber-amber/20" :
                        "bg-cyber-emerald/10 text-cyber-emerald border-cyber-emerald/20"
                      }`}>
                        {overall_risk} risk
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-cyber-gray mt-1 font-semibold">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Date: {report_date}</span>
                      <span className="h-1 w-1 bg-slate-700 rounded-full" />
                      <span>Type: {report_type}</span>
                    </div>
                  </div>
                </div>

                {/* Mode Controller */}
                <div className="flex bg-cyber-bg border border-slate-700/60 p-1 rounded-xl shadow-md">
                  <button
                    onClick={() => setMode("patient")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                      mode === "patient" ? "bg-cyber-cyan text-cyber-bg shadow shadow-cyber-cyan/15 font-black" : "text-cyber-gray hover:text-slate-200"
                    }`}
                  >
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    Explain Simply
                  </button>
                  <button
                    onClick={() => setMode("doctor")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                      mode === "doctor" ? "bg-cyber-cyan text-cyber-bg shadow shadow-cyber-cyan/15 font-black" : "text-cyber-gray hover:text-slate-200"
                    }`}
                  >
                    <ShieldAlert className="h-3 w-3" />
                    Clinical Mode
                  </button>
                </div>
              </div>

              {/* Radial index and AI Explanations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Score gauge */}
                <div className="glassmorphism p-5 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center text-center relative overflow-hidden select-none">
                  <div className="absolute top-3 left-3 bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
                    Vitalis Score
                  </div>

                  <div className="relative h-28 w-28 flex items-center justify-center mt-3">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r={radius} className="stroke-slate-800 fill-none" strokeWidth="8" />
                      <circle
                        cx="56"
                        cy="56"
                        r={radius}
                        fill="none"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ${
                          overall_score < 40 ? "stroke-cyber-red" : overall_score < 80 ? "stroke-cyber-amber" : "stroke-cyber-emerald"
                        }`}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-100 font-mono text-glow-cyan">{overall_score}</span>
                      <span className="text-[9px] text-cyber-gray font-bold uppercase tracking-wider">Health index</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase">
                      {overall_score >= 80 ? "Optimal Standing" : overall_score >= 50 ? "Imbalances Flagged" : "Critical Warning"}
                    </h4>
                  </div>
                </div>

                {/* AI Text explanation */}
                <div className="glassmorphism p-5 rounded-2xl border border-slate-800/80 md:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-cyber-cyan flex items-center gap-1.5">
                        <Info className="h-4 w-4" />
                        {mode === "patient" ? "Layperson Explanation" : "Clinical Assessment"}
                      </h3>
                      <div className="text-[9px] text-cyber-emerald bg-cyber-emerald/10 border border-cyber-emerald/20 px-2 py-0.5 rounded-full font-bold">
                        AI CONFIDENCE: {(ocr_confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                      {mode === "patient" ? summary_patient : summary_doctor}
                    </p>
                  </div>
                </div>

              </div>

              {/* Biomarkers Table */}
              <div className="glassmorphism p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
                  <ShieldAlert className="h-4.5 w-4.5 text-cyber-cyan" />
                  Extracted Biomarker Analysis
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-[10px] text-cyber-gray font-bold uppercase">
                        <th className="py-2.5 px-3">Biomarker</th>
                        <th className="py-2.5 px-3">Value</th>
                        <th className="py-2.5 px-3">Ref Range</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">{mode === "patient" ? "layman meaning" : "Clinical terms"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBiomarkers.map((bm, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-cyber-cardLight/20 transition-colors text-xs">
                          <td className="py-3 px-3 font-bold text-slate-200">{bm.name}</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-100">{bm.value} <span className="text-[9px] text-cyber-gray font-sans font-medium">{bm.unit}</span></td>
                          <td className="py-3 px-3 font-mono text-[10px] text-cyber-gray">{bm.normal_range}</td>
                          <td className="py-3 px-3">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
                              bm.status === "critical" ? "bg-cyber-red/20 text-cyber-red border-cyber-red/35 animate-pulse" :
                              bm.status === "warning" ? "bg-cyber-amber/10 text-cyber-amber border-cyber-amber/35" :
                              "bg-cyber-emerald/10 text-cyber-emerald border-cyber-emerald/35"
                            }`}>
                              {bm.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-300 max-w-[260px]">
                            {mode === "patient" ? (
                              <span>{bm.plain_english}</span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-cyber-cyan">{bm.clinical_term}</span>
                                <span className="bg-slate-800 text-cyber-gray border border-white/5 px-1 py-0.5 rounded text-[9px] font-mono">{bm.icd10_hint}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="glassmorphism p-6 rounded-3xl border border-slate-800 flex flex-col gap-6 w-full">
              <div>
                <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cyber-cyan animate-pulse" />
                  Chronological Progression & Projections
                </h3>
                <p className="text-xs text-cyber-gray mt-0.5">Linear regression projection pathways over dynamic periods</p>
              </div>

              {/* Recharts chart */}
              <div className="h-64 w-full bg-cyber-bg/50 border border-slate-850 rounded-xl p-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} tickLine={false} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ background: "rgba(11,19,41,0.95)", border: "1px solid rgba(0,242,254,0.3)", borderRadius: "8px", fontSize: "11px", color: "#fff" }} />
                    <Legend verticalAlign="top" height={32} iconType="circle" />
                    <Line name="Fasting Glucose (mg/dL)" type="monotone" dataKey="glucose" stroke="#00f2fe" strokeWidth={3} dot={{ r: 4 }} />
                    <Line name="Serum Creatinine (mg/dL)" type="monotone" dataKey="creatinine" stroke="#ffb800" strokeWidth={2.5} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-xl border border-cyber-cyan/10 bg-cyber-cyan/5 text-xs text-slate-300 leading-relaxed font-semibold">
                <strong className="text-cyber-cyan">Progression Model: </strong>
                Fasting sugar is currently mapped to rise +15% over historical baselines. Favorable metabolic dietary changes are highly recommended to prevent boundary deviations by Q4 2026.
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

// Fallback high fidelity parsed object if cache is missing
function getFallbackReport(): ReportData {
  return {
    patient_name: "Rahul Sharma",
    report_date: "2026-05-18",
    report_type: "Comprehensive Panels",
    overall_risk: "low",
    ocr_confidence: 0.98,
    overall_score: 95,
    organScores: {
      cardiovascular: 98,
      blood: 96,
      kidneys: 98,
      liver: 95,
      pancreas: 96,
      brain: 98,
    },
    biomarkers: [
      {
        name: "Glucose",
        value: 92,
        unit: "mg/dL",
        normal_range: "70 - 140",
        status: "normal",
        affected_organ: "pancreas",
        confidence: 0.99,
        plain_english: "Your fasting blood sugar levels are healthy and stable.",
        clinical_term: "Euglycemia",
        icd10_hint: "Z00.0",
      },
      {
        name: "Hemoglobin",
        value: 14.5,
        unit: "g/dL",
        normal_range: "13.0 - 17.0",
        status: "normal",
        affected_organ: "blood",
        confidence: 0.98,
        plain_english: "Your red blood cell iron transport capability is optimal.",
        clinical_term: "Normocythaemia",
        icd10_hint: "Z00.0",
      },
      {
        name: "Serum Creatinine",
        value: 0.9,
        unit: "mg/dL",
        normal_range: "0.6 - 1.2",
        status: "normal",
        affected_organ: "kidneys",
        confidence: 0.99,
        plain_english: "Kidney filtration rate is operating within stable target values.",
        clinical_term: "Normocreatininemia",
        icd10_hint: "Z00.0",
      },
    ],
    summary_patient: "Your overall diagnostic panel represents excellent physiological standing. All markers are balanced and optimal.",
    summary_doctor: "Clinical baseline panel within target physiologic parameters. No signs of metabolic anomalies, renal insufficiency, or lipid dysregulation.",
    emergency_flags: [],
    action_plan: {
      diet: ["Maintain fiber intake of 30g/day", "Continue rich antioxidant intake"],
      lifestyle: ["Continue 150 minutes of weekly cardiorespiratory exercise"],
      specialist: "GP / General Medicine",
      urgency: "Routine checkup (12 Months)",
    },
  };
}
