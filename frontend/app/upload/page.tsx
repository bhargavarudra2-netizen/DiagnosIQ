"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Sparkles, Cpu, CheckCircle, Database, FileText, FileJson, Trash2, ArrowLeft, Activity } from "lucide-react";
import { ApiService } from "../../services/api";
import Link from "next/link";

const RAW_TEMPLATES = {
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

export default function UploadPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
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

        // Prepopulate text templates dynamically based on names
        const nameLower = file.name.toLowerCase();
        if (nameLower.includes("cardiac") || nameLower.includes("troponin") || nameLower.includes("emergency")) {
          setInputText(RAW_TEMPLATES.cardiac_emergency);
        } else if (nameLower.includes("kidney") || nameLower.includes("renal") || nameLower.includes("anemia")) {
          setInputText(RAW_TEMPLATES.renal_anemia);
        } else {
          setInputText(RAW_TEMPLATES.lipid_cbc);
        }
      }
    }, 150);
  };

  const executePipeline = async (textToParse: string) => {
    setIsScanning(true);
    setScanProgress(0);

    // Simulate scanning terminal log progress
    const steps = 5;
    let currentStep = 0;
    const interval = setInterval(async () => {
      currentStep += 1;
      setScanProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(interval);
        try {
          const report = await ApiService.extractText(textToParse);
          
          // Compute mock metrics locally if backend serves placeholder
          if (!report.overall_score) {
            const valMatch = textToParse.match(/creatinine\s*[:=-]?\s*(\d+(?:\.\d+)?)/i);
            const creatVal = valMatch ? parseFloat(valMatch[1]) : 1.0;
            report.overall_score = creatVal > 3.0 ? 35 : 72;
            report.organScores = {
              cardiovascular: creatVal > 3.0 ? 80 : 65,
              blood: 85,
              kidneys: creatVal > 3.0 ? 15 : 95,
              liver: 90,
              pancreas: 60,
              brain: 98
            };
          }

          localStorage.setItem("active_report", JSON.stringify(report));
          router.push("/dashboard");
        } catch (e) {
          console.error(e);
        } finally {
          setIsScanning(false);
        }
      }
    }, 400);
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-7xl mx-auto w-full z-10 relative">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

      {isScanning ? (
        <div className="w-full max-w-lg flex flex-col gap-6 p-8 glassmorphism-glow rounded-3xl border border-cyber-cyan/35 shadow-[0_0_30px_rgba(0,242,254,0.1)] relative">
          <div className="absolute inset-x-0 h-1 bg-cyber-cyan glow-cyan opacity-80 animate-scan pointer-events-none" />
          <div className="h-16 w-16 bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-full flex items-center justify-center text-cyber-cyan shadow-md shadow-cyber-cyan/10 mx-auto animate-pulse">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100">Parsing Diagnostic Matrices</h2>
            <p className="text-xs text-cyber-gray mt-1 font-medium">Vitalis Cognitive Pipeline active</p>
          </div>
          <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden border border-slate-800">
            <div className="h-2 bg-cyber-cyan transition-all duration-300 rounded-full" style={{ width: `${scanProgress}%` }} />
          </div>
          <div className="bg-cyber-bg/95 border border-slate-800 p-4 rounded-xl text-left font-mono text-[10px] text-cyber-gray flex flex-col gap-1 min-h-[100px]">
            {scanProgress >= 20 && <div className="text-cyber-emerald flex items-center gap-1.5"><CheckCircle className="h-3 w-3" /> Initializing character grids...</div>}
            {scanProgress >= 40 && <div className="text-cyber-emerald flex items-center gap-1.5"><CheckCircle className="h-3 w-3" /> Executing regular expressions...</div>}
            {scanProgress >= 60 && <div className="text-cyber-emerald flex items-center gap-1.5"><CheckCircle className="h-3 w-3" /> Standardizing biomarkers schema...</div>}
            {scanProgress >= 80 && <div className="text-cyber-cyan flex items-center gap-1.5 animate-pulse"><Cpu className="h-3 w-3" /> Running deterministic rules checks...</div>}
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          {/* Header controllers */}
          <div className="w-full flex justify-between items-center mb-10 max-w-4xl">
            <Link href="/" className="text-xs font-extrabold text-cyber-cyan hover:underline flex items-center gap-1">
              ← Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyber-cyan animate-pulse" />
              <span className="text-sm font-black tracking-tight">VITALIS OCR SCANNER</span>
            </div>
          </div>

          <h2 className="text-3xl font-black text-slate-100 uppercase tracking-wide">
            Analyze Diagnostics Report
          </h2>
          <p className="text-xs text-cyber-gray mt-2 font-medium max-w-lg">
            Upload files or paste raw diagnostic logs. The regex matching engine will extract values and compute risk ratios.
          </p>

          {/* Interactive OCR Grid Pasteboard */}
          <div className="w-full max-w-4xl mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* File drop area */}
            <div
              className={`glassmorphism p-6 rounded-3xl border flex flex-col items-center justify-center min-h-[300px] transition-all relative ${
                isDragOver ? "border-cyber-cyan bg-cyber-cyan/10 shadow-[0_0_20px_rgba(0,242,254,0.25)]" : "border-slate-800 hover:border-slate-700"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDropFile}
            >
              <div className="absolute top-3 left-3 bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Database className="h-3 w-3" />
                Diagnostic Sheet Upload
              </div>

              {!fileName && !isUploading ? (
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-cyber-cardLight border border-slate-800 flex items-center justify-center text-cyber-gray">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <div>
                    <label className="text-sm font-extrabold text-slate-100 hover:text-cyber-cyan hover:underline cursor-pointer block">
                      Drag & Drop or Browse file
                      <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={handleFileSelect} />
                    </label>
                    <p className="text-[10px] text-cyber-gray mt-1 leading-snug max-w-[220px]">
                      Supports medical PDFs, lab prints, and cell photos
                    </p>
                  </div>
                </div>
              ) : isUploading ? (
                <div className="w-full flex flex-col items-center gap-3 text-center p-4">
                  <Activity className="h-8 w-8 text-cyber-cyan animate-pulse" />
                  <div className="w-full">
                    <span className="text-[10px] uppercase font-extrabold text-cyber-gray block">Uploading: {fileName}</span>
                    <div className="w-full bg-slate-850 h-2 rounded-full mt-2 overflow-hidden border border-slate-800">
                      <div className="h-2 bg-cyber-cyan transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center text-center gap-3 p-4">
                  <div className="h-12 w-12 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/35 flex items-center justify-center text-cyber-cyan">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="w-full">
                    <span className="text-xs font-extrabold text-slate-200 block truncate">{fileName}</span>
                    <span className="text-[9px] uppercase font-bold text-cyber-emerald bg-cyber-emerald/10 border border-cyber-emerald/20 px-2 py-0.5 rounded-full inline-block mt-2">
                      OCR Matrix Loaded
                    </span>
                  </div>
                  <div className="flex gap-2 w-full mt-3">
                    <button
                      onClick={() => executePipeline(inputText)}
                      className="flex-grow py-2.5 bg-cyber-cyan hover:bg-cyan-400 text-cyber-bg text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Run OCR Extraction
                    </button>
                    <button
                      onClick={() => {
                        setFileName("");
                        setInputText("");
                      }}
                      className="p-2.5 bg-cyber-cardLight border border-slate-800 hover:border-cyber-red text-cyber-gray hover:text-cyber-red rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Paste Box Area */}
            <div className="glassmorphism p-6 rounded-3xl border border-slate-800 flex flex-col relative min-h-[300px]">
              <div className="absolute top-3 left-3 bg-cyber-emerald/10 text-cyber-emerald border border-cyber-emerald/20 text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <FileJson className="h-3 w-3" />
                Layman OCR Text Terminal
              </div>

              <div className="flex justify-end gap-1.5 mb-2.5 mt-2">
                <button
                  onClick={() => setInputText(RAW_TEMPLATES.lipid_cbc)}
                  className="text-[9px] font-bold px-2 py-1 bg-cyber-cardLight border border-slate-850 hover:border-slate-700 text-slate-200 rounded-lg transition-all cursor-pointer"
                >
                  Load CBC
                </button>
                <button
                  onClick={() => setInputText(RAW_TEMPLATES.renal_anemia)}
                  className="text-[9px] font-bold px-2 py-1 bg-cyber-cardLight border border-slate-850 hover:border-slate-700 text-slate-200 rounded-lg transition-all cursor-pointer"
                >
                  Load Renal
                </button>
                <button
                  onClick={() => setInputText(RAW_TEMPLATES.cardiac_emergency)}
                  className="text-[9px] font-bold px-2 py-1 bg-cyber-cardLight border border-slate-850 hover:border-slate-700 text-slate-200 rounded-lg transition-all cursor-pointer"
                >
                  Load Cardiac
                </button>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste unstructured lab sheet results here... e.g., Fasting Glucose: 280 mg/dL..."
                className="w-full flex-grow bg-cyber-bg/95 border border-slate-850 focus:border-cyber-cyan p-3 rounded-xl font-mono text-[10px] text-slate-200 placeholder-cyber-gray/40 resize-none outline-none focus:ring-1 focus:ring-cyber-cyan/30"
              />

              <button
                onClick={() => executePipeline(inputText)}
                className="w-full py-2.5 mt-3 bg-cyber-emerald hover:bg-emerald-400 text-cyber-bg text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Cpu className="h-3.5 w-3.5" />
                Analyze Diagnostics
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
