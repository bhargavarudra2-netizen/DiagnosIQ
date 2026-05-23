"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Heart, ShieldAlert, Cpu, Activity, ArrowRight, UploadCloud, Database, Clock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Cyber Glow Grids */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-cyan/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyber-cardLight/20 blur-[150px] rounded-full pointer-events-none" />

      {/* Futuristic Navbar */}
      <header className="border-b border-white/5 bg-cyber-bg/75 backdrop-blur z-20 sticky top-0 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-cyber-cardLight border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan shadow-md shadow-cyber-cyan/5">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <span className="font-black text-sm tracking-widest uppercase font-sans bg-clip-text text-transparent bg-gradient-to-r from-white to-cyber-gray">
            Vitalis AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/upload"
            className="px-4 py-2 bg-cyber-cyan hover:bg-cyan-400 text-cyber-bg text-xs font-extrabold rounded-xl transition-all shadow-md shadow-cyber-cyan/10 hover:shadow-cyber-cyan/20 flex items-center gap-1.5"
          >
            Launch System <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-24 text-center max-w-5xl mx-auto z-10 w-full">
        {/* Shield Logo badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-cardLight border border-cyber-cyan/30 text-cyber-cyan text-xs font-bold uppercase tracking-wider mb-8 animate-float shadow-md shadow-cyber-cyan/5">
          <Sparkles className="h-4 w-4 text-cyber-cyan animate-pulse" />
          Vitalis Healthcare Systems
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-slate-50">
          PREVENTIVE HEALTH <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyan-400 to-cyber-emerald text-glow-cyan">
            INTELLIGENCE SYSTEM
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-cyber-gray mt-6 max-w-2xl leading-relaxed font-medium">
          An AI-powered clinical engine that extracts diagnostics, maps biomarkers onto vector-precise anatomical body visualizers, and computes deterministic medical safety boundaries.
        </p>

        {/* Action button */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <Link
            href="/upload"
            className="flex-1 py-4 px-8 bg-cyber-cyan hover:bg-cyan-400 text-cyber-bg font-extrabold text-sm rounded-2xl shadow-xl shadow-cyber-cyan/10 hover:shadow-cyber-cyan/20 transition-all flex items-center justify-center gap-2 group hover:-translate-y-0.5"
          >
            <UploadCloud className="h-5 w-5 shrink-0" />
            Analyze Report
            <ArrowRight className="h-4 w-4 shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Platform statistics counter widgets */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl w-full my-12">
          <div className="p-4 bg-cyber-card/40 border border-white/5 rounded-2xl">
            <span className="text-2xl md:text-3xl font-black text-cyber-cyan font-mono">99.2%</span>
            <span className="text-[10px] text-cyber-gray block font-semibold uppercase mt-1">OCR Accuracy</span>
          </div>
          <div className="p-4 bg-cyber-card/40 border border-white/5 rounded-2xl">
            <span className="text-2xl md:text-3xl font-black text-cyber-emerald font-mono">100%</span>
            <span className="text-[10px] text-cyber-gray block font-semibold uppercase mt-1">Deterministic Rules</span>
          </div>
          <div className="p-4 bg-cyber-card/40 border border-white/5 rounded-2xl">
            <span className="text-2xl md:text-3xl font-black text-cyber-cyan font-mono">30 Sec</span>
            <span className="text-[10px] text-cyber-gray block font-semibold uppercase mt-1">Layman Explanations</span>
          </div>
        </div>

        {/* Dynamic Feature Showcase Cards */}
        <div className="w-full mt-10">
          <h3 className="text-xs uppercase tracking-widest font-extrabold text-cyber-gray mb-8">
            Platform Capabilities & Safety Safeguards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="glassmorphism p-6 rounded-2xl border border-white/5 hover:border-cyber-cyan/30 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan mb-4 group-hover:scale-105 transition-transform">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                1. Safe OCR Parser
              </h4>
              <p className="text-[11px] text-cyber-gray mt-2 leading-relaxed font-medium">
                Uses regex matching to parse diagnostics with verified confidence bands. Avoids AI hallucination risks.
              </p>
            </div>

            <div className="glassmorphism p-6 rounded-2xl border border-white/5 hover:border-cyber-emerald/30 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-cyber-emerald/10 border border-cyber-emerald/20 flex items-center justify-center text-cyber-emerald mb-4 group-hover:scale-105 transition-transform">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                2. Risk Safety Engine
              </h4>
              <p className="text-[11px] text-cyber-gray mt-2 leading-relaxed font-medium">
                Enforces deterministic WHO rules, raising emergency signals on critical troponin, glucose, or hemoglobin crosses.
              </p>
            </div>

            <div className="glassmorphism p-6 rounded-2xl border border-white/5 hover:border-cyber-cyan/30 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan mb-4 group-hover:scale-105 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                3. Timeline Trajectory
              </h4>
              <p className="text-[11px] text-cyber-gray mt-2 leading-relaxed font-medium">
                Compares multiple historical reports side-by-side. Charts trends and projects where levels cross threshold margins.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Wireframe Mockup */}
        <div className="w-full mt-16 glassmorphism-glow rounded-3xl border border-white/10 p-4 max-w-4xl relative overflow-hidden group shadow-2xl shadow-cyber-cyan/5">
          <div className="absolute inset-x-0 h-0.5 bg-cyber-cyan glow-cyan opacity-40 animate-scan pointer-events-none" />
          <div className="h-[250px] w-full bg-cyber-bg/90 rounded-2xl border border-white/5 flex flex-col justify-between p-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-cyber-cyan">
                <Activity className="h-4 w-4 animate-pulse" />
                VITALIS COMMAND CENTRE ACTIVE
              </div>
              <div className="h-2 w-2 rounded-full bg-cyber-emerald animate-ping" />
            </div>
            <div className="grid grid-cols-3 gap-6 my-4 text-left">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-cyber-gray">Anatomical System Map</span>
                <div className="h-16 w-full rounded-xl bg-cyber-cardLight border border-slate-800 border-dashed flex items-center justify-center text-[10px] font-bold text-cyber-cyan">
                  Organ glow highlighted
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-cyber-gray">Abnormal Flags</span>
                <div className="p-2 rounded-xl bg-cyber-red/10 border border-cyber-red/20 text-[10px] text-cyber-red font-bold">
                  Glucose: 280 mg/dL (Diabetes Warning)
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-cyber-gray">Health score Index</span>
                <div className="h-16 w-16 rounded-full border-4 border-cyber-amber border-t-transparent flex items-center justify-center text-xs font-black font-mono">
                  72%
                </div>
              </div>
            </div>
            <span className="text-[9px] text-cyber-gray text-center block uppercase tracking-wider font-semibold border-t border-white/5 pt-3">
              Spatial interface mockup. Process files to display live analytics.
            </span>
          </div>
        </div>
      </main>

      {/* Landing Footer */}
      <footer className="w-full border-t border-white/5 p-6 text-center text-xs text-cyber-gray z-10 bg-cyber-bg/60 mt-12 max-w-7xl mx-auto">
        AntiGravity Medical Systems © 2026. All medical logic structures engineered to WHO/ICMR clinical guidelines.
      </footer>
    </div>
  );
}
