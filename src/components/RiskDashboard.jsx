import React, { useState } from 'react';
import {
  Volume2, VolumeX, Eye, User, Calendar, ShieldAlert, Sparkles,
  Printer, AlertTriangle, TrendingUp, Check, Save
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   RISK DASHBOARD — Enterprise Dark Mode
   ══════════════════════════════════════════════════════════ */

const statusBadge = (status) => {
  if (status === 'critical') return 'badge-critical';
  if (status === 'warning')  return 'badge-warning';
  return 'badge-normal';
};

const gaugeColor = (score) => {
  if (score < 40) return '#EF4444'; // Red
  if (score < 80) return '#F59E0B'; // Amber
  return '#10B981'; // Emerald
};

export default function RiskDashboard({ reportData, selectedOrgan, onSelectOrgan, onPrintPlan, onShowTrends, onSaveReport, isSaved }) {
  const [mode, setMode] = useState('patient'); // 'patient' | 'doctor'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(null);

  const {
    patient_name, report_date, report_type,
    overall_risk, ocr_confidence, overall_score,
    biomarkers, summary_patient, summary_doctor,
    action_plan, emergency_flags
  } = reportData;

  const filteredBiomarkers = selectedOrgan
    ? biomarkers.filter(b => b.affected_organ === selectedOrgan)
    : biomarkers;

  const handleSpeak = (lang) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveLanguage(null);
      return;
      }
      const textToSpeak = mode === 'patient' ? summary_patient : summary_doctor;
      let text = textToSpeak;
      let voiceLang = 'en-US';
      if (lang === 'hi') {
        voiceLang = 'hi-IN';
        text = `महत्वपूर्ण स्वास्थ्य रिपोर्ट विश्लेषण। आपका स्वास्थ्य स्कोर ${overall_score} है। कृपया डॉक्टर से तुरंत परामर्श लें।`;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLang;
      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(v => v.lang.startsWith(voiceLang));
      if (targetVoice) utterance.voice = targetVoice;
      utterance.onend = () => { setIsSpeaking(false); setActiveLanguage(null); };
      setIsSpeaking(true);
      setActiveLanguage(lang);
      window.speechSynthesis.speak(utterance);
    };

  // Circular gauge mathematics
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((overall_score / 100) * circumference);
  const scoreColor = gaugeColor(overall_score);

  const riskLabel = overall_risk === 'critical'
    ? 'Critical Alert' : overall_risk === 'medium'
    ? 'Moderate Warning' : 'Cleared';

  return (
    <div className="flex flex-col gap-6">

      {/* ── Sub Header Dashboard Toolbar ───────────────── */}
      <div className="glass-card rounded-2xl p-4 border border-white/5 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-diag-cyan/5 border border-diag-cyan/15 flex items-center justify-center text-diag-cyan">
            <User className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100" style={{ fontFamily: 'Geist, sans-serif' }}>
              {patient_name || 'Anonymous Patient'}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span>{report_type}</span>
              <span className="h-1 w-1 bg-white/10 rounded-full" />
              <span>OCR Match: {(ocr_confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Conversational Explanation switches */}
          <div className="flex bg-white/[0.02] p-0.5 rounded-xl border border-white/5">
            <button
              onClick={() => setMode('patient')}
              className={`px-3 py-1 rounded-[8px] text-[10px] font-bold transition-all uppercase tracking-wider ${
                mode === 'patient'
                  ? 'bg-white/10 text-diag-cyan shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Layman Explanation
            </button>
            <button
              onClick={() => setMode('doctor')}
              className={`px-3 py-1 rounded-[8px] text-[10px] font-bold transition-all uppercase tracking-wider ${
                mode === 'doctor'
                  ? 'bg-white/10 text-diag-cyan shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Doctor Assessment
            </button>
          </div>

          <button
            onClick={onSaveReport}
            disabled={isSaved}
            className={`btn-secondary text-[10px] py-1.5 px-3 uppercase tracking-wider flex items-center gap-1 transition-all ${
              isSaved
                ? 'bg-diag-emeraldSoft border-diag-emerald/25 text-diag-emerald cursor-default hover:bg-diag-emeraldSoft hover:border-diag-emerald/25'
                : 'hover:border-diag-cyan/30 text-slate-300 hover:text-diag-cyan'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Report
              </>
            )}
          </button>

          <button
            onClick={onShowTrends}
            className="btn-secondary text-[10px] py-1.5 px-3 uppercase tracking-wider flex items-center gap-1"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Trends
          </button>

          <button
            onClick={onPrintPlan}
            className="btn-secondary text-[10px] py-1.5 px-3 uppercase tracking-wider flex items-center gap-1"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* ── Score Circular Gauge & AI Narrative ──────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Premium Health Score circular gauge */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-diag-cyan/5 text-diag-cyan border border-diag-cyan/15 text-[8px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
            <Sparkles className="h-2.5 w-2.5" />
            Health Index
          </div>

          {/* Sleek SVG Ring */}
          <div className="relative h-28 w-28 flex items-center justify-center mt-4">
            <svg className="w-full h-full p-0.5" viewBox="0 0 110 110">
              {/* Back circle track */}
              <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="6" />
              {/* Active animated stroke */}
              <circle
                cx="55" cy="55" r={radius} fill="none"
                strokeWidth="6"
                stroke={scoreColor}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 55 55)"
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-100" style={{ color: scoreColor, fontFamily: 'JetBrains Mono, monospace' }}>
                {overall_score}
              </span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                INTEGRITY
              </span>
            </div>
          </div>

          <h4 className="text-xs font-bold text-slate-200 mt-4 uppercase tracking-wider" style={{ fontFamily: 'Geist, sans-serif' }}>
            {overall_score >= 80 ? 'Optimal Physiology' : overall_score >= 50 ? 'Mild Deviancy' : 'Critical Warning'}
          </h4>
          <p className="text-[10px] text-slate-400 mt-1 leading-normal max-w-[150px]">
            Systemic health metrics across 6 physiological organ pathways
          </p>
        </div>

        {/* AI summary block styled like Notion AI */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-white/[0.04]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-diag-cyan" />
              {mode === 'patient' ? 'AI Layman Explanation' : 'Clinical Medical Assessment'}
            </span>
            <span className="text-[9px] font-bold text-diag-cyan bg-diag-cyan/5 border border-diag-cyan/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              DiagnosIQ Synthesis
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium flex-1">
            {mode === 'patient' ? summary_patient : summary_doctor}
          </p>

          {/* TTS reads aloud panel */}
          <div className="mt-4 pt-3.5 border-t border-white/[0.04] flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-diag-cyan" />
              Listen to analysis:
            </span>
            <div className="flex gap-2 animate-fade-in">
              {[
                { lang: 'en', label: '🇬🇧 English Voice' },
                { lang: 'hi', label: '🇮🇳 हिन्दी Voice' },
              ].map(({ lang, label }) => (
                <button
                  key={lang}
                  onClick={() => handleSpeak(lang)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                    activeLanguage === lang
                      ? 'bg-diag-cyan text-diag-navy'
                      : 'bg-white/5 border border-white/5 hover:border-diag-cyan/30 text-slate-300 hover:text-diag-cyan'
                  }`}
                >
                  {activeLanguage === lang ? (
                    <VolumeX className="h-3 w-3 animate-pulse" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Deterministic Critical Range Warnings ─────── */}
      {emergency_flags && emergency_flags.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-diag-red uppercase tracking-widest flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-diag-red animate-pulse" />
            Deterministic range alarms triggered
          </span>
          {emergency_flags.map((flag, idx) => (
            <div key={idx} className="glass-card-red rounded-xl p-4 flex items-start gap-3 border border-diag-red/20 bg-diag-redSoft/10">
              <ShieldAlert className="h-5 w-5 text-diag-red shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-200">{flag.marker}</span>
                  <span className="text-xs font-black text-diag-red font-mono">{flag.value} {flag.unit}</span>
                  <span className="text-[9px] font-semibold text-slate-400 font-mono">(Reference normal: {flag.normal_range || 'N/A'})</span>
                </div>
                <p className="text-[11px] text-diag-red font-semibold leading-normal mt-1">{flag.condition} - {flag.recommendation || 'Consult clinician.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Biomarker Analytics Table ───────────────── */}
      <div className="glass-card rounded-2xl p-5 border border-white/5">
        
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 animate-fade-in" style={{ fontFamily: 'Geist, sans-serif' }}>
              <ShieldAlert className="h-4 w-4 text-diag-cyan" />
              Biomarker Laboratory Assay
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
              {selectedOrgan
                ? `System Focus Filter: ${selectedOrgan}`
                : 'Complete chronological panel metrics'}
            </p>
          </div>
          {selectedOrgan && (
            <button
              onClick={() => onSelectOrgan(null)}
              className="text-[10px] font-bold text-diag-cyan hover:underline uppercase tracking-wider focus:outline-none"
            >
              Clear Filter [x]
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/20">
                <th className="py-3 px-4">Biomarker</th>
                <th className="py-3 px-4">Tested Assay</th>
                <th className="py-3 px-4">Normal Bounds</th>
                <th className="py-3 px-4">Pipeline Status</th>
                <th className="py-3 px-4">Extraction Conf.</th>
                <th className="py-3 px-4">{mode === 'patient' ? 'Layman Interpretation' : 'ICD-10 Taxonomy Classification'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredBiomarkers.map((bm, idx) => {
                const isCritical = bm.status === 'critical';
                return (
                  <tr
                    key={idx}
                    className={`border-b border-white/[0.02] text-xs transition-colors ${
                      isCritical ? 'bg-diag-redSoft/5 hover:bg-diag-redSoft/10' : 'hover:bg-white/[0.01]'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-200">
                      {bm.name}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-300">
                      {bm.value}{' '}
                      <span className="text-[9px] text-slate-500 font-sans font-normal">{bm.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-[10px] text-slate-400 font-mono">
                      {bm.normal_range}
                    </td>
                    <td className="py-3 px-4">
                      <span className={statusBadge(bm.status)}>
                        {bm.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-slate-900 rounded-full h-1 overflow-hidden">
                          <div
                            className="h-1 rounded-full bg-diag-cyan"
                            style={{ width: `${bm.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-500">
                          {(bm.confidence * 100).toFixed(0)}%
                        </span>
                        {bm.confidence < 0.7 && (
                          <AlertTriangle className="h-3 w-3 text-diag-red animate-pulse" title="Low OCR confidence score" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400 max-w-[280px] leading-relaxed">
                      {mode === 'patient' ? (
                        <span>{bm.plain_english}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-diag-cyan">{bm.clinical_term}</span>
                          <span className="bg-white/5 border border-white/5 text-slate-500 px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wide">
                            {bm.icd10_hint}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
