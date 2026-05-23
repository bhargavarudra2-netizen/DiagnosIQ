import React, { useState, useEffect } from 'react';
import {
  AlertOctagon, Phone, ShieldAlert, Navigation,
  Stethoscope, Star, MapPin, X, Building2, ExternalLink
} from 'lucide-react';
import { generateEmergencyRecommendation } from '../services/geminiService';
import HospitalRecommendation from './HospitalRecommendation';

/* ══════════════════════════════════════════════════════════
   EMERGENCY ALERT MODAL — Premium Dark Mode
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
      style={{ background: 'rgba(7, 11, 20, 0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Absolute faint warning border overlay */}
      <div className="absolute inset-0 border-2 border-diag-red/10 pointer-events-none animate-pulse" />

      <div
        className="w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in my-4"
        style={{
          background: '#0B1220',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Header Alert strip */}
        <div className="px-5 py-3 flex items-center gap-3 border-b border-white/5 bg-gradient-to-r from-[#991B1B]/40 to-transparent">
          <span className="h-1.5 w-1.5 rounded-full bg-diag-red animate-pulse" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest" style={{ fontFamily: 'Geist, sans-serif' }}>
            ⚠ DiagnosIQ — Safety Threshold Alarm Triggered
          </span>
          <div className="ml-auto">
            <span className="text-diag-red text-[9px] font-bold uppercase tracking-wider bg-diag-redSoft/10 px-2.5 py-0.5 rounded border border-diag-red/25">
              WHO/ICMR Critical Breach
            </span>
          </div>
        </div>

        {/* Content columns */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Left panel flags */}
          <div className="p-6 flex flex-col md:w-5/12 border-b md:border-b-0 md:border-r border-white/5 bg-white/[0.01] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-diag-redSoft border border-diag-red/20 flex items-center justify-center text-diag-red">
                  <AlertOctagon className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100" style={{ fontFamily: 'Geist, sans-serif' }}>
                    Clinical Alert
                  </h3>
                  <p className="text-[9px] font-bold text-diag-red uppercase tracking-wider">
                    Deterministic Matches
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Flag checklist */}
            <div className="flex flex-col gap-2 mb-4">
              {flags.map((flag, idx) => (
                <div key={idx} className="glass-card-red rounded-xl p-3 border border-diag-red/20 bg-diag-redSoft/5">
                  <span className="text-[8px] font-bold text-diag-red uppercase tracking-widest block mb-1">
                    Biomarker Alert Index
                  </span>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span>{flag.marker}</span>
                    <span className="text-diag-red font-mono">{flag.value} {flag.unit}</span>
                  </div>
                  <p className="text-[10px] text-diag-red font-semibold leading-relaxed mt-1.5">
                    {flag.condition}
                  </p>
                </div>
              ))}
            </div>

            {/* Gemini emergency note */}
            <div className="rounded-xl p-4 bg-slate-950 border border-white/5 mb-5">
              <span className="text-[9px] font-bold text-diag-cyan uppercase tracking-widest block mb-1.5">
                AI Emergency Recommendations
              </span>
              {aiLoading ? (
                <div className="space-y-1.5 animate-pulse">
                  <div className="h-2 bg-white/5 rounded-full w-full" />
                  <div className="h-2 bg-white/5 rounded-full w-5/6" />
                </div>
              ) : (
                <p className="text-[10.5px] text-slate-400 leading-relaxed font-medium">{aiSummary}</p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-auto flex flex-col gap-2">
              <a
                href="tel:102"
                className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-diag-red hover:bg-red-600 text-white shadow-lg shadow-diag-red/10"
              >
                <Phone className="h-3.5 w-3.5 animate-pulse" />
                Call Medical Emergency (102 / 112)
              </a>
              <button
                onClick={() => setShowHospitalMap(s => !s)}
                className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5"
              >
                <Building2 className="h-3.5 w-3.5" />
                {showHospitalMap ? 'Minimize' : 'Locate'} Nearest Trauma Units
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest text-center mt-1"
              >
                Dismiss to Dashboard
              </button>
            </div>
          </div>

          {/* Right panel map / specialists */}
          <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-5 bg-diag-bg">
            {showHospitalMap ? (
              <div>
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-3.5 uppercase tracking-wider">
                  <Navigation className="h-3.5 w-3.5 text-diag-red" />
                  Trauma Facilities Mapped
                </h4>
                <HospitalRecommendation riskLevel="critical" forceShow />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                    <Stethoscope className="h-4 w-4 text-diag-cyan" />
                    Matched Specialty Clinical Networks
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    Highly qualified clinicians matched to your target physiological system:
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {specialists.map((spec, idx) => (
                    <div
                      key={idx}
                      className="glass-card rounded-2xl p-4 flex items-center justify-between border border-white/5"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-200">{spec.name}</h4>
                          <div className="flex items-center gap-0.5 text-[9px] font-bold text-amber-500">
                            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                            {spec.rating}
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-diag-cyan uppercase tracking-wider block mt-0.5">
                          {spec.title}
                        </span>
                        <p className="text-[9px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                          <MapPin className="h-2.5 w-2.5" />
                          {spec.hospital} · {spec.dist}
                        </p>
                      </div>
                      <a
                        href={`tel:${spec.phone}`}
                        className="btn-secondary text-[10px] py-1.5 px-3 uppercase tracking-wider font-bold"
                      >
                        Consult
                      </a>
                    </div>
                  ))}
                </div>

                {/* Locator panel */}
                <div className="rounded-2xl p-4 text-center border border-white/5 bg-white/[0.01] relative overflow-hidden flex flex-col items-center">
                  <Navigation className="h-5 w-5 text-diag-cyan animate-pulse mb-1.5" />
                  <h4 className="text-xs font-bold text-slate-200">Find Emergency Trauma Care</h4>
                  <p className="text-[9.5px] text-slate-500 mt-1 max-w-[220px] leading-relaxed">
                    Locate all emergency rooms and trauma units closest to your GPS coordinates with live triages.
                  </p>
                  <button
                    onClick={() => setShowHospitalMap(true)}
                    className="btn-primary text-[10px] mt-3.5 uppercase tracking-wider font-bold"
                  >
                    Expose Locator
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
