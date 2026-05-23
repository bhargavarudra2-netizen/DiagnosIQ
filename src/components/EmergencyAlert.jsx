import React, { useState, useEffect } from 'react';
import {
  AlertOctagon, Phone, ShieldAlert, Navigation,
  Stethoscope, Star, MapPin, X, Building2, ExternalLink
} from 'lucide-react';
import { generateEmergencyRecommendation } from '../services/geminiService';
import HospitalRecommendation from './HospitalRecommendation';

/* ══════════════════════════════════════════════════════════
   EMERGENCY ALERT MODAL — Enhanced with Gemini AI + Hospital Finder
   ══════════════════════════════════════════════════════════ */

const SPECIALISTS_DATABASE = {
  cardiovascular: [
    { name: 'Dr. Sunita Mehta, MD',    title: 'Senior Interventional Cardiologist', hospital: 'Apollo Heart Institute',         rating: 4.9, dist: '1.2 km', phone: '+91 98110 54321' },
    { name: 'Dr. Vivek Anand, DM',     title: 'Clinical Cardiologist',               hospital: 'Max Cardio Centre',              rating: 4.8, dist: '2.4 km', phone: '+91 99201 12345' }
  ],
  pancreas: [
    { name: 'Dr. Alok Sen, MD',        title: 'Consultant Endocrinologist',          hospital: 'Metro Diabetes & Endocrine',     rating: 4.9, dist: '0.8 km', phone: '+91 98300 98765' },
    { name: 'Dr. Riya Chawla, DM',     title: 'Metabolic Specialist',                hospital: 'Fortis Organ Health Care',       rating: 4.7, dist: '3.1 km', phone: '+91 97112 55667' }
  ],
  kidneys: [
    { name: 'Dr. Pradeep Kumar, DM',   title: 'Chief Nephrologist',                  hospital: 'Global Kidney & Dialysis',       rating: 4.9, dist: '1.5 km', phone: '+91 98450 11223' }
  ],
  blood: [
    { name: 'Dr. Nithya Swaminathan',  title: 'Consultant Hematologist',             hospital: 'Cancer & Blood Care Center',     rating: 4.8, dist: '2.8 km', phone: '+91 99400 88990' }
  ],
  brain: [
    { name: 'Dr. Sameer Joshi, MCh',   title: 'Senior Neurologist',                  hospital: 'National Neuro Sciences Center', rating: 4.9, dist: '1.9 km', phone: '+91 98100 44556' }
  ],
};

export default function EmergencyAlert({ flags, onClose }) {
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(true);
  const [showHospitalMap, setShowHospitalMap] = useState(false);

  useEffect(() => {
    if (!flags || flags.length === 0) return;
    generateEmergencyRecommendation(flags).then((text) => {
      setAiSummary(text);
      setAiLoading(false);
    });
  }, [flags]);

  if (!flags || flags.length === 0) return null;

  const triggeredOrgans = Array.from(new Set(flags.map((f) => f.organ || 'cardiovascular')));
  let specialists = [];
  triggeredOrgans.forEach((org) => {
    if (SPECIALISTS_DATABASE[org]) specialists = [...specialists, ...SPECIALISTS_DATABASE[org]];
  });
  if (specialists.length === 0) specialists = SPECIALISTS_DATABASE.cardiovascular;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
      style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)' }}
    >
      {/* Animated red border ring */}
      <div className="absolute inset-0 border-4 border-red-400/20 pointer-events-none animate-pulse" />

      <div
        className="w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in my-4"
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #FCA5A5',
          boxShadow: '0 0 0 4px rgba(239,68,68,0.08), 0 24px 80px rgba(239,68,68,0.20), 0 4px 20px rgba(0,0,0,0.10)',
        }}
      >
        {/* ── Top Emergency Banner ─────────────────── */}
        <div
          className="px-6 py-3 flex items-center gap-3"
          style={{
            background: 'linear-gradient(90deg, #7F1D1D 0%, #991B1B 50%, #7F1D1D 100%)',
          }}
        >
          <div className="h-2 w-2 rounded-full bg-red-300 animate-ping" />
          <span className="text-white text-[11px] font-black uppercase tracking-widest">
            ⚠ Vitalis AI — Critical Safety Alert Triggered
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-red-300 text-[10px] font-bold">WHO/ICMR Threshold Breach</span>
          </div>
        </div>

        {/* ── Main Content Grid ──────────────────────── */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

          {/* LEFT: Flag details + AI summary + CTAs */}
          <div
            className="p-6 flex flex-col md:w-5/12 border-b md:border-b-0 md:border-r border-red-100 overflow-y-auto"
            style={{ background: 'linear-gradient(160deg, #FEF2F2 0%, #FFF5F5 100%)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center">
                  <AlertOctagon className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h2
                    className="text-base font-black text-slate-800"
                    style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}
                  >
                    Clinical Crisis Detected
                  </h2>
                  <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wide">
                    Deterministic Red-Flag Match
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-300 hover:text-slate-500 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Flag List */}
            <div className="flex flex-col gap-2 mb-4">
              {flags.map((flag, idx) => (
                <div key={idx} className="alert-red rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="pulse-dot" />
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">
                      Biomarker Alert
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">{flag.marker}</span>
                    <span className="text-sm font-black text-red-600">
                      {flag.value} {flag.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-red-500 font-semibold mt-1 leading-snug">
                    {flag.condition}
                  </p>
                </div>
              ))}
            </div>

            {/* Gemini AI Emergency Summary */}
            <div
              className="rounded-xl p-3 mb-4"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                  Gemini AI Emergency Guidance
                </span>
              </div>
              {aiLoading ? (
                <div className="space-y-1.5 animate-pulse">
                  <div className="h-2 bg-red-100 rounded-full w-full" />
                  <div className="h-2 bg-red-100 rounded-full w-4/5" />
                  <div className="h-2 bg-red-100 rounded-full w-3/5" />
                </div>
              ) : (
                <p className="text-[11px] text-slate-700 font-medium leading-relaxed">{aiSummary}</p>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="mt-auto flex flex-col gap-2">
              <a
                href="tel:102"
                className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all"
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.35)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#DC2626')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#EF4444')}
              >
                <Phone className="h-4 w-4 animate-pulse" />
                Dial Emergency (102 / 112)
              </a>
              <button
                onClick={() => setShowHospitalMap((s) => !s)}
                className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                style={{
                  background: 'white',
                  border: '1.5px solid #FCA5A5',
                  color: '#DC2626',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                <Building2 className="h-3.5 w-3.5" />
                {showHospitalMap ? 'Hide' : 'Find'} Nearest Emergency Hospitals
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 hover:underline transition-all rounded-xl"
              >
                Acknowledge & Continue to Dashboard
              </button>
            </div>
          </div>

          {/* RIGHT: Specialists panel / Hospital Map */}
          <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4 bg-white">
            {showHospitalMap ? (
              /* Hospital Map panel */
              <div>
                <h3
                  className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  <Navigation className="h-4 w-4 text-red-500" />
                  Emergency Centers Near You
                </h3>
                <HospitalRecommendation riskLevel="critical" forceShow />
              </div>
            ) : (
              /* Specialists panel */
              <div className="flex flex-col gap-4">
                <div>
                  <h3
                    className="text-sm font-bold text-slate-800 flex items-center gap-2"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <Stethoscope className="h-4 w-4 text-blue-500" />
                    Urgent Specialty Care Network
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Top-rated clinicians matched to your active risk profile:
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {specialists.map((spec, idx) => (
                    <div
                      key={idx}
                      className="glass-card rounded-2xl p-4 flex items-center justify-between glass-card-hover"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-800">{spec.name}</h4>
                          <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                            {spec.rating}
                          </div>
                        </div>
                        <p className="text-[10px] font-semibold text-blue-600 mt-0.5 uppercase tracking-wide">
                          {spec.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" />
                          {spec.hospital} · {spec.dist}
                        </p>
                      </div>
                      <a
                        href={`tel:${spec.phone}`}
                        className="btn-secondary text-[10px] px-3 py-1.5 text-xs"
                      >
                        Consult
                      </a>
                    </div>
                  ))}
                </div>

                {/* ER Locator CTA */}
                <div
                  className="rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden"
                  style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="h-32 w-32 rounded-full border-2 border-blue-400 animate-ping" />
                    <div className="h-16 w-16 rounded-full border border-blue-300 absolute" />
                  </div>
                  <Navigation className="h-6 w-6 text-blue-500 animate-pulse z-10 mb-2" />
                  <h4 className="text-xs font-bold text-slate-700 z-10">Find Emergency Room Near You</h4>
                  <p className="text-[10px] text-slate-500 mt-1 z-10 max-w-[200px]">
                    Click below to locate the nearest emergency medical centers with live availability.
                  </p>
                  <button
                    onClick={() => setShowHospitalMap(true)}
                    className="mt-3 z-10 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold text-white transition-all"
                    style={{ background: '#2563EB', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Locate Hospitals Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
