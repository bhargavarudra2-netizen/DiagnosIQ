import React from 'react';
import { Activity, ShieldCheck, Heart, Apple, Sparkles, Stethoscope, Printer, FileText } from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   DIAGNOSIQ PRINTABLE ACTION PLAN — Dark wrapper, White printable paper
   ══════════════════════════════════════════════════════════ */

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
      
      {/* Non-print controls header bar */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 flex items-center justify-between no-print animate-fade-in">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2" style={{ fontFamily: 'Geist, sans-serif' }}>
            <Printer className="h-4.5 w-4.5 text-diag-cyan" />
            Clinical Action Plan Ledger
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Formatted specifically for white paper prints or local PDF exports
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="btn-secondary text-[10px] py-1.5 px-3 uppercase tracking-wider font-bold"
          >
            Dashboard
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary text-[10px] py-1.5 px-3.5 uppercase tracking-wider font-bold"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Ledger
          </button>
        </div>
      </div>

      {/* Main Printable Clinical Sheet (always white bg for optimal printing!) */}
      <div className="bg-white text-slate-900 p-8 rounded-2xl border border-slate-200 shadow-2xl max-w-3xl mx-auto w-full print-card font-sans">
        
        {/* Printable Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-cyan-900">
              <Sparkles className="h-5.5 w-5.5 text-cyan-600 fill-cyan-100" />
              <h1 className="text-xl font-black tracking-tight font-sans">DIAGNOSIQ HEALTH</h1>
            </div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-sans mt-0.5">
              Clinical AI Preventative Intelligence Report
            </p>
          </div>
          
          <div className="text-right text-[11px] text-slate-500 font-semibold font-mono">
            <p><strong>Ref Code:</strong> DIQ-2026-{Math.floor(Math.random() * 9000 + 1000)}</p>
            <p><strong>Processed:</strong> {report_date}</p>
          </div>
        </div>

        {/* Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-5 border-b border-slate-200 text-xs">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Patient Details</span>
            <p className="font-extrabold text-slate-800 mt-0.5 text-sm">{patient_name}</p>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Tested Panel</span>
            <p className="font-extrabold text-slate-800 mt-0.5 text-sm">{report_type}</p>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Physiology Clearance</span>
              <p className={`font-extrabold mt-0.5 text-sm uppercase ${getRiskColor(overall_risk)}`}>
                {overall_risk} Risk
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-center min-w-[70px]">
              <span className="text-[8px] uppercase font-bold text-slate-400 block leading-tight">Index</span>
              <span className="text-base font-black text-slate-800 font-mono leading-none">{overall_score}</span>
            </div>
          </div>
        </div>

        {/* Narrative Summaries */}
        <div className="py-5 border-b border-slate-200">
          <h3 className="text-[11px] uppercase font-extrabold text-slate-400 tracking-widest flex items-center gap-1.5 mb-3.5">
            <FileText className="h-4 w-4 text-cyan-600" />
            1. Clinical Narratives
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Layperson Interpretation</span>
              <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                {summary_patient}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Physician Clinical Overview</span>
              <p className="text-[11px] text-slate-700 leading-relaxed font-bold">
                {summary_doctor}
              </p>
            </div>
          </div>
        </div>

        {/* Biomarkers Table */}
        <div className="py-5 border-b border-slate-200">
          <h3 className="text-[11px] uppercase font-extrabold text-slate-400 tracking-widest flex items-center gap-1.5 mb-3.5">
            <Activity className="h-4 w-4 text-cyan-600" />
            2. Laboratory Biomarker Metrics
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[9px]">
                  <th className="py-2 px-3 rounded-l">Biomarker</th>
                  <th className="py-2 px-3">Tested Assay</th>
                  <th className="py-2 px-3">Reference normal</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 rounded-r">Class Taxonomy</th>
                </tr>
              </thead>
              <tbody>
                {biomarkers.map((bm, index) => {
                  const isNormal = bm.status === 'normal';
                  return (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{bm.name}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                        {bm.value} {bm.unit}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{bm.normal_range}</td>
                      <td className="py-2.5 px-3 capitalize font-bold">
                        <span className={isNormal ? 'text-emerald-600' : bm.status === 'critical' ? 'text-red-600' : 'text-amber-500'}>
                          {bm.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[9px] text-cyan-800 font-semibold uppercase">{bm.clinical_term}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Care Action Plans */}
        <div className="py-5">
          <h3 className="text-[11px] uppercase font-extrabold text-slate-400 tracking-widest flex items-center gap-1.5 mb-3.5">
            <ShieldCheck className="h-4 w-4 text-cyan-600" />
            3. Targeted Care Protocols
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* Nutritional plan */}
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/20">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2.5 border-b pb-1.5">
                <Apple className="h-3.5 w-3.5 text-emerald-500" />
                Target Nutritional Directives
              </h4>
              <ul className="list-disc list-inside flex flex-col gap-1.5 text-slate-600 font-semibold">
                {action_plan.diet.map((item, idx) => (
                  <li key={idx} className="leading-snug">{item}</li>
                ))}
                <li>Stay fully hydrated. Restrict self-supplementation during recovery.</li>
              </ul>
            </div>

            {/* Lifestyle and Consultations */}
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/20 flex flex-col gap-4">
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2.5 border-b pb-1.5">
                  <Heart className="h-3.5 w-3.5 text-red-500" />
                  Lifestyle Adjustments
                </h4>
                <ul className="list-disc list-inside flex flex-col gap-1 text-slate-600 font-semibold">
                  {action_plan.lifestyle.map((item, idx) => (
                    <li key={idx} className="leading-snug">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2">
                <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[8px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" /> Specialist
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">{action_plan.specialist}</p>
                </div>
                <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[8px] uppercase font-bold text-slate-400 block">Care Urgency</span>
                  <p className="font-bold text-red-600 mt-0.5">{action_plan.urgency}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Disclaimer print footer */}
        <div className="border-t border-slate-200 pt-5 mt-5 text-[8.5px] text-slate-400 text-center leading-relaxed">
          <p>
            <strong>Disclaimer Note:</strong> DiagnosIQ provides deterministic ranges checks and AI summarized insights for preventive clinical risk indexing. It does not constituent a legal diagnostic blueprint. Speak directly with consulting physicians or local specialists for structured emergency evaluations.
          </p>
          <p className="mt-1 font-bold text-slate-300">Aegis AI Corp © 2026. All rights validated.</p>
        </div>

      </div>
    </div>
  );
}
