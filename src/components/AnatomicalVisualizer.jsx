import React, { useState } from 'react';
import { Cpu, Heart, Activity, Droplet, Flame, ShieldAlert, Sparkles } from 'lucide-react';

export default function AnatomicalVisualizer({ organScores, activeOrgan, onSelectOrgan, overallRisk }) {
  const [hoveredOrgan, setHoveredOrgan] = useState(null);
  const [viewMode, setViewMode] = useState('organs'); // 'organs' | 'skeletal'

  // Severity color maps
  const getOrganColorClass = (score) => {
    if (score === undefined || score === null) return 'text-slate-500 fill-slate-800 border-slate-700';
    if (score < 40) return 'text-cyber-red fill-cyber-red/20 glow-red border-cyber-red';
    if (score < 80) return 'text-cyber-amber fill-cyber-amber/20 glow-amber border-cyber-amber';
    return 'text-cyber-emerald fill-cyber-emerald/20 glow-emerald border-cyber-emerald';
  };

  const getOrganGlowClass = (score, isHovered, isActive) => {
    const activeOrHovered = isActive || isHovered;
    if (score < 40) {
      return activeOrHovered 
        ? 'stroke-cyber-red fill-cyber-red/35 filter drop-shadow-[0_0_8px_rgba(255,74,90,0.8)]' 
        : 'stroke-cyber-red/60 fill-cyber-red/10 animate-pulse';
    }
    if (score < 80) {
      return activeOrHovered 
        ? 'stroke-cyber-amber fill-cyber-amber/35 filter drop-shadow-[0_0_8px_rgba(255,184,0,0.8)]' 
        : 'stroke-cyber-amber/60 fill-cyber-amber/10';
    }
    return activeOrHovered 
      ? 'stroke-cyber-emerald fill-cyber-emerald/35 filter drop-shadow-[0_0_8px_rgba(5,205,153,0.8)]' 
      : 'stroke-cyber-emerald/60 fill-cyber-emerald/5';
  };

  const organsList = [
    {
      id: 'brain',
      name: 'Neurological System (Brain)',
      icon: Cpu,
      score: organScores?.brain ?? 100,
      description: 'Controls electrical signals. Sensitive to severe electrolyte fluctuations (Sodium).',
      // SVG Position relative to 200x500 viewport
      cx: 100, cy: 45, r: 18,
      indicatorX: 130, indicatorY: 45
    },
    {
      id: 'cardiovascular',
      name: 'Cardiovascular System (Heart)',
      icon: Heart,
      score: organScores?.cardiovascular ?? 100,
      description: 'Pumps oxygenated blood. Risk markers: Troponin, Potassium, LDL Cholesterol.',
      cx: 108, cy: 120, r: 14,
      indicatorX: 45, indicatorY: 120
    },
    {
      id: 'liver',
      name: 'Hepatic System (Liver)',
      icon: Activity,
      score: organScores?.liver ?? 100,
      description: 'Detoxification and protein synthesis. Risk markers: AST and ALT cellular enzymes.',
      cx: 88, cy: 155, r: 12,
      indicatorX: 40, indicatorY: 165
    },
    {
      id: 'pancreas',
      name: 'Metabolic / Pancreas',
      icon: Flame,
      score: organScores?.pancreas ?? 100,
      description: 'Regulates glucose metabolism and insulin production. Key marker: Fasting Glucose.',
      cx: 102, cy: 170, r: 10,
      indicatorX: 145, indicatorY: 180
    },
    {
      id: 'kidneys',
      name: 'Renal System (Kidneys)',
      icon: ShieldAlert,
      score: organScores?.kidneys ?? 100,
      description: 'Filters cellular wastes. Essential indicator: Blood Creatinine clearance.',
      cx: 100, cy: 198, r: 13,
      indicatorX: 35, indicatorY: 215
    },
    {
      id: 'blood',
      name: 'Hematopoietic System (Blood)',
      icon: Droplet,
      score: organScores?.blood ?? 100,
      description: 'Carries oxygen and controls clotting. Risk markers: Hemoglobin and Platelets.',
      cx: 110, cy: 260, r: 15,
      indicatorX: 150, indicatorY: 275
    }
  ];

  return (
    <div className="glassmorphism-glow glow-cyan p-6 rounded-2xl relative overflow-hidden flex flex-col items-center h-full">
      {/* Dynamic Cyber Scanner Backdrop */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-40 animate-scan pointer-events-none" />
      
      {/* Title Header */}
      <div className="w-full flex items-center justify-between mb-6 z-10">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyber-cyan animate-pulse" />
            Anatomical Risk Spatial Map
          </h3>
          <p className="text-xs text-cyber-gray">
            Interactive diagnostic wireframe showing localized impacts
          </p>
        </div>
        
        {/* Toggle Toggles */}
        <div className="flex gap-1 bg-cyber-bg/80 border border-slate-700/60 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('organs')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              viewMode === 'organs' 
                ? 'bg-cyber-cyan text-cyber-bg font-bold shadow-md shadow-cyber-cyan/20' 
                : 'text-cyber-gray hover:text-slate-100'
            }`}
          >
            Organs View
          </button>
          <button 
            onClick={() => setViewMode('skeletal')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              viewMode === 'skeletal' 
                ? 'bg-cyber-cyan text-cyber-bg font-bold shadow-md shadow-cyber-cyan/20' 
                : 'text-cyber-gray hover:text-slate-100'
            }`}
          >
            Skeletal Wire
          </button>
        </div>
      </div>

      {/* Main Body Canvas */}
      <div className="relative flex justify-center w-full max-w-[280px] h-[460px] bg-cyber-bg/40 border border-slate-800/40 rounded-xl p-2 z-10 select-none">
        
        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#00f2fe_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <svg viewBox="0 0 200 500" className="w-full h-full">
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0b1329" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#1e293b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#030712" stopOpacity="0.9" />
            </linearGradient>
            <radialGradient id="organHighlight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Body Outline Silhouette */}
          <path
            d="M100,20 C110,20 120,25 120,40 C120,55 112,65 115,70 C125,75 145,85 155,95 C165,105 162,125 155,145 C148,165 140,185 138,205 C136,225 142,260 142,295 C142,330 135,370 132,410 C129,450 132,475 125,485 C118,495 105,495 100,480 C95,495 82,495 75,485 C68,475 71,450 68,410 C65,370 58,330 58,295 C58,260 64,225 62,205 C60,185 52,165 45,145 C38,125 35,105 45,95 C55,85 75,75 85,70 C88,65 80,55 80,40 C80,25 90,20 100,20 Z"
            fill="url(#bodyGradient)"
            stroke="rgba(0, 242, 254, 0.25)"
            strokeWidth="1.5"
            className="transition-all duration-700"
          />

          {/* 2. Skeletal Wireframe System (renders if selected) */}
          {viewMode === 'skeletal' && (
            <g opacity="0.4" stroke="#00f2fe" strokeWidth="1" strokeLinecap="round" fill="none">
              {/* Spine */}
              <line x1="100" y1="70" x2="100" y2="280" strokeDasharray="3,3" />
              {/* Ribcage */}
              <path d="M78,115 Q100,105 122,115 M72,130 Q100,120 128,130 M70,145 Q100,135 130,145 M72,160 Q100,150 128,160 M75,175 Q100,165 125,175" />
              {/* Pelvis */}
              <path d="M75,270 L125,270 L115,295 L85,295 Z" />
              {/* Arm skeleton */}
              <line x1="115" y1="80" x2="148" y2="145" />
              <line x1="148" y1="145" x2="175" y2="200" />
              <line x1="85" y1="80" x2="52" y2="145" />
              <line x1="52" y1="145" x2="25" y2="200" />
              {/* Leg skeleton */}
              <line x1="88" y1="295" x2="80" y2="390" />
              <line x1="80" y1="390" x2="72" y2="480" />
              <line x1="112" y1="295" x2="120" y2="390" />
              <line x1="120" y1="390" x2="128" y2="480" />
            </g>
          )}

          {/* 3. Organ Hotspots & Dynamic Indicator Lines */}
          <g>
            {organsList.map((organ) => {
              const isHovered = hoveredOrgan === organ.id;
              const isActive = activeOrgan === organ.id;
              const styleClass = getOrganGlowClass(organ.score, isHovered, isActive);

              return (
                <g 
                  key={organ.id} 
                  className="cursor-pointer"
                  onClick={() => onSelectOrgan(organ.id)}
                  onMouseEnter={() => setHoveredOrgan(organ.id)}
                  onMouseLeave={() => setHoveredOrgan(null)}
                >
                  {/* Outer Glow Halo Ring */}
                  {(isHovered || isActive) && (
                    <circle 
                      cx={organ.cx} 
                      cy={organ.cy} 
                      r={organ.r + 8} 
                      fill="none" 
                      stroke={organ.score < 40 ? '#ff4a5a' : organ.score < 80 ? '#ffb800' : '#05cd99'} 
                      strokeOpacity="0.4"
                      strokeWidth="1.5"
                      strokeDasharray="4,2"
                      className="animate-spin"
                      style={{ transformOrigin: `${organ.cx}px ${organ.cy}px`, animationDuration: '6s' }}
                    />
                  )}

                  {/* Pulsing Organ Shape */}
                  <circle
                    cx={organ.cx}
                    cy={organ.cy}
                    r={organ.r}
                    strokeWidth="1.5"
                    className={`transition-all duration-300 ${styleClass}`}
                  />
                  
                  {/* Central Node Dot */}
                  <circle
                    cx={organ.cx}
                    cy={organ.cy}
                    r="4"
                    fill={organ.score < 40 ? '#ff4a5a' : organ.score < 80 ? '#ffb800' : '#05cd99'}
                    className={isActive ? 'animate-ping' : ''}
                  />

                  {/* Pointer Line to indicator label */}
                  {(isHovered || isActive) && (
                    <g opacity="0.8">
                      <line 
                        x1={organ.cx} 
                        y1={organ.cy} 
                        x2={organ.indicatorX} 
                        y2={organ.indicatorY} 
                        stroke="#00f2fe" 
                        strokeWidth="1" 
                        strokeDasharray="2,2" 
                      />
                      <circle 
                        cx={organ.indicatorX} 
                        cy={organ.indicatorY} 
                        r="3" 
                        fill="#00f2fe" 
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Mini Overlay for active/hovered Organ */}
        {hoveredOrgan && (
          <div className="absolute bottom-4 inset-x-4 bg-cyber-bg/95 border border-slate-700/80 p-3 rounded-lg text-left glassmorphism transition-all animate-fade-in">
            {(() => {
              const o = organsList.find(item => item.id === hoveredOrgan);
              const Icon = o.icon;
              return (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <Icon className={`h-3.5 w-3.5 ${o.score < 40 ? 'text-cyber-red' : o.score < 80 ? 'text-cyber-amber' : 'text-cyber-emerald'}`} />
                      {o.name}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      o.score < 40 ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/35' : 
                      o.score < 80 ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/35' : 
                      'bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/35'
                    }`}>
                      Score: {o.score}/100
                    </span>
                  </div>
                  <p className="text-[10px] text-cyber-gray leading-relaxed">{o.description}</p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Grid of organ summaries for quick navigation */}
      <div className="w-full grid grid-cols-3 gap-2 mt-4 z-10">
        {organsList.map((organ) => {
          const Icon = organ.icon;
          const isActive = activeOrgan === organ.id;
          return (
            <button
              key={organ.id}
              onClick={() => onSelectOrgan(organ.id)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                isActive 
                  ? 'bg-cyber-cardLight border-cyber-cyan glow-cyan' 
                  : 'bg-cyber-bg/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 mb-1 ${
                organ.score < 40 ? 'text-cyber-red' : 
                organ.score < 80 ? 'text-cyber-amber' : 
                'text-cyber-emerald'
              } ${isActive ? 'animate-pulse' : ''}`} />
              
              <span className="text-[9px] font-bold text-slate-300 text-center truncate w-full">
                {organ.id.toUpperCase()}
              </span>
              
              <span className={`text-[10px] font-extrabold mt-0.5 ${
                organ.score < 40 ? 'text-cyber-red' : 
                organ.score < 80 ? 'text-cyber-amber' : 
                'text-cyber-emerald'
              }`}>
                {organ.score}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
