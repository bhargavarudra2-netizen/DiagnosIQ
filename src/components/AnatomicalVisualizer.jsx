import React, { useState } from 'react';
import { Cpu, Heart, Activity, Droplet, Flame, ShieldAlert, Sparkles } from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   CLINICAL ANATOMICAL VISUALIZER — Dark SaaS Theme
   ══════════════════════════════════════════════════════════ */

const getOrganColor = (score) => {
  if (score === undefined || score === null) return { stroke: 'rgba(255,255,255,0.2)', fill: 'rgba(255,255,255,0.02)', dot: '#94A3B8', ring: 'rgba(255,255,255,0.1)' };
  if (score < 40)  return { stroke: '#EF4444', fill: 'rgba(239,68,68,0.10)',  dot: '#EF4444', ring: '#EF4444' };
  if (score < 80)  return { stroke: '#F59E0B', fill: 'rgba(245,158,11,0.10)', dot: '#F59E0B', ring: '#F59E0B' };
  return              { stroke: '#10B981', fill: 'rgba(16,185,129,0.10)',   dot: '#10B981', ring: '#10B981' };
};

const organsList = [
  { id: 'brain',          name: 'Neurological System',    shortName: 'Brain',   icon: Cpu,        score: null, cx: 100, cy: 45,  r: 16, iX: 135, iY: 45 },
  { id: 'cardiovascular', name: 'Cardiovascular System',  shortName: 'Heart',   icon: Heart,      score: null, cx: 108, cy: 120, r: 13, iX: 45,  iY: 120 },
  { id: 'liver',          name: 'Hepatic System',         shortName: 'Liver',   icon: Activity,   score: null, cx: 88,  cy: 155, r: 11, iX: 40,  iY: 165 },
  { id: 'pancreas',       name: 'Metabolic / Pancreas',    shortName: 'Pancreas',icon: Flame,      score: null, cx: 104, cy: 172, r: 10, iX: 148, iY: 180 },
  { id: 'kidneys',        name: 'Renal System',           shortName: 'Kidneys', icon: ShieldAlert, score: null, cx: 100, cy: 200, r: 12, iX: 35,  iY: 215 },
  { id: 'blood',          name: 'Hematopoietic System',   shortName: 'Blood',   icon: Droplet,    score: null, cx: 110, cy: 262, r: 14, iX: 152, iY: 275 },
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
      brain:          'Neural transmissions and brain tissue status. Highly sensitive to Sodium electrolyte levels.',
      cardiovascular: 'Heart muscle perfusion and oxygenation status. Monitored via Troponin I, Potassium, and LDL-C.',
      liver:          'Hepatic cell metabolism and filtration enzymes. Assessed via AST (SGOT) and ALT (SGPT) assay levels.',
      pancreas:       'Insulin production and systemic glucose load. Verified via Fasting Glucose markers.',
      kidneys:        'Renal glomerular clearance rate and chemical filtration load. Indexed via Serum Creatinine clearance.',
      blood:          'Hematopoietic cell integrity and oxygen transport. Maintained via Hemoglobin and Platelets panels.',
    };
    return map[id] || '';
  }

  const riskBadgeStyle = {
    critical: 'badge-critical',
    medium:   'badge-warning',
    normal:   'badge-normal',
  }[overallRisk] || 'badge-normal';

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden">
      
      {/* Subtle top background mesh glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-diag-cyan/[0.02] blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5" style={{ fontFamily: 'Geist, sans-serif' }}>
            <Sparkles className="h-4 w-4 text-diag-cyan" />
            Biological Stress Map
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Filter biomarkers by systemic organ stress hotspots
          </p>
        </div>
        <span className={`${riskBadgeStyle} text-[9px] py-0.5 px-2`}>
          {overallRisk === 'critical' ? '⚠ Critical Deviation' : overallRisk === 'medium' ? '⚡ Warning' : '✓ Cleared'}
        </span>
      </div>

      {/* SVG Human Canvas */}
      <div
        className="relative mx-auto rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center"
        style={{
          width: '100%',
          maxWidth: '250px',
          height: '380px',
          background: 'var(--diag-bg)',
        }}
      >
        {/* Fine grid dots */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#38BDF8 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />

        <svg viewBox="0 0 200 480" className="w-full h-full p-2" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="humanBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="var(--human-body-start)" stopOpacity="0.8" />
              <stop offset="50%"  stopColor="var(--human-body-mid)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--human-body-end)" stopOpacity="0.8" />
            </linearGradient>
            <filter id="meshGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.22   0 0 0 0 0.74   0 0 0 0 0.97  0 0 0 0.3 0" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Glowing Silhouette outline */}
          <path
            d="M100,20 C110,20 120,25 120,40 C120,55 112,65 115,70 C125,75 145,85 155,95 C165,105 162,125 155,145 C148,165 140,185 138,205 C136,225 142,260 142,295 C142,330 135,370 132,410 C129,450 132,465 125,472 C118,479 105,479 100,465 C95,479 82,479 75,472 C68,465 71,450 68,410 C65,370 58,330 58,295 C58,260 64,225 62,205 C60,185 52,165 45,145 C38,125 35,105 45,95 C55,85 75,75 85,70 C88,65 80,55 80,40 C80,25 90,20 100,20 Z"
            fill="url(#humanBodyGrad)"
            stroke="var(--diag-border-active)"
            strokeWidth="1.5"
          />

          {/* Organ interactive layers */}
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
                {/* Outer spin rings */}
                {(isHovered || isActive) && (
                  <circle
                    cx={organ.cx} cy={organ.cy} r={organ.r + 6}
                    fill="none"
                    stroke={colors.stroke} strokeOpacity="0.4"
                    strokeWidth="1.2" strokeDasharray="3,3"
                    style={{ transformOrigin: `${organ.cx}px ${organ.cy}px` }}
                  />
                )}

                {/* Organ glowing card circle */}
                <circle
                  cx={organ.cx} cy={organ.cy} r={organ.r}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isActive ? 1.8 : 1.2}
                  opacity={isHovered || isActive ? 1 : 0.7}
                  style={{ transition: 'all 0.25s ease' }}
                />

                {/* Center Core dot */}
                <circle
                  cx={organ.cx} cy={organ.cy} r={organ.score < 40 ? 4 : 2.5}
                  fill={colors.dot}
                />

                {/* Fine Pointer Lines */}
                {(isHovered || isActive) && (
                  <g opacity="0.6">
                    <line
                      x1={organ.cx} y1={organ.cy}
                      x2={organ.iX} y2={organ.iY}
                      stroke={colors.stroke} strokeWidth="0.8" strokeDasharray="2,2"
                    />
                    <circle cx={organ.iX} cy={organ.iY} r="2" fill={colors.stroke} />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tactical Hover Popup */}
        {hoveredOrgan && (() => {
          const o = organs.find(x => x.id === hoveredOrgan);
          const colors = getOrganColor(o.score);
          const Icon = o.icon;
          return (
            <div className="absolute bottom-3 inset-x-3 rounded-xl p-3 border border-white/5 animate-fade-in"
              style={{
                background: 'var(--diag-navy)',
                borderColor: 'var(--diag-border)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-100 flex items-center gap-1.5" style={{ fontFamily: 'Geist, sans-serif' }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: colors.dot }} />
                  {o.name}
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{
                  color: colors.dot,
                  background: `${colors.fill}`,
                  border: `1.5px solid ${colors.stroke}30`
                }}>
                  {o.score} / 100
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">{o.description}</p>
            </div>
          );
        })()}
      </div>

      {/* Tactile Organ selector grid */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {organs.map((organ) => {
          const Icon = organ.icon;
          const isActive = activeOrgan === organ.id;
          const colors = getOrganColor(organ.score);

          return (
            <button
              key={organ.id}
              onClick={() => onSelectOrgan(organ.id === activeOrgan ? null : organ.id)}
              className="rounded-xl py-2 px-1.5 flex flex-col items-center justify-center transition-all focus:outline-none border"
              style={{
                background: isActive ? colors.fill : 'transparent',
                borderColor: isActive ? colors.stroke : 'var(--diag-border)',
                boxShadow: isActive ? `0 0 12px ${colors.stroke}15` : 'none',
              }}
            >
              <Icon
                className="h-4 w-4 mb-1"
                style={{ color: colors.dot }}
              />
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                {organ.shortName}
              </span>
              <span className="text-[10px] font-extrabold mt-0.5" style={{ color: colors.dot, fontFamily: 'JetBrains Mono' }}>
                {organ.score}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
