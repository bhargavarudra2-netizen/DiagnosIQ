import React, { useState } from 'react';
import { Volume2, VolumeX, Eye, User, Calendar, ShieldAlert, Sparkles, Printer, AlertTriangle, HelpCircle } from 'lucide-react';

export default function RiskDashboard({ reportData, selectedOrgan, onSelectOrgan, onPrintPlan, onShowTrends }) {
  const [mode, setMode] = useState('patient'); // 'patient' | 'doctor'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(null); // 'en' | 'hi'

  const {
    patient_name,
    report_date,
    report_type,
    overall_risk,
    ocr_confidence,
    overall_score,
    biomarkers,
    summary_patient,
    summary_doctor,
    action_plan
  } = reportData;

  // Filter biomarkers based on selected organ from anatomical model
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
    
    // Hindi translation overrides for vernacular synthesis demo
    let text = textToSpeak;
    let voiceLang = 'en-US';

    if (lang === 'hi') {
      voiceLang = 'hi-IN';
      text = mode === 'patient' 
        ? `महत्वपूर्ण स्वास्थ्य रिपोर्ट विश्लेषण। आपका स्वास्थ्य स्कोर ${overall_score} है। हृदय की स्थिति पर ध्यान देने की आवश्यकता है। कृपया डॉक्टर से तुरंत परामर्श लें।` 
        : `चिकित्सीय चेतावनी। रोगी में हृदय संबंधी असंतुलन देखा गया है। ग्लूकोज का स्तर तीन सौ दस मिलीग्राम प्रति डेसीलीटर है। तत्काल विशेषज्ञ से सलाह लें।`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang;
    
    // Find matching voice
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(voiceLang));
    if (targetVoice) utterance.voice = targetVoice;

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveLanguage(null);
    };

    setIsSpeaking(true);
    setActiveLanguage(lang);
    window.speechSynthesis.speak(utterance);
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'critical':
        return 'bg-cyber-red/20 text-cyber-red border border-cyber-red/40 animate-pulse font-bold';
      case 'high':
        return 'bg-cyber-red/10 text-cyber-red border border-cyber-red/30';
      case 'medium':
        return 'bg-cyber-amber/10 text-cyber-amber border border-cyber-amber/30';
      default:
        return 'bg-cyber-emerald/10 text-cyber-emerald border border-cyber-emerald/30';
    }
  };

  // Radial Gauge Calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall_score / 100) * circumference;

  const getGaugeColor = (score) => {
    if (score < 40) return 'stroke-cyber-red';
    if (score < 80) return 'stroke-cyber-amber';
    return 'stroke-cyber-emerald';
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Top Header Card */}
      <div className="glassmorphism p-5 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-cyber-cardLight border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan shadow-md shadow-cyber-cyan/10">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-100">{patient_name || "Anonymous Patient"}</h2>
              <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${getRiskBadge(overall_risk)}`}>
                {overall_risk} Risk
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-cyber-gray mt-1">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Date: {report_date}</span>
              <span className="h-1 w-1 bg-slate-700 rounded-full" />
              <span>Type: {report_type}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-cyber-bg border border-slate-700/60 p-1 rounded-xl">
            <button
              onClick={() => setMode('patient')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'patient'
                  ? 'bg-cyber-cyan text-cyber-bg shadow'
                  : 'text-cyber-gray hover:text-slate-200'
              }`}
            >
              Patient Mode
            </button>
            <button
              onClick={() => setMode('doctor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'doctor'
                  ? 'bg-cyber-cyan text-cyber-bg shadow'
                  : 'text-cyber-gray hover:text-slate-200'
              }`}
            >
              Doctor Mode
            </button>
          </div>

          <button
            onClick={onPrintPlan}
            className="p-2 bg-cyber-cardLight hover:bg-slate-800 text-slate-300 hover:text-cyber-cyan border border-slate-800 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Print action plan"
          >
            <Printer className="h-4 w-4" />
            Print Plan
          </button>
        </div>
      </div>

      {/* Radial Health Gauge and AI Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* radial health gauge card */}
        <div className="glassmorphism p-6 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-3 left-3 bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
            Vitalis Score
          </div>

          {/* Radial Indicator */}
          <div className="relative h-32 w-32 flex items-center justify-center mt-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-800 fill-none"
                strokeWidth="10"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${getGaugeColor(overall_score)}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-100 font-mono text-glow-cyan">{overall_score}</span>
              <span className="text-[10px] text-cyber-gray font-semibold uppercase tracking-wider">Health Index</span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-200">
              {overall_score >= 80 ? 'Optimal Standing' : overall_score >= 50 ? 'Moderate Risks Flagged' : 'Critical Clinical Alert'}
            </h4>
            <p className="text-[11px] text-cyber-gray mt-1 leading-relaxed">
              Calculated across 6 dynamic physiological organ channels.
            </p>
          </div>
        </div>

        {/* Explanations & Vernacular TTS Panel */}
        <div className="glassmorphism p-6 rounded-2xl border border-slate-800/80 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyber-cyan flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {mode === 'patient' ? 'AI Diagnostic Explanation' : 'Clinical Assessment Insight'}
              </h3>
              <div className="text-[10px] text-cyber-emerald bg-cyber-emerald/10 border border-cyber-emerald/20 px-2 py-0.5 rounded-full font-semibold">
                AI Confidence: {(ocr_confidence * 100).toFixed(0)}%
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {mode === 'patient' ? summary_patient : summary_doctor}
            </p>
          </div>

          {/* Multilingual Audio TTS Selector */}
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-cyber-gray flex items-center gap-1.5 font-medium">
              <Volume2 className="h-4 w-4 text-cyber-cyan" />
              Speak Health Summary aloud:
            </span>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleSpeak('en')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  activeLanguage === 'en'
                    ? 'bg-cyber-cyan text-cyber-bg font-extrabold shadow'
                    : 'bg-cyber-cardLight border border-slate-850 hover:border-slate-700 text-slate-200'
                }`}
              >
                {activeLanguage === 'en' ? <VolumeX className="h-3.5 w-3.5 animate-pulse" /> : <Volume2 className="h-3.5 w-3.5" />}
                English Readout
              </button>
              <button
                onClick={() => handleSpeak('hi')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  activeLanguage === 'hi'
                    ? 'bg-cyber-cyan text-cyber-bg font-extrabold shadow'
                    : 'bg-cyber-cardLight border border-slate-850 hover:border-slate-700 text-slate-200'
                }`}
              >
                {activeLanguage === 'hi' ? <VolumeX className="h-3.5 w-3.5 animate-pulse" /> : <Volume2 className="h-3.5 w-3.5" />}
                Hindi (हिन्दी)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Biomarkers Grid */}
      <div className="glassmorphism p-6 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-md font-bold text-slate-200 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-cyber-cyan" />
              Extracted Biomarker Analysis
            </h3>
            <p className="text-xs text-cyber-gray mt-0.5">
              {selectedOrgan 
                ? `Showing active parameters for ${selectedOrgan.toUpperCase()}` 
                : 'Showing all parsed bio-markers. Click any organ in the body map to filter.'}
            </p>
          </div>

          {selectedOrgan && (
            <button 
              onClick={() => onSelectOrgan(null)}
              className="text-xs text-cyber-cyan hover:underline font-semibold"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-xs text-cyber-gray font-bold uppercase">
                <th className="py-3 px-4">Biomarker</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Reference Range</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">
                  {mode === 'patient' ? 'Layperson Meaning' : 'ICD-10 Clinical Term'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBiomarkers.map((bm, index) => {
                const isNormal = bm.status === 'normal';
                const isCritical = bm.status === 'critical';
                
                return (
                  <tr 
                    key={index}
                    className="border-b border-slate-850 hover:bg-cyber-cardLight/30 transition-colors text-sm"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      {bm.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-200">
                      {bm.value} <span className="text-[10px] text-cyber-gray font-sans font-medium">{bm.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-cyber-gray font-mono">
                      {bm.normal_range}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isCritical ? 'bg-cyber-red/20 text-cyber-red border-cyber-red/30 animate-pulse' :
                        isNormal ? 'bg-cyber-emerald/10 text-cyber-emerald border-cyber-emerald/20' :
                        'bg-cyber-amber/10 text-cyber-amber border-cyber-amber/20'
                      }`}>
                        {bm.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${bm.confidence < 0.7 ? 'bg-cyber-red' : 'bg-cyber-cyan'}`}
                            style={{ width: `${bm.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold font-mono text-cyber-gray">
                          {(bm.confidence * 100).toFixed(0)}%
                        </span>
                        {bm.confidence < 0.7 && (
                          <AlertTriangle className="h-3.5 w-3.5 text-cyber-red" title="Low OCR confidence. Cross check physically." />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300 max-w-[280px]">
                      {mode === 'patient' ? (
                        <span>{bm.plain_english}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-cyber-cyan">{bm.clinical_term}</span>
                          <span className="bg-slate-800 border border-slate-700/60 px-1.5 py-0.5 rounded text-[10px] text-cyber-gray font-mono">
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
