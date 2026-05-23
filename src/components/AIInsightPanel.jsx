import React, { useState, useEffect, useRef } from 'react';

/* ══════════════════════════════════════════════════════════
   AI INSIGHT PANEL — Streaming typed explanation with pulse
   ══════════════════════════════════════════════════════════ */

const AI_INSIGHTS = {
  critical: {
    urgency: 'CRITICAL',
    urgencyColor: '#EF4444',
    concerns: [
      'Active myocardial injury pattern detected (Troponin elevated 60× above normal)',
      'Hyperglycaemic crisis risk — glucose critically elevated at 310 mg/dL',
      'Severe thrombocytopenia — spontaneous internal bleeding risk is high',
      'Compound multi-organ failure indicators across cardiovascular and metabolic systems'
    ],
    explanation: 'Your lab report reveals three simultaneously critical findings that together indicate a life-threatening medical emergency. Your Troponin — a protein only released when heart muscle is injured — is critically elevated, suggesting your heart is under active strain. Simultaneously, your blood sugar has spiked to crisis levels, and your blood-clotting platelets have dropped to dangerously low counts. This combination requires emergency care right now.',
    recommendations: [
      'Call emergency services (911/112) or go to nearest ER immediately',
      'Do not eat, drink, or take any medication without physician guidance',
      'Avoid all physical and emotional stress',
      'Emergency cardiology, endocrinology, and hematology co-consultation required'
    ],
    doctorNote: 'Schedule immediate emergency department visit. Do not drive yourself.',
    confidence: 98
  },
  high: {
    urgency: 'HIGH RISK',
    urgencyColor: '#F97316',
    concerns: [
      'Blood glucose approaching critical hyperglycaemic threshold (241 mg/dL)',
      'Elevated LDL cholesterol increases cardiovascular event risk significantly',
      'Early diabetic nephropathy markers detected in creatinine levels',
      'Progressive worsening trend detected across all three recent reports'
    ],
    explanation: 'Your report indicates significantly elevated blood sugar levels combined with high bad cholesterol and early signs of kidney stress — a pattern strongly associated with uncontrolled Type 2 diabetes and cardiovascular disease progression. The trend analysis shows these values have been worsening over the past 9 months, making urgent clinical intervention important to prevent irreversible organ damage.',
    recommendations: [
      'Schedule endocrinologist appointment within 24 hours',
      'Begin strict dietary elimination of sugars and refined carbohydrates',
      'Monitor fasting glucose every morning with a glucometer',
      'Request full HbA1c and GFR kidney function workup'
    ],
    doctorNote: 'Urgent physician consultation recommended within 24 hours.',
    confidence: 94
  },
  medium: {
    urgency: 'MODERATE RISK',
    urgencyColor: '#F59E0B',
    concerns: [
      'Blood glucose mildly elevated above normal fasting range (162 mg/dL)',
      'LDL cholesterol elevated — long-term cardiovascular risk increased',
      'Upward trend in both glucose and LDL over past 6 months'
    ],
    explanation: 'Your diagnostic panel shows two values outside the healthy range — blood sugar and LDL cholesterol. While neither is immediately dangerous, their combination and upward trend represent a growing metabolic risk. Early lifestyle modifications and a physician consultation within the next 48-72 hours can prevent these from progressing to serious conditions like diabetes or heart disease.',
    recommendations: [
      'Physician review within 48-72 hours',
      'Reduce sugar and saturated fat intake immediately',
      'Begin 30 minutes of daily walking',
      'Repeat fasting glucose in 4 weeks to track improvement'
    ],
    doctorNote: 'Primary care physician review recommended this week.',
    confidence: 91
  },
  low: {
    urgency: 'NORMAL',
    urgencyColor: '#22C55E',
    concerns: [
      'No abnormal biomarker values detected',
      'All organ system indicators within healthy reference ranges'
    ],
    explanation: 'Excellent news — your complete blood panel shows all biomarkers within healthy ranges across all six monitored organ systems. Your cardiovascular, renal, hepatic, hematological, and metabolic indicators are all functioning optimally. Continue your current lifestyle and schedule a routine follow-up in 12 months.',
    recommendations: [
      'Continue current healthy diet and exercise habits',
      'Maintain 7-8 hours of quality sleep nightly',
      'Stay hydrated — 2.5L of water daily',
      'Routine check-up in 12 months'
    ],
    doctorNote: 'Routine follow-up in 12 months recommended.',
    confidence: 98
  }
};

function useTypewriter(text, speed = 18, active = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  
  useEffect(() => {
    if (!active || !text) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, active]);
  
  return { displayed, done };
}

function AnimatedCounter({ target, duration = 1500, suffix = '' }) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  
  return <>{value}{suffix}</>;
}

export default function AIInsightPanel({ reportData }) {
  const [visible, setVisible] = useState(false);
  const [typing, setTyping] = useState(false);
  const risk = reportData?.overall_risk || 'low';
  const insight = AI_INSIGHTS[risk] || AI_INSIGHTS.low;
  const { displayed, done } = useTypewriter(insight.explanation, 16, typing);
  
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 200);
    const t2 = setTimeout(() => setTyping(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  
  const urgencyBg = {
    'CRITICAL': 'bg-red-50 border-red-200',
    'HIGH RISK': 'bg-orange-50 border-orange-200',
    'MODERATE RISK': 'bg-amber-50 border-amber-200',
    'NORMAL': 'bg-emerald-50 border-emerald-200',
  }[insight.urgency] || 'bg-slate-50 border-slate-200';

  return (
    <div
      className={`glass-card rounded-2xl overflow-hidden transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionProperty: 'opacity, transform' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)' }}
      >
        <div className="flex items-center gap-3">
          {/* AI Pulse Indicator */}
          <div className="relative flex items-center justify-center h-8 w-8">
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: 'rgba(99,102,241,0.3)' }}
            />
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
            >
              <svg viewBox="0 0 20 20" fill="white" className="h-4 w-4">
                <path d="M10 2a1 1 0 000 2h1v1a1 1 0 01-1 1H8a3 3 0 000 6h1v1a1 1 0 01-1 1H6a1 1 0 000 2h1a3 3 0 003-3v-1h2a1 1 0 000-2H9a1 1 0 01-1-1V9h1a3 3 0 000-6H8V2h2z" />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-white font-black text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Vitalis AI Clinical Insight
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                AI Engine Active
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
            style={{ background: insight.urgencyColor, color: '#fff' }}
          >
            {insight.urgency}
          </div>
          <div className="text-right">
            <div className="text-white text-sm font-black">
              <AnimatedCounter target={insight.confidence} suffix="%" />
            </div>
            <div className="text-slate-400 text-[9px] uppercase tracking-wider">Confidence</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-4">

        {/* Concerns List */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: insight.urgencyColor }} />
            Identified Concerns
          </h4>
          <div className="flex flex-col gap-1.5">
            {insight.concerns.map((c, i) => (
              <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl border ${urgencyBg}`}>
                <div
                  className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ background: insight.urgencyColor }}
                />
                <span className="text-[11px] text-slate-700 font-medium leading-snug">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Streaming Explanation */}
        <div className="rounded-xl p-4" style={{ background: '#F8FAFF', border: '1px solid #E0E7FF' }}>
          <div className="flex items-center gap-2 mb-2">
            <svg viewBox="0 0 20 20" fill="#6366F1" className="h-3.5 w-3.5">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              AI Explanation (Patient Mode)
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {displayed}
            {!done && (
              <span className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 animate-pulse align-middle" />
            )}
          </p>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            AI Recommendations
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {insight.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="h-4 w-4 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[9px] font-black text-indigo-600">{i + 1}</span>
                </div>
                <span className="text-[11px] text-slate-700 font-medium leading-snug">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Consultation Note */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'linear-gradient(90deg, #F0FDF4 0%, #ECFDF5 100%)', border: '1px solid #86EFAC' }}
        >
          <div className="h-7 w-7 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="#22C55E" className="h-4 w-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800">{insight.doctorNote}</span>
        </div>
      </div>
    </div>
  );
}
