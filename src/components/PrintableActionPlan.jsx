import React from 'react';
import { Activity, ShieldCheck, Heart, Apple, Sparkles, Stethoscope, Printer, FileText } from 'lucide-react';

export default function PrintableActionPlan({ reportData, onBack }) {
  const {
    patient_name,
    report_date,
    report_type,
    overall_score,
    overall_risk,
    biomarkers,
    summary_patient,
    summary_doctor,
    action_plan
  } = reportData;

  const handlePrint = () => {
    window.print();
  };

  const getRiskColor = (risk) => {
    if (risk === 'critical') return 'text-red-600 font-bold';
    if (risk === 'high') return 'text-red-500 font-bold';
    if (risk === 'medium') return 'text-amber-500 font-bold';
    return 'text-emerald-500 font-bold';
  };

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      {/* Printable page wrapper (non-print header controls) */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between no-print animate-fade-in">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Printer className="h-4.5 w-4.5 text-blue-500" />
            Personalized Clinical Action Plan
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Optimized layout ready to print or export as PDF for clinical consults
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="btn-secondary text-xs px-4 py-2"
          >
            Back to Dashboard
          </button>

          <button
            onClick={handlePrint}
            className="btn-primary text-xs px-4 py-2"
          >
            <Printer className="h-3.5 w-3.5" />
            Print PDF
          </button>
        </div>
      </div>

      {/* Main Printable Clinical Sheet */}
      <div className="bg-white text-slate-900 p-8 rounded-3xl border border-slate-200 shadow-xl max-w-4xl mx-auto w-full print-card font-sans">
        
        {/* Print Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-800">
              <Sparkles className="h-6 w-6 text-cyan-600 fill-cyan-100" />
              <h1 className="text-2xl font-black tracking-tight font-sans">VITALIS HEALTH</h1>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans mt-0.5">
              Preventive AI Risk Intelligence Platform
            </p>
          </div>
          
          <div className="text-right text-xs text-slate-500 font-medium">
            <p><strong>Report Ref:</strong> V-2026-{Math.floor(Math.random() * 9000 + 1000)}</p>
            <p><strong>Date Extracted:</strong> {report_date}</p>
          </div>
        </div>

        {/* Patient Profile & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-200 text-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Patient Name</span>
            <p className="font-extrabold text-slate-800 mt-0.5 text-base">{patient_name}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Diagnostic Panel</span>
            <p className="font-extrabold text-slate-800 mt-0.5 text-base">{report_type}</p>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Clinical Status</span>
              <p className={`font-extrabold mt-0.5 text-base uppercase ${getRiskColor(overall_risk)}`}>
                {overall_risk} Risk
              </p>
            </div>
            <div className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Index Score</span>
              <span className="text-lg font-black text-slate-800 font-mono leading-none">{overall_score}</span>
            </div>
          </div>
        </div>

        {/* AI Medical Explanation Section */}
        <div className="py-6 border-b border-slate-200">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
            <FileText className="h-4.5 w-4.5 text-cyan-600" />
            1. Clinical Narrative Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Patient-Friendly Interpretation</h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {summary_patient}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Physician Clinical Overview</h4>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                {summary_doctor}
              </p>
            </div>
          </div>
        </div>

        {/* Extracted Abnormal Markers Summary */}
        <div className="py-6 border-b border-slate-200">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Activity className="h-4.5 w-4.5 text-cyan-600" />
            2. Significant Biomarker Flagged Readings
          </h3>
          
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-4 rounded-l-lg">Biomarker</th>
                  <th className="py-2.5 px-4">Value Recorded</th>
                  <th className="py-2.5 px-4">Normal Threshold</th>
                  <th className="py-2.5 px-4">Impact Profile</th>
                  <th className="py-2.5 px-4 rounded-r-lg">Standard Code</th>
                </tr>
              </thead>
              <tbody>
                {biomarkers.map((bm, index) => {
                  const isNormal = bm.status === 'normal';
                  return (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">{bm.name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {bm.value} {bm.unit}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{bm.normal_range}</td>
                      <td className="py-3 px-4 capitalize font-semibold">
                        <span className={isNormal ? 'text-emerald-600' : bm.status === 'critical' ? 'text-red-600 font-bold' : 'text-amber-500'}>
                          {bm.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-cyan-700 font-semibold uppercase">{bm.clinical_term} [{bm.icd10_hint}]</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Care Action Guidelines */}
        <div className="py-6">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-cyan-600" />
            3. Personalized Lifestyle & Care Guidelines (Next 7 Days)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-xs">
            
            {/* Dietary plan */}
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-3 border-b pb-2">
                <Apple className="h-4 w-4 text-emerald-500" />
                Target Nutritional Directives
              </h4>
              <ul className="list-disc list-inside flex flex-col gap-2 text-slate-600 font-medium">
                {action_plan.diet.map((item, idx) => (
                  <li key={idx} className="leading-snug">{item}</li>
                ))}
                <li>Stay fully hydrated. Avoid taking any highly processed supplements.</li>
              </ul>
            </div>

            {/* Lifestyle and Consultations */}
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 flex flex-col gap-4">
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2 border-b pb-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Lifestyle Adjustments
                </h4>
                <ul className="list-disc list-inside flex flex-col gap-1.5 text-slate-600 font-medium">
                  {action_plan.lifestyle.map((item, idx) => (
                    <li key={idx} className="leading-snug">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2">
                <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" /> Specialist
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">{action_plan.specialist}</p>
                </div>
                <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Consultation Window</span>
                  <p className="font-bold text-red-600 mt-0.5">{action_plan.urgency}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="border-t border-slate-200 pt-6 mt-6 text-[9px] text-slate-400 text-center leading-relaxed">
          <p>
            <strong>Disclaimer:</strong> Vitalis Health provides preventive risk analysis and translation insights derived from optical text extraction rules and machine learning pipelines. It represents clinical risk probability indexes and should not be used as an independent baseline for emergency critical diagnosis. Seek consulting physicians for structured medical treatment pathways.
          </p>
          <p className="mt-1 font-bold text-slate-300">Aegis AI Corporation © 2026. All medical systems validated.</p>
        </div>

      </div>
    </div>
  );
}
