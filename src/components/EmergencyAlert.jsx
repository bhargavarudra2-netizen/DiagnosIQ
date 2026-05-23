import React from 'react';
import { AlertOctagon, Phone, ShieldAlert, Navigation, Stethoscope, Star, MapPin, X } from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   EMERGENCY ALERT MODAL — Clinical Light Theme
   ══════════════════════════════════════════════════════════ */

const SPECIALISTS_DATABASE = {
  cardiovascular: [
    { name: 'Dr. Sunita Mehta, MD',    title: 'Senior Interventional Cardiologist', hospital: 'Apollo Heart Institute',        rating: 4.9, dist: '1.2 km', phone: '+91 98110 54321' },
    { name: 'Dr. Vivek Anand, DM',     title: 'Clinical Cardiologist',               hospital: 'Max Cardio Centre',             rating: 4.8, dist: '2.4 km', phone: '+91 99201 12345' }
  ],
  pancreas: [
    { name: 'Dr. Alok Sen, MD',        title: 'Consultant Endocrinologist',          hospital: 'Metro Diabetes & Endocrine',    rating: 4.9, dist: '0.8 km', phone: '+91 98300 98765' },
    { name: 'Dr. Riya Chawla, DM',     title: 'Metabolic Specialist',                hospital: 'Fortis Organ Health Care',      rating: 4.7, dist: '3.1 km', phone: '+91 97112 55667' }
  ],
  kidneys: [
    { name: 'Dr. Pradeep Kumar, DM',   title: 'Chief Nephrologist',                  hospital: 'Global Kidney & Dialysis',      rating: 4.9, dist: '1.5 km', phone: '+91 98450 11223' }
  ],
  blood: [
    { name: 'Dr. Nithya Swaminathan',  title: 'Consultant Hematologist',             hospital: 'Cancer & Blood Care Center',    rating: 4.8, dist: '2.8 km', phone: '+91 99400 88990' }
  ],
  brain: [
    { name: 'Dr. Sameer Joshi, MCh',   title: 'Senior Neurologist',                  hospital: 'National Neuro Sciences Center', rating: 4.9, dist: '1.9 km', phone: '+91 98100 44556' }
  ],
};

export default function EmergencyAlert({ flags, onClose }) {
  if (!flags || flags.length === 0) return null;

  const triggeredOrgans = Array.from(new Set(flags.map(f => f.organ || 'cardiovascular')));
  let specialists = [];
  triggeredOrgans.forEach(org => {
    if (SPECIALISTS_DATABASE[org]) specialists = [...specialists, ...SPECIALISTS_DATABASE[org]];
  });
  if (specialists.length === 0) specialists = SPECIALISTS_DATABASE.cardiovascular;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(15,23,42,0.60)', backdropFilter: 'blur(8px)' }}
    >
      {/* Alert border pulse */}
      <div className="absolute inset-0 border-4 border-red-300/30 pointer-events-none animate-pulse" />

      {/* Modal */}
      <div
        className="w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-scale-in"
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #FCA5A5',
          boxShadow: '0 20px 60px rgba(239,68,68,0.15), 0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        {/* ── Left: Emergency Info ─────────────────────── */}
        <div className="p-6 md:p-8 flex flex-col md:w-5/12 border-b md:border-b-0 md:border-r border-red-100"
          style={{ background: 'linear-gradient(160deg, #FEF2F2 0%, #FFF5F5 100%)' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center">
                <AlertOctagon className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
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
          <div className="flex flex-col gap-2 mb-6">
            {flags.map((flag, idx) => (
              <div key={idx} className="alert-red rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="pulse-dot" />
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">
                    Biomarker Alert
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">
                    {flag.marker}
                  </span>
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

          {/* CTA Buttons */}
          <div className="mt-auto flex flex-col gap-2">
            <a
              href="tel:102"
              className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: '#EF4444', color: '#FFFFFF', boxShadow: '0 4px 16px rgba(239,68,68,0.30)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
              onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
            >
              <Phone className="h-4 w-4 animate-pulse" />
              Dial Emergency (102 / 112)
            </a>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 hover:underline transition-all rounded-xl"
            >
              Acknowledge & Continue
            </button>
          </div>
        </div>

        {/* ── Right: Specialists Panel ─────────────────── */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto flex flex-col gap-5 bg-white">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Stethoscope className="h-4.5 w-4.5 text-blue-500" />
              Urgent Specialty Care Network
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Top-rated clinicians matched to your active risk profile:
            </p>
          </div>

          {/* Specialist Cards */}
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

          {/* ER Locator Card */}
          <div
            className="rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden"
            style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="h-32 w-32 rounded-full border-2 border-blue-400 animate-ping" />
              <div className="h-16 w-16 rounded-full border border-blue-300 absolute" />
            </div>
            <Navigation className="h-6 w-6 text-blue-500 animate-pulse z-10 mb-2" />
            <h4 className="text-xs font-bold text-slate-700 z-10">Nearest Hospital ER</h4>
            <p className="text-[10px] text-slate-500 mt-1 z-10 max-w-[200px]">
              Metro Trauma Center (1.4 km) — ICU & Ambulatory facilities active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
