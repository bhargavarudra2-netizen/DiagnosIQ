import React, { useEffect, useRef, useState } from 'react';
import { Shield, Activity, Sparkles } from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   DIAGNOSIQ PREMIUM VISUAL EFFECTS COMPONENT LIBRARY
   Apple Health + Linear inspired minimalist healthcare visual components
   ══════════════════════════════════════════════════════════ */

/* ── 1. Animated DiagnosIQ Logo Emblem ───────────────────── */
export function AnimatedRedCross({ size = 32, pulse = true, spin = false, glow = true, className = '' }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer subtle halo ring */}
      {glow && (
        <div
          className={`absolute inset-0 rounded-xl border border-diag-cyan/20 ${pulse ? 'animate-pulse' : ''}`}
          style={{
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.15)',
            background: 'rgba(56, 189, 248, 0.02)',
          }}
        />
      )}
      
      {/* Sleek, minimalistic medical shield/cross emblem */}
      <svg
        viewBox="0 0 100 100"
        width={size * 0.8}
        height={size * 0.8}
        className={pulse ? 'red-cross-heartbeat' : ''}
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
          <filter id="logoGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Soft cyan clean clinical cross */}
        <rect
          x="38" y="15" width="24" height="70" rx="8"
          fill="url(#logoGrad)"
          filter={glow ? 'url(#logoGlow)' : ''}
        />
        <rect
          x="15" y="38" width="70" height="24" rx="8"
          fill="url(#logoGrad)"
          filter={glow ? 'url(#logoGlow)' : ''}
        />
        
        {/* Modern central neural dot representing AI */}
        <circle cx="50" cy="50" r="7" fill="var(--diag-bg)" />
        <circle cx="50" cy="50" r="4" fill="var(--diag-cyan)" />
      </svg>
    </div>
  );
}

/* ── 2. Sleek ECG / Heartbeat Wave ───────────────────────── */
export function ECGStrip({ color = '#38BDF8', height = 40, className = '' }) {
  return (
    <div className={`ecg-container relative z-10 overflow-hidden w-full ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 800 40"
        preserveAspectRatio="none"
        width="100%"
        height={height}
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="ecgLineFade" x1="0%" x2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="15%" stopColor={color} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color} stopOpacity="0.9" />
            <stop offset="85%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id="ecgLineGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Thin grids */}
        <g opacity="0.02">
          {Array.from({ length: 40 }).map((_, i) => (
            <line key={i} x1={i * 20} y1="0" x2={i * 20} y2="40" stroke="#FFF" strokeWidth="0.5" />
          ))}
          {[10, 20, 30].map(y => (
            <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#FFF" strokeWidth="0.5" />
          ))}
        </g>
        
        {/* Clean, calm cardiogram path */}
        <path
          d="M0,20 L80,20 L90,20 L95,14 L100,20 L106,20 L110,18 L112,4 L114,36 L118,20 L122,23 L125,20 L240,20 L250,20 L255,14 L260,20 L266,20 L270,18 L272,4 L274,36 L278,20 L282,23 L285,20 L400,20 L410,20 L415,14 L420,20 L426,20 L430,18 L432,4 L434,36 L438,20 L442,23 L445,20 L560,20 L570,20 L575,14 L580,20 L586,20 L590,18 L592,4 L594,36 L598,20 L602,23 L605,20 L720,20 L730,20 L735,14 L740,20 L746,20 L750,18 L752,4 L754,36 L758,20 L762,23 L765,20 L800,20"
          stroke="url(#ecgLineFade)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ecgLineGlow)"
        />
        
        {/* Elegant glowing active sweep dot */}
        <circle r="2.5" fill={color} filter="url(#ecgLineGlow)" opacity="0.8">
          <animateMotion
            dur="4s"
            repeatCount="indefinite"
            path="M0,20 L80,20 L90,20 L95,14 L100,20 L106,20 L110,18 L112,4 L114,36 L118,20 L122,23 L125,20 L240,20 L250,20 L255,14 L260,20 L266,20 L270,18 L272,4 L274,36 L278,20 L282,23 L285,20 L400,20 L410,20 L415,14 L420,20 L426,20 L430,18 L432,4 L434,36 L438,20 L442,23 L445,20 L560,20 L570,20 L575,14 L580,20 L586,20 L590,18 L592,4 L594,36 L598,20 L602,23 L605,20 L720,20 L730,20 L735,14 L740,20 L746,20 L750,18 L752,4 L754,36 L758,20 L762,23 L765,20 L800,20"
          />
        </circle>
      </svg>
    </div>
  );
}

/* ── 3. Blood Drops (REMOVED: Wiped cyber gaming visual) ── */
export function BloodDrops() {
  return null;
}

/* ── 4. Blood Cells (REMOVED: Wiped cyber gaming visual) ── */
export function BloodCells() {
  return null;
}

/* ── 5. Blood Streaks (REMOVED: Wiped cyber gaming visual) ── */
export function BloodStreaks() {
  return null;
}

/* ── 6. Data Streams (REMOVED: Wiped cyber matrix visual) ── */
export function DataStreams() {
  return null;
}

/* ── 7. Minimal, High-End Live Vitals Widget ─────────────── */
export function VitalsMonitor({ bpm = 72, spo2 = 98, bp = '120/80', temp = 98.6, className = '' }) {
  const [currentBpm, setCurrentBpm] = useState(bpm);
  const [pulseActive, setPulseActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBpm(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(65, Math.min(95, prev + delta));
      });
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 200);
    }, (60 * 1000) / bpm);
    return () => clearInterval(interval);
  }, [bpm]);

  const stats = [
    { label: 'Heart Rate', value: currentBpm, unit: 'BPM', color: '#38BDF8', pulse: pulseActive },
    { label: 'Oxygen SpO₂', value: spo2, unit: '%', color: '#10B981', pulse: false },
    { label: 'Blood Press.', value: bp, unit: 'mmHg', color: '#818CF8', pulse: false },
    { label: 'Body Temp.', value: temp, unit: '°F', color: '#F59E0B', pulse: false },
  ];

  return (
    <div className={`glass-card rounded-2xl p-4 border border-white/5 cyan-glow-subtle ${className}`}>
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-diag-cyan" />
          Clinical Vitals telemetry
        </span>
        <span className="text-[9px] font-bold text-diag-emerald bg-diag-emeraldSoft px-2 py-0.5 rounded-full uppercase tracking-wider">
          Stable
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl border border-white/5 text-center flex flex-col justify-between"
            style={{ background: 'rgba(255, 255, 255, 0.01)' }}
          >
            <div
              className={`text-base font-bold vitals-counter transition-all duration-300 ${s.pulse ? 'scale-105 text-diag-cyan' : ''}`}
              style={{ color: s.color, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {s.value}
            </div>
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wide mt-1">{s.unit}</div>
            <div className="text-[8px] font-semibold text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 8. Elegant Startup-grade Status Badge ──────────────── */
export function HospitalStatusBadge({ status = 'OPERATIONAL', className = '' }) {
  const badgeConfig = {
    OPERATIONAL: { color: '#10B981', bg: 'rgba(16,185,129,0.06)', label: 'DiagnosIQ Active' },
    SCANNING:    { color: '#38BDF8', bg: 'rgba(56,189,248,0.06)', label: 'Assay Pipeline Active' },
    ALERT:       { color: '#EF4444', bg: 'rgba(239,68,68,0.06)',  label: 'Emergency Alert' },
    STANDBY:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.06)',  label: 'Clinical Standby' },
  };
  const cfg = badgeConfig[status] || badgeConfig.OPERATIONAL;
  
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider border ${className}`}
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        borderColor: `${cfg.color}15`,
      }}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {status === 'ALERT' || status === 'SCANNING' ? (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: cfg.color }}
          />
        ) : null}
        <span
          className="relative inline-flex rounded-full h-1.5 w-1.5"
          style={{ backgroundColor: cfg.color }}
        />
      </span>
      {cfg.label}
    </div>
  );
}

/* ── 9. Interactive Red Cross Button (Minimal) ───────────── */
export function RedCrossButton({ onClick, label = 'Emergency Mode', size = 'md', className = '' }) {
  const buttonSizes = {
    sm: { size: 30, text: 'text-[10px]' },
    md: { size: 40, text: 'text-xs' },
    lg: { size: 54, text: 'text-sm' },
  };
  const s = buttonSizes[size] || buttonSizes.md;
  
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 group focus:outline-none transition-transform active:scale-95 ${className}`}
    >
      <div
        className="rounded-xl border border-white/5 flex items-center justify-center transition-all bg-white/[0.02] group-hover:bg-white/[0.05] group-hover:border-white/10"
        style={{ width: s.size, height: s.size }}
      >
        <AnimatedRedCross size={s.size * 0.7} pulse={false} glow={false} spin={false} />
      </div>
      <span className={`${s.text} font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-widest`}>
        {label}
      </span>
    </button>
  );
}

/* ── 10. Calm, Sophisticated Medical Particle Grid ──────── */
export function MedicalParticleField({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      if (canvas) {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Ultra-faint floating node particles
    const nodes = Array.from({ length: 24 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
    }));

    let animationId;
    const render = () => {
      ctx.clearRect(0, 0, W, H);
      
      // Draw nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fill();
      });

      // Draw faint connection mesh
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.04 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none select-none opacity-50 ${className}`}
    />
  );
}

/* ── 11. Floating Crosses (REMOVED: Gaming aesthetic) ────── */
export function FloatingCrosses() {
  return null;
}

/* ── 12. Premium Glowing Background ECG Graph ─────────────── */
export function BackgroundECGGraph({ className = '' }) {
  return (
    <div
      className={`absolute inset-x-0 top-1/4 h-[300px] pointer-events-none select-none overflow-hidden z-0 opacity-40 ${className}`}
      style={{
        maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)',
      }}
    >
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="smallGrid" width="15" height="15" patternUnits="userSpaceOnUse">
              <path d="M 15 0 L 0 0 0 15" fill="none" stroke="var(--diag-grid-line)" strokeWidth="0.5" />
            </pattern>
            <pattern id="grid" width="75" height="75" patternUnits="userSpaceOnUse">
              <rect width="75" height="75" fill="url(#smallGrid)" />
              <path d="M 75 0 L 0 0 0 75" fill="none" stroke="var(--diag-grid-bold)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Repeating clinical ECG waves */}
      <svg
        viewBox="0 0 1600 300"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="backEcgGrad" x1="0%" x2="100%">
            <stop offset="0%" stopColor="var(--diag-cyan)" stopOpacity="0.05" />
            <stop offset="30%" stopColor="var(--diag-cyan)" stopOpacity="0.25" />
            <stop offset="50%" stopColor="var(--diag-cyan)" stopOpacity="0.5" />
            <stop offset="70%" stopColor="var(--diag-cyan)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--diag-cyan)" stopOpacity="0.05" />
          </linearGradient>
          <filter id="backEcgGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dynamic sweeping pulse path */}
        <path
          d="M0,150 L180,150 L200,150 L210,135 L220,150 L230,150 L234,145 L238,50 L242,250 L246,150 L250,158 L254,150 L380,150 L400,150 L410,135 L420,150 L430,150 L434,145 L438,50 L442,250 L446,150 L450,158 L454,150 L580,150 L600,150 L610,135 L620,150 L630,150 L634,145 L638,50 L642,250 L646,150 L650,158 L654,150 L780,150 L800,150 L810,135 L820,150 L830,150 L834,145 L838,50 L842,250 L846,150 L850,158 L854,150 L980,150 L1000,150 L1010,135 L1020,150 L1030,150 L1034,145 L1038,50 L1042,250 L1046,150 L1050,158 L1054,150 L1180,150 L1200,150 L1210,135 L1220,150 L1230,150 L1234,145 L1238,50 L1242,250 L1246,150 L1250,158 L1254,150 L1380,150 L1400,150 L1410,135 L1420,150 L1430,150 L1434,145 L1438,50 L1442,250 L1446,150 L1450,158 L1454,150 L1600,150"
          stroke="url(#backEcgGrad)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#backEcgGlow)"
          className="ecg-path"
        />

        {/* Dynamic sweeping spotlight gradient that moves left to right */}
        <mask id="sweepMask">
          <rect width="1600" height="300" fill="#000" />
          <circle r="120" fill="#FFF">
            <animateMotion
              dur="6s"
              repeatCount="indefinite"
              path="M-100,150 L1700,150"
            />
          </circle>
        </mask>
        <path
          d="M0,150 L180,150 L200,150 L210,135 L220,150 L230,150 L234,145 L238,50 L242,250 L246,150 L250,158 L254,150 L380,150 L400,150 L410,135 L420,150 L430,150 L434,145 L438,50 L442,250 L446,150 L450,158 L454,150 L580,150 L600,150 L610,135 L620,150 L630,150 L634,145 L638,50 L642,250 L646,150 L650,158 L654,150 L780,150 L800,150 L810,135 L820,150 L830,150 L834,145 L838,50 L842,250 L846,150 L850,158 L854,150 L980,150 L1000,150 L1010,135 L1020,150 L1030,150 L1034,145 L1038,50 L1042,250 L1046,150 L1050,158 L1054,150 L1180,150 L1200,150 L1210,135 L1220,150 L1230,150 L1234,145 L1238,50 L1242,250 L1246,150 L1250,158 L1254,150 L1380,150 L1400,150 L1410,135 L1420,150 L1430,150 L1434,145 L1438,50 L1442,250 L1446,150 L1450,158 L1454,150 L1600,150"
          stroke="var(--diag-cyan)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#backEcgGlow)"
          mask="url(#sweepMask)"
        />
      </svg>
    </div>
  );
}
