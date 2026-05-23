import React, { useState } from 'react';
import {
  Volume2, VolumeX, Eye, User, Calendar, ShieldAlert, Sparkles,
  Printer, AlertTriangle, TrendingUp
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   RISK DASHBOARD — Clinical Light Theme
   ══════════════════════════════════════════════════════════ */

const statusBadge = (status) => {
  if (status === 'critical') return 'badge-critical';
  if (status === 'warning')  return 'badge-warning';
  return 'badge-normal';
};

const gaugeColor = (score) => {
  if (score < 40) return '#EF4444';
  if (score < 80) return '#F59E0B';
  return '#22C55E';
};

export default function RiskDashboard({ reportData, selectedOrgan, onSelectOrgan, onPrintPlan, onShowTrends }) {
  const [mode, setMode] = useState('patient');
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

  // SVG gauge
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((overall_score / 100) * circumference);
  const scoreColor = gaugeColor(overall_score);

  const riskLabel = overall_risk === 'critical'
    ? '⚠ Critical Risk' : overall_risk === 'medium'
    ? '⚡ Moderate Risk' : '✓ Normal';

  return (
    <div className="flex flex-col gap-5">

      {/* ── Patient Header Card ─────────────────────── */}
      <div className="glass-card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
            <User className="h-5.5 w-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-800" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
                {patient_name || 'Anonymous Patient'}
              </h2>
              <span className={statusBadge(overall_risk)}>
                {riskLabel}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {report_date}
              </span>
              <span className="h-1 w-1 bg-slate-200 rounded-full" />
              <span>{report_type}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode switcher */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setMode('patient')}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'patient'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Explain Simply
            </button>
            <button
              onClick={() => setMode('doctor')}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'doctor'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <ShieldAlert className="h-3 w-3" />
              Clinical Mode
            </button>
          </div>

          <button
            onClick={onShowTrends}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Trends
          </button>

          <button
            onClick={onPrintPlan}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* ── Score Gauge + AI Summary ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Health Score Ring */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
            <Sparkles className="h-2.5 w-2.5" />
            Vitalis Score
          </div>

          {/* SVG Ring */}
          <div className="relative h-28 w-28 flex items-center justify-center mt-4">
            <svg className="w-full h-full" viewBox="0 0 110 110">
              {/* Track */}
              <circle cx="55" cy="55" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="9" />
              {/* Progress */}
              <circle
                cx="55" cy="55" r={radius} fill="none"
                strokeWidth="9"
                stroke={scoreColor}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 55 55)"
                style={{ transition: 'stroke-dashoffset 1.2s ease' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black" style={{ color: scoreColor, fontFamily: 'Outfit, sans-serif' }}>
                {overall_score}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Health Index
              </span>
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-700 mt-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {overall_score >= 80 ? 'Optimal Standing' : overall_score >= 50 ? 'Risks Detected' : 'Critical Alert'}
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Across 6 physiological organ systems
          </p>
        </div>

        {/* AI Explanation Panel */}
        <div className="glass-card rounded-2xl p-5 md:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Eye className="h-4 w-4 text-blue-500" />
              {mode === 'patient' ? 'Patient Explanation' : 'Clinical Assessment'}
            </h3>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              AI Confidence: {(ocr_confidence * 100).toFixed(0)}%
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-medium flex-1">
            {mode === 'patient' ? summary_patient : summary_doctor}
          </p>

          {/* TTS Controls */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-blue-400" />
              Read aloud:
            </span>
            <div className="flex gap-2">
              {[
                { lang: 'en', label: '🇬🇧 English' },
                { lang: 'hi', label: '🇮🇳 Hindi' },
              ].map(({ lang, label }) => (
                <button
                  key={lang}
                  onClick={() => handleSpeak(lang)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                    activeLanguage === lang
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 border border-slate-200 hover:border-blue-300 text-slate-600'
                  }`}
                >
                  {activeLanguage === lang
                    ? <VolumeX className="h-3 w-3 animate-pulse" />
                    : <Volume2 className="h-3 w-3" />
                  }
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Emergency Alert Cards ────────────────────── */}
      {emergency_flags && emergency_flags.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="pulse-dot" /> Critical Flags Requiring Immediate Attention
          </h3>
          {emergency_flags.map((flag, i) => (
            <div key={i} className="alert-red rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-800">{flag.marker}</span>
                  <span className="text-sm font-black text-red-600">{flag.value} {flag.unit}</span>
                </div>
                <p className="text-xs text-red-600 font-semibold leading-snug">{flag.condition}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Biomarker Table ───────────────────────────── */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <ShieldAlert className="h-4 w-4 text-blue-500" />
              Biomarker Analysis
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {selectedOrgan
                ? `Filtering by: ${selectedOrgan}`
                : 'All parsed biomarkers · Click an organ to filter'}
            </p>
          </div>
          {selectedOrgan && (
            <button
              onClick={() => onSelectOrgan(null)}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Biomarker</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">{mode === 'patient' ? 'What It Means' : 'ICD-10 Clinical Term'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredBiomarkers.map((bm, idx) => {
                const isCritical = bm.status === 'critical';
                const isNormal   = bm.status === 'normal';
                return (
                  <tr
                    key={idx}
                    className={`border-b border-slate-50 text-sm transition-colors ${
                      isCritical ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-blue-50/30'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {bm.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {bm.value}{' '}
                      <span className="text-[10px] text-slate-400 font-sans font-normal">{bm.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">
                      {bm.normal_range}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={statusBadge(bm.status)}>
                        {bm.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${bm.confidence * 100}%`,
                              background: bm.confidence < 0.7 ? '#EF4444' : '#2563EB',
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {(bm.confidence * 100).toFixed(0)}%
                        </span>
                        {bm.confidence < 0.7 && (
                          <AlertTriangle className="h-3 w-3 text-red-400" title="Low OCR confidence" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-[260px]">
                      {mode === 'patient' ? (
                        <span>{bm.plain_english}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-600">{bm.clinical_term}</span>
                          <span className="bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-mono">
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
