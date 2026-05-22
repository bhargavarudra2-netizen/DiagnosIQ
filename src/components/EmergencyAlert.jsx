import React from 'react';
import { AlertOctagon, Phone, ShieldAlert, Navigation, Stethoscope, Star, MapPin } from 'lucide-react';

const SPECIALISTS_DATABASE = {
  cardiovascular: [
    { name: "Dr. Sunita Mehta, MD", title: "Senior Interventional Cardiologist", hospital: "Apollo Heart Institute", rating: 4.9, dist: "1.2 km", phone: "+91 98110 54321" },
    { name: "Dr. Vivek Anand, DM", title: "Clinical Cardiologist", hospital: "Max Cardio Centre", rating: 4.8, dist: "2.4 km", phone: "+91 99201 12345" }
  ],
  pancreas: [
    { name: "Dr. Alok Sen, MD", title: "Consultant Endocrinologist", hospital: "Metro Diabetes & Endocrine Care", rating: 4.9, dist: "0.8 km", phone: "+91 98300 98765" },
    { name: "Dr. Riya Chawla, DM", title: "Metabolic Specialist", hospital: "Fortis Organ Health Care", rating: 4.7, dist: "3.1 km", phone: "+91 97112 55667" }
  ],
  kidneys: [
    { name: "Dr. Pradeep Kumar, DM", title: "Chief Nephrologist", hospital: "Global Kidney Clinic & Dialysis", rating: 4.9, dist: "1.5 km", phone: "+91 98450 11223" }
  ],
  blood: [
    { name: "Dr. Nithya Swaminathan, MD", title: "Consultant Clinical Hematologist", hospital: "Cancer & Blood Care Center", rating: 4.8, dist: "2.8 km", phone: "+91 99400 88990" }
  ],
  brain: [
    { name: "Dr. Sameer Joshi, MCh", title: "Senior Neurologist", hospital: "National Neuro Sciences Center", rating: 4.9, dist: "1.9 km", phone: "+91 98100 44556" }
  ]
};

export default function EmergencyAlert({ flags, onClose }) {
  if (!flags || flags.length === 0) return null;

  // Gather specialists based on triggered organs in flags
  const triggeredOrgans = Array.from(new Set(flags.map(f => f.organ || 'cardiovascular')));
  
  let specialists = [];
  triggeredOrgans.forEach(org => {
    if (SPECIALISTS_DATABASE[org]) {
      specialists = [...specialists, ...SPECIALISTS_DATABASE[org]];
    }
  });
  
  if (specialists.length === 0) {
    specialists = SPECIALISTS_DATABASE.cardiovascular; // Default
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-bg/90 backdrop-blur-xl animate-fade-in">
      {/* Outer Pulse Border */}
      <div className="absolute inset-0 border-4 border-cyber-red/30 animate-pulse pointer-events-none" />

      {/* Main Alert Modal */}
      <div className="w-full max-w-3xl glassmorphism glow-red rounded-3xl overflow-hidden border border-cyber-red/60 shadow-[0_0_50px_rgba(255,74,90,0.3)] flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Hand Warnings Panel */}
        <div className="p-6 md:p-8 bg-gradient-to-b from-cyber-red/20 to-cyber-bg flex flex-col justify-between items-center md:items-start text-center md:text-left md:w-5/12 border-b md:border-b-0 md:border-r border-cyber-red/25">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="p-3 bg-cyber-red/35 rounded-2xl glow-red animate-bounce">
              <AlertOctagon className="h-10 w-10 text-cyber-red" />
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                Clinical Crisis Detected
              </h2>
              <p className="text-xs text-cyber-red font-bold mt-1 tracking-wider uppercase">
                Deterministic Red Flag Rule Match
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-2 w-full text-left">
              {flags.map((flag, idx) => (
                <div key={idx} className="bg-cyber-bg/70 border border-cyber-red/30 p-2.5 rounded-lg flex flex-col gap-0.5">
                  <span className="text-[10px] text-cyber-gray uppercase font-bold">Biomarker Alert</span>
                  <span className="text-xs font-bold text-white flex items-center justify-between">
                    {flag.marker}: <strong className="text-cyber-red">{flag.value} {flag.unit}</strong>
                  </span>
                  <span className="text-[10px] text-cyber-red font-semibold leading-snug mt-1">
                    {flag.condition}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 w-full">
            <a 
              href="tel:102"
              className="w-full py-3 bg-cyber-red hover:bg-red-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-cyber-red/25 flex items-center justify-center gap-2"
            >
              <Phone className="h-4.5 w-4.5 animate-pulse" />
              Dial Emergency (102 / 112)
            </a>
            
            <button 
              onClick={onClose}
              className="w-full py-2.5 mt-2 bg-transparent text-cyber-gray hover:text-slate-300 font-bold text-xs rounded-xl hover:underline transition-all"
            >
              Acknowledge & Close Panel
            </button>
          </div>
        </div>

        {/* Right Hand Specialists / Finder Panel */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto flex flex-col gap-5">
          <div>
            <h3 className="text-md font-extrabold text-slate-100 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-cyber-cyan" />
              Urgent Specialty Care Network
            </h3>
            <p className="text-xs text-cyber-gray mt-1">
              Top-rated clinicians in your spatial cluster matched to these active risks:
            </p>
          </div>

          {/* Specialist List */}
          <div className="flex flex-col gap-3">
            {specialists.map((spec, idx) => (
              <div 
                key={idx} 
                className="bg-cyber-bg/60 border border-slate-800/80 p-4 rounded-2xl flex justify-between items-center hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-100">{spec.name}</h4>
                    <div className="flex items-center text-[10px] text-cyber-amber font-extrabold gap-0.5">
                      <Star className="h-3 w-3 fill-cyber-amber stroke-cyber-amber" />
                      {spec.rating}
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-cyber-cyan mt-0.5 uppercase tracking-wider">{spec.title}</p>
                  <p className="text-[10px] text-cyber-gray mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {spec.hospital} ({spec.dist})
                  </p>
                </div>

                <a 
                  href={`tel:${spec.phone}`}
                  className="px-3 py-1.5 bg-cyber-cardLight border border-slate-700/60 hover:border-cyber-cyan text-cyber-cyan text-[10px] font-extrabold rounded-lg transition-all"
                >
                  Consult
                </a>
              </div>
            ))}
          </div>

          {/* Cyber Radar Location Grid mockup */}
          <div className="border border-slate-800 rounded-2xl p-4 bg-cyber-bg/40 relative overflow-hidden flex flex-col items-center text-center">
            {/* Pulsing circular grid background */}
            <div className="absolute inset-0 opacity-10 flex items-center justify-center">
              <div className="border border-cyber-cyan rounded-full h-32 w-32 animate-ping" />
              <div className="border border-cyber-cyan rounded-full h-16 w-16" />
            </div>

            <Navigation className="h-6 w-6 text-cyber-cyan animate-pulse z-10" />
            <h4 className="text-xs font-bold text-slate-200 mt-2 z-10">Nearest Hospital ER Facility Locator</h4>
            <p className="text-[10px] text-cyber-gray mt-1 max-w-xs z-10">
              Metro Trauma Center (1.4 km) - Ambulatory & ICU facilities active. GPS tracking synced.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
