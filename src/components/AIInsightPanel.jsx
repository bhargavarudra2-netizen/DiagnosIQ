import React, { useState, useEffect, useRef } from 'react';
import {
  Brain, MessageSquare, Stethoscope, Sparkles,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle,
  RefreshCw, ToggleLeft, ToggleRight, Info, Pill, Utensils
} from 'lucide-react';
import { generateMedicalInsight, explainRawOcrReport } from '../services/geminiService';
import HospitalRecommendation from './HospitalRecommendation';

/* ══════════════════════════════════════════════════════════
   AI INSIGHT PANEL — Dark Notion Style AI
   ══════════════════════════════════════════════════════════ */

// ── Typewriter hook ──────────────────────────────────────────
function useTypewriter(text, speed = 12, active = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!active || !text) {
      setDisplayed(text || '');
      setDone(true);
      return;
    }
    setDisplayed('');
    setDone(false);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timerRef.current);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [text, speed, active]);

  return { displayed, done };
}

// ── Animated Counter ─────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', duration = 1400 }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <>{val}{suffix}</>;
}

// ── Thinking loading skeleton ───────────────────────────────
function ThinkingSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-white/5 border border-white/5" />
        <div className="flex-1">
          <div className="h-2.5 bg-white/5 rounded-full w-1/3 mb-1.5" />
          <div className="h-2 bg-white/5 rounded-full w-1/5" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-8 bg-white/[0.01] rounded-xl border border-white/5" />
        ))}
      </div>
      <div className="rounded-xl p-4 bg-white/[0.01] border border-white/5">
        <div className="h-2 bg-white/5 rounded-full w-full mb-2.5" />
        <div className="h-2 bg-white/5 rounded-full w-5/6 mb-2.5" />
        <div className="h-2 bg-white/5 rounded-full w-2/3" />
      </div>
    </div>
  );
}

// ── Urgency Color System ─────────────────────────────────────
function getUrgencyStyle(urgencyLevel = '') {
  const u = urgencyLevel.toUpperCase();
  if (u.includes('CRITICAL')) return { color: '#EF4444', text: 'text-white', bg: 'rgba(239, 68, 68, 0.06)', border: 'rgba(239, 68, 68, 0.25)' };
  if (u.includes('HIGH'))     return { color: '#F97316', text: 'text-white', bg: 'rgba(249, 115, 22, 0.06)', border: 'rgba(249, 115, 22, 0.2)' };
  if (u.includes('MODERATE')) return { color: '#F59E0B', text: 'text-white', bg: 'rgba(245, 158, 11, 0.06)', border: 'rgba(245, 158, 11, 0.2)' };
  return { color: '#10B981', text: 'text-white', bg: 'rgba(16, 185, 129, 0.06)', border: 'rgba(16, 185, 129, 0.2)' };
}

export default function AIInsightPanel({ reportData }) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState(null);
  const [simpleMode, setSimpleMode] = useState(true); // true = layperson language
  const [showAllConcerns, setShowAllConcerns] = useState(false);
  const [showHospitals, setShowHospitals] = useState(false);
  const [typingActive, setTypingActive] = useState(false);

  // Raw OCR Explainer states
  const [ocrTextExpl, setOcrTextExpl] = useState('');
  const [ocrExplLoading, setOcrExplLoading] = useState(false);
  const [ocrExplTyping, setOcrExplTyping] = useState(false);

  const riskLevel = (reportData?.overall_risk || 'low').toLowerCase();

  const explanationText = simpleMode
    ? (insight?.simple_explanation || '')
    : (insight?.overview || '');

  const { displayed, done } = useTypewriter(explanationText, 12, typingActive && !!insight);
  const { displayed: displayedOcr, done: doneOcr } = useTypewriter(ocrTextExpl, 8, ocrExplTyping && !!ocrTextExpl);

  const triggerOcrExplanation = () => {
    if (!reportData?.raw_text) return;
    setOcrExplLoading(true);
    setOcrTextExpl('');
    setOcrExplTyping(false);
    explainRawOcrReport(reportData.raw_text).then((res) => {
      setOcrTextExpl(res);
      setOcrExplLoading(false);
      setTimeout(() => {
        setOcrExplTyping(true);
      }, 150);
    });
  };

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => {
      generateMedicalInsight(reportData).then((result) => {
        setInsight(result);
        setLoading(false);
        setTimeout(() => {
          setTypingActive(true);
          if (riskLevel === 'critical' || riskLevel === 'high') {
            setShowHospitals(true);
          }
        }, 150);
      });
    }, 300);

    // Automatically trigger Direct Gemini Raw OCR Explainer on load
    if (reportData?.raw_text) {
      setOcrExplLoading(true);
      setOcrTextExpl('');
      setOcrExplTyping(false);
      explainRawOcrReport(reportData.raw_text).then((res) => {
        setOcrTextExpl(res);
        setOcrExplLoading(false);
        setTimeout(() => {
          setOcrExplTyping(true);
        }, 150);
      });
    }

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reportData, riskLevel]);

  // Reset typewriter when language mode toggle is switched
  useEffect(() => {
    setTypingActive(false);
    setTimeout(() => setTypingActive(true), 50);
  }, [simpleMode]);

  const urgencyStyle = insight ? getUrgencyStyle(insight.urgency_level || '') : getUrgencyStyle('');
  const visibleConcerns = showAllConcerns
    ? (insight?.concerns || [])
    : (insight?.concerns || []).slice(0, 3);

  return (
    <div
      className={`flex flex-col gap-6 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      {/* ── Main Insight Glass Card ─────────────────── */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        
        {/* notion style header bar */}
        <div className="px-5 py-4 border-b border-white/[0.04] bg-white/[0.01] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-diag-cyan/20 animate-ping" />
              <div className="h-9 w-9 rounded-xl bg-diag-cyan/5 border border-diag-cyan/15 flex items-center justify-center relative z-10 text-diag-cyan">
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4.5 w-4.5" />
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Geist, sans-serif' }}>
                Clinical AI Insights
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {loading ? (
                  <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest animate-pulse">
                    Synthesizing lab metrics...
                  </span>
                ) : (
                  <>
                    <div className="h-1 w-1 rounded-full bg-diag-emerald" />
                    <span className="text-diag-emerald text-[9px] font-bold uppercase tracking-widest">
                      {insight?.is_fallback ? 'AI Local Fallback Active' : 'Gemini Active · Live'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {!loading && insight && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-300 font-mono">
                  <AnimatedCounter target={insight.confidence} suffix="%" />
                </div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide block mt-0.5">AI Confidence</span>
              </div>
              <div
                className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border"
                style={{
                  color: urgencyStyle.color,
                  backgroundColor: urgencyStyle.bg,
                  borderColor: urgencyStyle.border,
                }}
              >
                {insight.urgency_level?.split('—')[0]?.trim() || 'Normal'}
              </div>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5">
          {loading ? (
            <ThinkingSkeleton />
          ) : (
            <div className="flex flex-col gap-4">
              
              {/* Language explain switch */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  Translation Layer
                </span>
                <button
                  onClick={() => setSimpleMode(s => !s)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-bold transition-all uppercase tracking-wider ${
                    simpleMode
                      ? 'bg-diag-cyan/5 border-diag-cyan/20 text-diag-cyan'
                      : 'bg-white/5 border-white/5 text-slate-300'
                  }`}
                >
                  {simpleMode ? (
                    <>
                      <MessageSquare className="h-3 w-3" />
                      Layperson Terms
                      <ToggleRight className="h-3.5 w-3.5 shrink-0" />
                    </>
                  ) : (
                    <>
                      <Stethoscope className="h-3 w-3" />
                      Clinical Terms
                      <ToggleLeft className="h-3.5 w-3.5 shrink-0" />
                    </>
                  )}
                </button>
              </div>

              {/* Findings checklist */}
              {insight.concerns && insight.concerns.length > 0 && (
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-2">
                    Primary Anomalies
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {visibleConcerns.map((concern, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl border border-white/5 text-slate-300 bg-white/[0.01]"
                      >
                        <div
                          className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: urgencyStyle.color }}
                        />
                        <span className="text-xs font-medium leading-relaxed">{concern}</span>
                      </div>
                    ))}
                    {insight.concerns.length > 3 && (
                      <button
                        onClick={() => setShowAllConcerns(s => !s)}
                        className="text-[10px] font-bold text-diag-cyan hover:underline mt-1 focus:outline-none flex items-center gap-0.5 w-fit"
                      >
                        {showAllConcerns ? (
                          <><ChevronUp className="h-3.5 w-3.5" /> View Less</>
                        ) : (
                          <><ChevronDown className="h-3.5 w-3.5" /> View All ({insight.concerns.length})</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Conversational Explanation */}
              <div className="rounded-xl p-4 bg-slate-950/40 border border-white/5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-diag-cyan block mb-2">
                  {simpleMode ? 'AI Decoded Explanation' : 'Clinical Summary Analysis'}
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {displayed}
                  {!done && (
                    <span className="inline-block w-1.5 h-3.5 bg-diag-cyan ml-0.5 animate-pulse align-middle" />
                  )}
                </p>
              </div>

              {/* Recommendations list */}
              {insight.recommendations && insight.recommendations.length > 0 && (
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-2">
                    Actionable Recommendations
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {insight.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.01] border border-white/5"
                      >
                        <div className="h-4.5 w-4.5 rounded bg-diag-cyan/10 border border-diag-cyan/20 flex items-center justify-center shrink-0 text-diag-cyan text-[10px] font-bold font-mono">
                          {i + 1}
                        </div>
                        <span className="text-xs text-slate-300 leading-normal font-medium">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prescriptions & Medications */}
              {insight.suggested_medications && insight.suggested_medications.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5 text-diag-red animate-pulse" />
                      Supportive Therapeutics & Suggested Medicines
                    </span>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-diag-redSoft/10 border border-diag-red/20 text-diag-red tracking-wider">
                      Physician Authorization Required
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {insight.suggested_medications.map((med, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-diag-redSoft/5 border border-diag-red/10"
                      >
                        <div className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 bg-diag-red" />
                        <span className="text-xs text-slate-300 leading-relaxed font-semibold">{med}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diet Plan */}
              {insight.diet_plan && insight.diet_plan.length > 0 && (
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-2 flex items-center gap-1.5">
                    <Utensils className="h-3.5 w-3.5 text-diag-cyan" />
                    Tailored Diet & Custom Meal Plan
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {insight.diet_plan.map((diet, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-diag-cyan/5 border border-diag-cyan/10"
                      >
                        <div className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 bg-diag-cyan" />
                        <span className="text-xs text-slate-300 leading-normal font-semibold">{diet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical note banner */}
              {insight.doctor_note && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-diag-emerald/10 bg-diag-emeraldSoft/5">
                  <div className="h-7 w-7 rounded-lg bg-diag-emeraldSoft border border-diag-emerald/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-4 w-4 text-diag-emerald" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-diag-emerald uppercase tracking-wider block">
                      Assigned Clinical Instruction
                    </span>
                    <p className="text-xs text-slate-300 font-semibold leading-relaxed mt-0.5">
                      {insight.doctor_note}
                    </p>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-xl border border-white/5 bg-slate-950/20">
                <Info className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[9px] text-slate-500 leading-relaxed">
                  DiagnosIQ is a clinical decision support asset. AI-generated insight blocks do not substitute regular practitioner evaluation. Consult a general internist or emergency physician for acute symptoms.
                </p>
              </div>

              {/* Hospitals show selector */}
              {['critical', 'high', 'medium'].includes(riskLevel) && (
                <button
                  onClick={() => setShowHospitals(s => !s)}
                  className={`w-full flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-xs transition-all border ${
                    riskLevel === 'critical'
                      ? 'bg-diag-redSoft/10 border-diag-red/25 text-diag-red hover:bg-diag-redSoft/20'
                      : 'bg-diag-cyan/5 border-diag-cyan/20 text-diag-cyan hover:bg-diag-cyan/10'
                  }`}
                >
                  {showHospitals ? 'Minimize' : 'Expose'} Nearby Emergency Facilities
                  {showHospitals ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              )}

            </div>
          )}
        </div>
      </div>

      {/* ── Direct Gemini Raw OCR Explainer Card ─────────────────── */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/5 relative bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-diag-navy/80">
        
        {/* Glow decorative bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-diag-cyan via-indigo-500 to-diag-cyan" />
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.04] bg-white/[0.01] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-diag-cyan/20 animate-ping" />
              <div className="h-9 w-9 rounded-xl bg-diag-cyan/5 border border-diag-cyan/15 flex items-center justify-center relative z-10 text-diag-cyan">
                {ocrExplLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Geist, sans-serif' }}>
                Direct Gemini OCR Explainer
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {ocrExplLoading ? (
                  <span className="text-indigo-400 text-[9px] font-bold uppercase tracking-widest animate-pulse">
                    Consulting direct AI model...
                  </span>
                ) : (
                  <>
                    <div className="h-1 w-1 rounded-full bg-diag-cyan animate-pulse" />
                    <span className="text-diag-cyan text-[9px] font-bold uppercase tracking-widest">
                      Gemini 1.5 Flash · Raw Analysis Active
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={triggerOcrExplanation}
            disabled={ocrExplLoading}
            className="px-3 py-1 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 select-none"
          >
            <RefreshCw className={`h-3 w-3 ${ocrExplLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col gap-4">
          
          {/* Main content container */}
          {ocrExplLoading ? (
            <ThinkingSkeleton />
          ) : (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl p-4 bg-slate-950/70 border border-white/5 shadow-inner">
                <span className="text-[9px] font-black uppercase tracking-widest text-diag-cyan block mb-2">
                  Plain English Raw OCR Interpretation
                </span>
                
                {displayedOcr ? (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                    {displayedOcr}
                    {!doneOcr && (
                      <span className="inline-block w-1.5 h-3.5 bg-diag-cyan ml-0.5 animate-pulse align-middle" />
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    No raw OCR text could be deciphered. Try pasting or uploading a clean report.
                  </p>
                )}
              </div>

              {/* Info banner about Direct Gemini translation */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.02]">
                <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Unlike standard structured insights, this section sends the **raw OCR text directly to Gemini** for an unconstrained clinical explanation in highly compassionate, simple language.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nearby hospitals display */}
      {showHospitals && !loading && (
        <HospitalRecommendation riskLevel={riskLevel} forceShow />
      )}
    </div>
  );
}
