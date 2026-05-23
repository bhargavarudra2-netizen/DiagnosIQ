import React, { useEffect, useRef, useState } from 'react';

/* ══════════════════════════════════════════════════════════
   HOSPITAL DYNAMIC EFFECTS COMPONENT LIBRARY
   Interactive Red Cross · Blood Effects · ECG · Vitals
   ══════════════════════════════════════════════════════════ */

/* ── 1. Animated Red Cross SVG ───────────────────────────── */
export function AnimatedRedCross({ size = 48, pulse = true, spin = false, glow = true, className = '' }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${pulse ? 'red-cross-pulse' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer orbit ring */}
      {spin && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          style={{ animation: 'crossSpin 8s linear infinite' }}
        >
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="rgba(220,20,60,0.2)"
            strokeWidth="1"
            strokeDasharray="6,4"
          />
          <circle cx="50" cy="6" r="4" fill="#DC143C" opacity="0.8" />
        </svg>
      )}
      {/* Ripple rings */}
      {glow && [1, 2, 3].map(i => (
        <div
          key={i}
          className="ripple-ring"
          style={{
            width: size * 0.9,
            height: size * 0.9,
            left: '5%', top: '5%',
            '--ripple-dur': `${1.8 + i * 0.5}s`,
            '--ripple-delay': `${(i - 1) * 0.5}s`,
          }}
        />
      ))}
      {/* Cross shape */}
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <radialGradient id={`crossGrad-${size}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FF4444" />
            <stop offset="60%"  stopColor="#DC143C" />
            <stop offset="100%" stopColor="#8B0000" />
          </radialGradient>
          <filter id={`crossGlow-${size}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Cross arms */}
        <rect
          x="35" y="10" width="30" height="80" rx="6"
          fill={`url(#crossGrad-${size})`}
          filter={glow ? `url(#crossGlow-${size})` : ''}
        />
        <rect
          x="10" y="35" width="80" height="30" rx="6"
          fill={`url(#crossGrad-${size})`}
          filter={glow ? `url(#crossGlow-${size})` : ''}
        />
        {/* White shine */}
        <rect x="45" y="12" width="8" height="20" rx="3" fill="rgba(255,255,255,0.3)" />
        <rect x="12" y="45" width="20" height="8" rx="3" fill="rgba(255,255,255,0.3)" />
      </svg>
    </div>
  );
}

/* ── 2. ECG / Cardiogram Strip ───────────────────────────── */
export function ECGStrip({ color = '#DC143C', height = 60, className = '' }) {
  return (
    <div className={`ecg-container ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 800 60"
        preserveAspectRatio="none"
        width="100%"
        height={height}
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="ecgFade" x1="0%" x2="100%">
            <stop offset="0%"   stopColor={color} stopOpacity="0" />
            <stop offset="15%"  stopColor={color} stopOpacity="1" />
            <stop offset="85%"  stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id="ecgGlow">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Grid */}
        <g opacity="0.06">
          {Array.from({ length: 40 }).map((_, i) => (
            <line key={i} x1={i * 20} y1="0" x2={i * 20} y2="60" stroke={color} strokeWidth="0.5" />
          ))}
          {[15, 30, 45].map(y => (
            <line key={y} x1="0" y1={y} x2="800" y2={y} stroke={color} strokeWidth="0.5" />
          ))}
        </g>
        {/* ECG Path — P-QRS-T complex repeated */}
        <path
          className="ecg-path"
          d="M0,30 L60,30 L70,30 L75,22 L80,30 L90,30
             L100,30 L104,28 L106,5 L108,55 L112,30 L116,35 L120,30
             L160,30 L170,30 L175,22 L180,30 L190,30
             L200,30 L204,28 L206,5 L208,55 L212,30 L216,35 L220,30
             L260,30 L270,30 L275,22 L280,30 L290,30
             L300,30 L304,28 L306,5 L308,55 L312,30 L316,35 L320,30
             L360,30 L370,30 L375,22 L380,30 L390,30
             L400,30 L404,28 L406,5 L408,55 L412,30 L416,35 L420,30
             L460,30 L470,30 L475,22 L480,30 L490,30
             L500,30 L504,28 L506,5 L508,55 L512,30 L516,35 L520,30
             L560,30 L570,30 L575,22 L580,30 L590,30
             L600,30 L604,28 L606,5 L608,55 L612,30 L616,35 L620,30
             L660,30 L670,30 L675,22 L680,30 L690,30
             L700,30 L704,28 L706,5 L708,55 L712,30 L716,35 L720,30
             L800,30"
          stroke="url(#ecgFade)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ecgGlow)"
        />
        {/* Moving dot */}
        <circle r="4" fill={color} filter="url(#ecgGlow)" opacity="0.9">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path="M0,30 L60,30 L70,30 L75,22 L80,30 L90,30 L100,30 L104,28 L106,5 L108,55 L112,30 L116,35 L120,30 L160,30 L170,30 L175,22 L180,30 L190,30 L200,30 L204,28 L206,5 L208,55 L212,30 L216,35 L220,30 L260,30 L270,30 L275,22 L280,30 L290,30 L300,30 L304,28 L306,5 L308,55 L312,30 L316,35 L320,30 L360,30 L370,30 L375,22 L380,30 L390,30 L400,30 L404,28 L406,5 L408,55 L412,30 L416,35 L420,30 L460,30 L470,30 L475,22 L480,30 L490,30 L500,30 L504,28 L506,5 L508,55 L512,30 L516,35 L520,30 L560,30 L570,30 L575,22 L580,30 L590,30 L600,30 L604,28 L606,5 L608,55 L612,30 L616,35 L620,30 L660,30 L670,30 L675,22 L680,30 L690,30 L700,30 L704,28 L706,5 L708,55 L712,30 L716,35 L720,30 L800,30"
          />
        </circle>
      </svg>
    </div>
  );
}

/* ── 3. Blood Drop Particle System ───────────────────────── */
const BLOOD_DROPS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${8 + i * 12}%`,
  duration: `${1.8 + Math.random() * 1.4}s`,
  delay: `${i * 0.3}s`,
  size: 8 + Math.floor(Math.random() * 8),
}));

export function BloodDrops({ count = 8, className = '' }) {
  const drops = BLOOD_DROPS.slice(0, count);
  return (
    <div className={`relative pointer-events-none ${className}`} style={{ height: 80 }}>
      {drops.map(d => (
        <div
          key={d.id}
          className="blood-drop absolute"
          style={{
            left: d.left,
            top: 0,
            width: d.size,
            height: d.size * 1.3,
            '--drop-duration': d.duration,
            '--drop-delay': d.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ── 4. Floating Blood Cells Background ──────────────────── */
const CELLS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 6 + Math.floor(Math.random() * 10),
  left: `${Math.random() * 90}%`,
  top: `${Math.random() * 90}%`,
  dur: `${4 + Math.random() * 4}s`,
  delay: `${Math.random() * 3}s`,
}));

export function BloodCells({ className = '' }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {CELLS.map(c => (
        <div
          key={c.id}
          className="blood-cell"
          style={{
            width: c.size,
            height: c.size,
            left: c.left,
            top: c.top,
            '--cell-dur': c.dur,
            '--cell-delay': c.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ── 5. Blood Streak Streaks (side decoration) ───────────── */
const STREAKS = [
  { left: '2%',  height: 120, dur: '3.5s', delay: '0s' },
  { left: '6%',  height:  80, dur: '4.2s', delay: '0.6s' },
  { left: '92%', height: 100, dur: '3.8s', delay: '1.2s' },
  { left: '96%', height:  70, dur: '4.5s', delay: '0.3s' },
];

export function BloodStreaks({ className = '' }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {STREAKS.map((s, i) => (
        <div
          key={i}
          className="blood-streak"
          style={{
            left: s.left,
            height: s.height,
            top: '10%',
            '--streak-dur': s.dur,
            '--streak-delay': s.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ── 6. Data Stream (Matrix-style medical data) ──────────── */
const MEDICAL_DATA_STRINGS = [
  'Hb:8.5 g/dL', 'TROP:2.4', 'Na+:129', 'GLU:310',
  'PLT:42K', 'Cr:3.2', 'LDL:215', 'K+:5.8',
  'WBC:↑', 'RBC:↓', 'INR:2.1', 'HbA1c:9.2%',
];

export function DataStreams({ count = 6, className = '' }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="data-stream"
          style={{
            left: `${5 + i * 15}%`,
            top: `-20px`,
            '--stream-dur': `${5 + Math.random() * 4}s`,
            '--stream-delay': `${i * 0.8}s`,
            opacity: 0.18 + i * 0.02,
          }}
        >
          {MEDICAL_DATA_STRINGS[i % MEDICAL_DATA_STRINGS.length]}
        </div>
      ))}
    </div>
  );
}

/* ── 7. Animated Vitals Monitor Card ─────────────────────── */
export function VitalsMonitor({ bpm = 72, spo2 = 98, bp = '120/80', temp = 98.6, className = '' }) {
  const [currentBpm, setCurrentBpm] = useState(bpm);
  const [beat, setBeat] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate slight BPM variation
      setCurrentBpm(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(60, Math.min(120, prev + delta));
      });
      setBeat(true);
      setTimeout(() => setBeat(false), 300);
    }, 60000 / bpm);
    return () => clearInterval(interval);
  }, [bpm]);

  const vitals = [
    { label: 'HEART RATE',   value: currentBpm, unit: 'BPM',  color: '#DC143C', beat: true },
    { label: 'SpO₂',         value: spo2,        unit: '%',    color: '#2563EB', beat: false },
    { label: 'BLOOD PRESS.', value: bp,          unit: 'mmHg', color: '#7C3AED', beat: false },
    { label: 'TEMP',         value: temp,        unit: '°F',   color: '#F59E0B', beat: false },
  ];

  return (
    <div className={`glass-card-red rounded-2xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="pulse-dot" />
        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
          Live Vitals Monitor
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {vitals.map((v, i) => (
          <div key={i} className="text-center p-2 rounded-xl" style={{ background: `${v.color}08`, border: `1px solid ${v.color}20` }}>
            <div
              className={`text-lg font-black vitals-counter ${v.beat && beat ? 'heartbeat' : ''}`}
              style={{ color: v.color, display: 'inline-block' }}
            >
              {v.value}
            </div>
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{v.unit}</div>
            <div className="text-[8px] font-semibold text-slate-400 mt-0.5">{v.label}</div>
          </div>
        ))}
      </div>
      <ECGStrip color="#DC143C" height={32} className="mt-2" />
    </div>
  );
}

/* ── 8. Hospital Status Badge ────────────────────────────── */
export function HospitalStatusBadge({ status = 'OPERATIONAL', className = '' }) {
  const configs = {
    OPERATIONAL: { color: '#22C55E', bg: '#F0FDF4', label: '● SYSTEM OPERATIONAL' },
    SCANNING:    { color: '#2563EB', bg: '#EFF6FF', label: '◉ SCANNING ACTIVE' },
    ALERT:       { color: '#DC143C', bg: '#FEF2F2', label: '⚠ CRITICAL ALERT' },
    STANDBY:     { color: '#F59E0B', bg: '#FFFBEB', label: '◎ STANDBY MODE' },
  };
  const c = configs[status] || configs.OPERATIONAL;
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${className}`}
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30` }}
    >
      <span style={{ animation: status === 'ALERT' ? 'pulseDot 1s ease-in-out infinite' : 'none' }}>
        {c.label}
      </span>
    </div>
  );
}

/* ── 9. Interactive Red Cross Button ─────────────────────── */
export function RedCrossButton({ onClick, label = 'Emergency Mode', size = 'md', className = '' }) {
  const [hover, setHover] = useState(false);
  const sizes = {
    sm: { wrap: 36, cross: 20, text: '10px' },
    md: { wrap: 52, cross: 28, text: '12px' },
    lg: { wrap: 72, cross: 40, text: '14px' },
  };
  const s = sizes[size];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`group flex flex-col items-center gap-1.5 ${className}`}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <div
        style={{
          width: s.wrap, height: s.wrap,
          borderRadius: '50%',
          background: hover ? 'rgba(220,20,60,0.12)' : 'rgba(220,20,60,0.06)',
          border: '1.5px solid rgba(220,20,60,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: hover ? '0 0 20px rgba(220,20,60,0.25)' : '0 0 8px rgba(220,20,60,0.1)',
          animation: 'crossPulse 2.5s ease-in-out infinite',
        }}
      >
        <AnimatedRedCross size={s.cross} pulse={false} glow={false} spin={false} />
      </div>
      <span style={{ fontSize: s.text, fontWeight: 700, color: '#DC143C', letterSpacing: '0.04em' }}>
        {label}
      </span>
    </button>
  );
}

/* ── 10. Medical Particle Canvas ─────────────────────────── */
export function MedicalParticleField({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: Math.random() > 0.6
        ? `rgba(220,20,60,${0.15 + Math.random() * 0.25})`
        : `rgba(37,99,235,${0.10 + Math.random() * 0.20})`,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(220,20,60,${0.06 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

/* ── 11. Floating Hospital Cross Decorations ─────────────── */
export function FloatingCrosses({ className = '' }) {
  const crosses = [
    { size: 16, top: '8%',  left: '3%',  opacity: 0.12, dur: '6s', delay: '0s' },
    { size: 12, top: '25%', right: '4%', opacity: 0.10, dur: '8s', delay: '1s' },
    { size: 20, top: '60%', left: '2%',  opacity: 0.08, dur: '7s', delay: '2s' },
    { size: 10, top: '80%', right: '3%', opacity: 0.12, dur: '5s', delay: '0.5s' },
    { size: 14, top: '45%', left: '5%',  opacity: 0.09, dur: '9s', delay: '1.5s' },
  ];
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {crosses.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: c.top,
            left: c.left,
            right: c.right,
            opacity: c.opacity,
            animation: `float ${c.dur} ease-in-out ${c.delay} infinite`,
          }}
        >
          <AnimatedRedCross size={c.size} pulse={false} glow={false} spin={false} />
        </div>
      ))}
    </div>
  );
}
