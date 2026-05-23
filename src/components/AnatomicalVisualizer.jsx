import React, { useState } from 'react';
import { Cpu, Heart, Activity, Droplet, Flame, ShieldAlert, Sparkles } from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   CLINICAL ANATOMICAL VISUALIZER — Light Medical Theme
   ══════════════════════════════════════════════════════════ */

const getOrganColor = (score) => {
  if (score === undefined || score === null) return { stroke: '#94A3B8', fill: 'rgba(148,163,184,0.08)', dot: '#94A3B8', ring: '#94A3B8' };
  if (score < 40)  return { stroke: '#EF4444', fill: 'rgba(239,68,68,0.10)',  dot: '#EF4444', ring: '#EF4444' };
  if (score < 80)  return { stroke: '#F59E0B', fill: 'rgba(245,158,11,0.10)', dot: '#F59E0B', ring: '#F59E0B' };
  return              { stroke: '#22C55E', fill: 'rgba(34,197,94,0.10)',   dot: '#22C55E', ring: '#22C55E' };
};

const organsList = [
  { id: 'brain',          name: 'Neurological',    shortName: 'Brain',   icon: Cpu,        score: null, cx: 100, cy: 45,  r: 18, iX: 135, iY: 45 },
  { id: 'cardiovascular', name: 'Cardiovascular',  shortName: 'Heart',   icon: Heart,      score: null, cx: 108, cy: 120, r: 14, iX: 45,  iY: 120 },
  { id: 'liver',          name: 'Hepatic',         shortName: 'Liver',   icon: Activity,   score: null, cx: 88,  cy: 155, r: 12, iX: 40,  iY: 165 },
  { id: 'pancreas',       name: 'Metabolic',       shortName: 'Pancreas',icon: Flame,      score: null, cx: 104, cy: 172, r: 10, iX: 148, iY: 180 },
  { id: 'kidneys',        name: 'Renal',           shortName: 'Kidneys', icon: ShieldAlert, score: null, cx: 100, cy: 200, r: 13, iX: 35,  iY: 215 },
  { id: 'blood',          name: 'Hematopoietic',   shortName: 'Blood',   icon: Droplet,    score: null, cx: 110, cy: 262, r: 15, iX: 152, iY: 275 },
];

export default function AnatomicalVisualizer({ organScores, activeOrgan, onSelectOrgan, overallRisk }) {
  const [hoveredOrgan, setHoveredOrgan] = useState(null);

  const organs = organsList.map(o => ({
    ...o,
    score: organScores?.[o.id] ?? 100,
    description: getDescription(o.id),
  }));

  function getDescription(id) {
    const map = {
      brain:          'Controls electrical signals. Sensitive to electrolyte fluctuations (Sodium).',
      cardiovascular: 'Pumps oxygenated blood. Risk markers: Troponin, Potassium, LDL Cholesterol.',
      liver:          'Detoxification and protein synthesis. Risk markers: AST and ALT enzymes.',
      pancreas:       'Regulates glucose metabolism. Key marker: Fasting Glucose.',
      kidneys:        'Filters cellular wastes. Key indicator: Blood Creatinine clearance.',
      blood:          'Carries oxygen, controls clotting. Markers: Hemoglobin and Platelets.',
    };
    return map[id] || '';
  }

  const riskBadgeStyle = {
    critical: 'badge-critical',
    medium:   'badge-warning',
    normal:   'badge-normal',
  }[overallRisk] || 'badge-normal';

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Sparkles className="h-4 w-4 text-blue-500" />
            Organ Risk Map
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Click any organ to filter biomarkers
          </p>
        </div>
        <span className={riskBadgeStyle}>
          {overallRisk === 'critical' ? '⚠ Critical' : overallRisk === 'medium' ? '⚡ Warning' : '✓ Normal'}
        </span>
      </div>

      {/* SVG Body Canvas */}
      <div
        className="relative mx-auto rounded-xl overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '260px',
          height: '420px',
          background: 'linear-gradient(180deg, #F8FBFF 0%, #EFF6FF 100%)',
          border: '1px solid #BFDBFE',
        }}
      >
        {/* Subtle grid dots */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#BFDBFE 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />

        <svg viewBox="0 0 200 480" className="w-full h-full" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="bodyFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#EFF6FF" stopOpacity="0.9" />
              <stop offset="50%"  stopColor="#DBEAFE" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#EFF6FF" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Human silhouette */}
          <path
            d="M100,20 C110,20 120,25 120,40 C120,55 112,65 115,70 C125,75 145,85 155,95 C165,105 162,125 155,145 C148,165 140,185 138,205 C136,225 142,260 142,295 C142,330 135,370 132,410 C129,450 132,465 125,472 C118,479 105,479 100,465 C95,479 82,479 75,472 C68,465 71,450 68,410 C65,370 58,330 58,295 C58,260 64,225 62,205 C60,185 52,165 45,145 C38,125 35,105 45,95 C55,85 75,75 85,70 C88,65 80,55 80,40 C80,25 90,20 100,20 Z"
            fill="url(#bodyFill)"
            stroke="#BFDBFE"
            strokeWidth="1.5"
          />

          {/* Organ hotspots */}
          {organs.map((organ) => {
            const isHovered = hoveredOrgan === organ.id;
            const isActive  = activeOrgan  === organ.id;
            const colors = getOrganColor(organ.score);

            return (
              <g
                key={organ.id}
                className="cursor-pointer"
                onClick={() => onSelectOrgan(organ.id === activeOrgan ? null : organ.id)}
                onMouseEnter={() => setHoveredOrgan(organ.id)}
                onMouseLeave={() => setHoveredOrgan(null)}
              >
                {/* Outer animated halo */}
                {(isHovered || isActive) && (
                  <circle
                    cx={organ.cx} cy={organ.cy} r={organ.r + 8}
                    fill="none"
                    stroke={colors.ring} strokeOpacity="0.3"
                    strokeWidth="2" strokeDasharray="4,3"
                    style={{ transformOrigin: `${organ.cx}px ${organ.cy}px`, animation: 'spin 6s linear infinite' }}
                  />
                )}

                {/* Organ circle */}
                <circle
                  cx={organ.cx} cy={organ.cy} r={organ.r}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isActive ? 2 : 1.5}
                  opacity={isHovered || isActive ? 1 : 0.8}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* Center dot */}
                <circle
                  cx={organ.cx} cy={organ.cy} r={organ.score < 40 ? 5 : 3.5}
                  fill={colors.dot}
                  style={organ.score < 40 ? { animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite' } : {}}
                />

                {/* Pointer line on hover */}
                {(isHovered || isActive) && (
                  <g opacity="0.7">
                    <line
                      x1={organ.cx} y1={organ.cy}
                      x2={organ.iX} y2={organ.iY}
                      stroke={colors.stroke} strokeWidth="1" strokeDasharray="2,2"
                    />
                    <circle cx={organ.iX} cy={organ.iY} r="3" fill={colors.stroke} />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip overlay */}
        {hoveredOrgan && (() => {
          const o = organs.find(x => x.id === hoveredOrgan);
          const colors = getOrganColor(o.score);
          const Icon = o.icon;
          return (
            <div className="absolute bottom-3 inset-x-3 rounded-xl p-3 animate-fade-in"
              style={{ background: 'rgba(255,255,255,0.95)', border: `1px solid ${colors.stroke}40`, backdropFilter: 'blur(8px)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: colors.dot }} />
                  {o.name}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{
                  color: colors.dot,
                  background: `${colors.fill}`,
                  border: `1px solid ${colors.stroke}40`
                }}>
                  {o.score}/100
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">{o.description}</p>
            </div>
          );
        })()}
      </div>

      {/* Organ Quick-Nav Grid */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {organs.map((organ) => {
          const Icon = organ.icon;
          const isActive = activeOrgan === organ.id;
          const colors = getOrganColor(organ.score);

          return (
            <button
              key={organ.id}
              onClick={() => onSelectOrgan(organ.id === activeOrgan ? null : organ.id)}
              className="rounded-xl py-2 px-1.5 flex flex-col items-center justify-center transition-all"
              style={{
                background: isActive ? colors.fill : '#F8FBFF',
                border: isActive ? `1.5px solid ${colors.stroke}` : '1.5px solid #E2E8F0',
                boxShadow: isActive ? `0 2px 8px ${colors.stroke}25` : 'none',
              }}
            >
              <Icon
                className="h-4 w-4 mb-1"
                style={{ color: colors.dot }}
              />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                {organ.shortName}
              </span>
              <span className="text-[11px] font-black mt-0.5" style={{ color: colors.dot }}>
                {organ.score}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
