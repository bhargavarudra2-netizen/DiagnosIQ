import React, { useState, useEffect, useRef } from 'react';
import {
  Brain, MessageSquare, Stethoscope, Sparkles,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle,
  RefreshCw, ToggleLeft, ToggleRight, Info
} from 'lucide-react';
import { generateMedicalInsight } from '../services/geminiService';
import HospitalRecommendation from './HospitalRecommendation';

/* ══════════════════════════════════════════════════════════
   AI INSIGHT PANEL
   Live Gemini-powered medical intelligence with:
   - Patient / Clinical mode toggle
   - Streaming typewriter effect
   - Graceful fallback to static insights
   - Integrated hospital recommendation
   ══════════════════════════════════════════════════════════ */

// ── Typewriter hook ──────────────────────────────────────────
function useTypewriter(text, speed = 14, active = true) {
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

// ── Animated counter ─────────────────────────────────────────
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

// ── Gemini Thinking Skeleton ─────────────────────────────────
function ThinkingSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {/* Header bar */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-indigo-100" />
        <div className="flex-1">
          <div className="h-3 bg-slate-100 rounded-full w-1/2 mb-1.5" />
          <div className="h-2 bg-slate-100 rounded-full w-1/4" />
        </div>
        <div className="h-6 w-24 bg-slate-100 rounded-full" />
      </div>

      {/* Concerns skeleton */}
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-slate-50 rounded-xl border border-slate-100"
            style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>

      {/* Explanation skeleton */}
      <div className="rounded-xl p-4 bg-indigo-50 border border-indigo-100">
        <div className="h-2 bg-indigo-100 rounded-full w-full mb-2" />
        <div className="h-2 bg-indigo-100 rounded-full w-5/6 mb-2" />
        <div className="h-2 bg-indigo-100 rounded-full w-4/6" />
      </div>

      {/* AI status */}
      <div className="flex items-center gap-2 justify-center py-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-indigo-300 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
          Gemini AI Synthesizing…
        </span>
      </div>
    </div>
  );
}

// ── Urgency style map ────────────────────────────────────────
function getUrgencyStyle(urgencyLevel = '') {
  const u = urgencyLevel.toUpperCase();
  if (u.includes('CRITICAL')) return { bg: 'bg-red-600', text: 'text-white', border: 'border-red-200', light: 'bg-red-50' };
  if (u.includes('HIGH'))     return { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-200', light: 'bg-orange-50' };
  if (u.includes('MODERATE')) return { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-200', light: 'bg-amber-50' };
  return { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-200', light: 'bg-emerald-50' };
}

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function AIInsightPanel({ reportData }) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState(null);
  const [simpleMode, setSimpleMode] = useState(true);  // true = patient, false = clinical
  const [showAllConcerns, setShowAllConcerns] = useState(false);
  const [showHospitals, setShowHospitals] = useState(false);
  const [typingActive, setTypingActive] = useState(false);

  const riskLevel = (reportData?.overall_risk || 'low').toLowerCase();
  const isCriticalOrHigh = riskLevel === 'critical' || riskLevel === 'high';

  // Current explanation text switches based on mode
  const explanationText = simpleMode
    ? (insight?.simple_explanation || '')
    : (insight?.overview || '');

  const { displayed, done } = useTypewriter(explanationText, 15, typingActive && !!insight);

  // ── Fetch from Gemini on mount ───────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 150);
    const t2 = setTimeout(() => {
      generateMedicalInsight(reportData).then((result) => {
        setInsight(result);
        setLoading(false);
        setTimeout(() => {
          setTypingActive(true);
          // Auto-show hospitals for critical/high
          if (riskLevel === 'critical' || riskLevel === 'high') {
            setShowHospitals(true);
          }
        }, 300);
      });
    }, 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reportData, riskLevel]);

  // Reset typewriter when mode changes
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
      className={`flex flex-col gap-5 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionProperty: 'opacity, transform' }}
    >
      {/* ══ MAIN INSIGHT CARD ══════════════════════════ */}
      <div className="glass-card rounded-2xl overflow-hidden">

        {/* ── Dark Header ─────────────────────────────── */}
        <div
          className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
          style={{ background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}
        >
          <div className="flex items-center gap-3">
            {/* AI Pulse indicator */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-ping opacity-50"
                style={{ background: loading ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.25)' }} />
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center relative z-10"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
              >
                {loading
                  ? <RefreshCw className="h-4 w-4 text-white animate-spin" />
                  : <Brain className="h-4 w-4 text-white" />
                }
              </div>
            </div>
            <div>
              <span className="text-white font-black text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Vitalis AI Clinical Insight
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                {loading ? (
                  <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                    Gemini AI Thinking…
                  </span>
                ) : (
                  <>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                      {insight?.is_fallback ? 'AI Engine Active · Demo Mode' : 'Gemini 1.5 Flash · Live'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Confidence score */}
            {!loading && insight && (
              <div className="text-right">
                <div className="text-white text-sm font-black">
                  <AnimatedCounter target={insight.confidence} suffix="%" />
                </div>
                <div className="text-slate-400 text-[9px] uppercase tracking-wider">Confidence</div>
              </div>
            )}

            {/* Urgency badge */}
            {!loading && insight && (
              <div
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${urgencyStyle.bg} ${urgencyStyle.text}`}
              >
                {insight.urgency_level?.split('—')[0]?.trim() || 'Normal'}
              </div>
            )}
          </div>
        </div>

        {/* ── Body ────────────────────────────────────── */}
        <div className="p-5">
          {loading ? (
            <ThinkingSkeleton />
          ) : (
            <div className="flex flex-col gap-4">

              {/* Mode Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Explanation Mode
                </span>
                <button
                  onClick={() => setSimpleMode((s) => !s)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                    simpleMode
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  }`}
                >
                  {simpleMode ? (
                    <>
                      <MessageSquare className="h-3 w-3" />
                      Simple Language
                      <ToggleRight className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <Stethoscope className="h-3 w-3" />
                      Clinical Mode
                      <ToggleLeft className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Concerns List */}
              {insight.concerns && insight.concerns.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-2.5 w-2.5" style={{ color: insight.urgency_color || '#F59E0B' }} />
                    Key Findings
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {visibleConcerns.map((concern, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 p-2.5 rounded-xl border ${urgencyStyle.light} ${urgencyStyle.border}`}
                      >
                        <div
                          className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ background: insight.urgency_color || '#F59E0B' }}
                        />
                        <span className="text-[11px] text-slate-700 font-medium leading-snug">
                          {concern}
                        </span>
                      </div>
                    ))}
                    {insight.concerns.length > 3 && (
                      <button
                        onClick={() => setShowAllConcerns((s) => !s)}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showAllConcerns ? (
                          <><ChevronUp className="h-3 w-3" /> Show less</>
                        ) : (
                          <><ChevronDown className="h-3 w-3" /> Show {insight.concerns.length - 3} more</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Streaming Explanation */}
              <div
                className="rounded-xl p-4"
                style={{ background: '#F8FAFF', border: '1px solid #E0E7FF' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3 w-3 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                    {simpleMode ? 'AI Explanation · Patient Mode' : 'Clinical Overview · Doctor Mode'}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {displayed}
                  {!done && (
                    <span className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 animate-pulse align-middle" />
                  )}
                </p>
              </div>

              {/* Recommendations Grid */}
              {insight.recommendations && insight.recommendations.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    AI Recommendations
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {insight.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-indigo-50 border border-indigo-100"
                      >
                        <div className="h-4 w-4 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-black text-indigo-600">{i + 1}</span>
                        </div>
                        <span className="text-[11px] text-slate-700 font-medium leading-snug">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctor Note */}
              {insight.doctor_note && (
                <div
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{
                    background: 'linear-gradient(90deg, #F0FDF4 0%, #ECFDF5 100%)',
                    border: '1px solid #86EFAC',
                  }}
                >
                  <div className="h-7 w-7 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider block mb-0.5">
                      Clinical Note
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-800">
                      {insight.doctor_note}
                    </span>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <Info className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[9px] text-slate-400 leading-relaxed">
                  This AI analysis is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical decisions.
                </p>
              </div>

              {/* Hospital Toggle Button */}
              {(riskLevel === 'critical' || riskLevel === 'high' || riskLevel === 'medium') && (
                <button
                  onClick={() => setShowHospitals((s) => !s)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all border ${
                    riskLevel === 'critical'
                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                      : riskLevel === 'high'
                      ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                      : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {riskLevel === 'critical' ? '🚨' : riskLevel === 'high' ? '⚠️' : '🏥'}
                  {showHospitals ? 'Hide' : 'Show'} Nearby{' '}
                  {riskLevel === 'critical' ? 'Emergency' : riskLevel === 'high' ? 'Specialist' : ''}{' '}
                  Hospitals
                  {showHospitals ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══ HOSPITAL RECOMMENDATION ════════════════════ */}
      {showHospitals && !loading && (
        <HospitalRecommendation riskLevel={riskLevel} forceShow />
      )}
    </div>
  );
}
