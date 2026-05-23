import React, { useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, Clock, ShieldAlert } from 'lucide-react';
import { BIOMARKER_RANGES } from '../services/medicalEngine';

/* ══════════════════════════════════════════════════════════
   TREND ANALYSIS — Dark Mode Analytics
   ══════════════════════════════════════════════════════════ */

const MARKERS = [
  { id: 'creatinine', name: 'Creatinine',  system: 'Kidneys'  },
  { id: 'hemoglobin', name: 'Hemoglobin',  system: 'Blood'    },
  { id: 'sodium',     name: 'Sodium',      system: 'Brain'    },
  { id: 'glucose',    name: 'Glucose',     system: 'Pancreas' },
];

function isOptimalTrend(marker, change) {
  if (marker === 'hemoglobin' && change > 0) return true;
  if (marker === 'sodium' && Math.abs(change) < 5) return true;
  if ((marker === 'glucose' || marker === 'creatinine') && change < 0) return true;
  return false;
}

function computeProjection(data) {
  if (data.length < 2) return null;
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  data.forEach((d, i) => { sumX += i; sumY += d.value; sumXY += i * d.value; sumXX += i * i; });
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const lastValue = data[data.length - 1].value;
  const pct = ((lastValue - data[0].value) / data[0].value) * 100;
  return {
    slope,
    percentageChange: pct,
    proj1: Math.max(0, parseFloat((slope * n + intercept).toFixed(2))),
    proj2: Math.max(0, parseFloat((slope * (n + 1) + intercept).toFixed(2))),
  };
}

// Custom tooltip for Recharts in dark mode
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'var(--diag-navy)',
      border: '1px solid var(--diag-border)',
      borderRadius: '12px',
      padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      fontSize: '12px',
    }}>
      <p style={{ fontWeight: 700, color: 'var(--diag-text)', marginBottom: 4, fontFamily: 'Geist, sans-serif' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: p.color }} />
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function TrendAnalysis({ historicalData }) {
  const [selectedMarker, setSelectedMarker] = useState('creatinine');

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[280px] border-white/5">
        <Activity className="h-9 w-9 text-slate-500 mb-3 animate-pulse" />
        <h4 className="text-sm font-bold text-slate-400" style={{ fontFamily: 'Geist, sans-serif' }}>
          No Chronological Data Available
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
          Upload secondary reports to track biomarker trends and map projected risk trajectories.
        </p>
      </div>
    );
  }

  const chartData = historicalData
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value: record.biomarkers[selectedMarker],
      rawDate: new Date(record.date),
    }))
    .sort((a, b) => a.rawDate - b.rawDate);

  const projection = computeProjection(chartData);
  const fullData = [...chartData.map(d => ({ ...d, isProjection: false }))];
  if (projection) {
    fullData[chartData.length - 1].projection = chartData[chartData.length - 1].value;
    fullData.push({ date: 'Next Qtr', projection: projection.proj1 });
    fullData.push({ date: '6 Mths', projection: projection.proj2 });
  }

  const markerRange = BIOMARKER_RANGES[selectedMarker];
  const thresholdVal = markerRange?.normal?.[1] || null;

  const isOptimal = projection ? isOptimalTrend(selectedMarker, projection.percentageChange) : true;
  const trendIsUp = projection && projection.percentageChange > 0;

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col gap-5">

      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2" style={{ fontFamily: 'Geist, sans-serif' }}>
            <Clock className="h-4 w-4 text-diag-cyan" />
            Biomarker Progression Projections
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            AI chronological mapping and forecasted hazard vector indicators
          </p>
        </div>

        {/* Marker selects */}
        <div className="flex flex-wrap gap-1 bg-white/[0.02] p-0.5 rounded-xl border border-white/5">
          {MARKERS.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMarker(m.id)}
              className={`px-3 py-1 rounded-[8px] text-[10px] font-bold transition-all uppercase tracking-wider ${
                selectedMarker === m.id
                  ? 'bg-white/10 text-diag-cyan shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div
        className="h-64 w-full rounded-xl p-3 relative bg-slate-950/40 border border-white/5"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={fullData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--diag-border)" />
            <XAxis
              dataKey="date"
              stroke="var(--diag-border)"
              fontSize={10}
              tickLine={false}
              tick={{ fill: '#64748B', fontWeight: 600, fontFamily: 'Geist, sans-serif' }}
            />
            <YAxis
              stroke="var(--diag-border)"
              fontSize={10}
              tickLine={false}
              domain={['auto', 'auto']}
              tick={{ fill: '#64748B', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--diag-border-active)', strokeWidth: 1 }} />
            <Legend
              verticalAlign="top"
              height={32}
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: '10px', color: '#64748B', fontWeight: 600, fontFamily: 'Geist, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            />

            {/* Warning limit border */}
            {thresholdVal && (
              <ReferenceLine
                y={thresholdVal}
                stroke="rgba(239, 68, 68, 0.25)"
                strokeDasharray="4 4"
                label={{
                  value: 'Risk Alert Threshold',
                  fill: 'rgba(239, 68, 68, 0.45)',
                  fontSize: 8,
                  position: 'insideBottomRight',
                  fontFamily: 'Geist, sans-serif',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              />
            )}

            {/* Historical line */}
            <Line
              name="Chronology"
              type="monotone"
              dataKey="value"
              stroke="var(--diag-cyan)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--diag-bg)', stroke: 'var(--diag-cyan)', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: 'var(--diag-cyan)', strokeWidth: 0 }}
              connectNulls
            />

            {/* Forecasted path line */}
            <Line
              name="AI Forecast"
              type="monotone"
              dataKey="projection"
              stroke="var(--diag-amber)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3.5, fill: 'var(--diag-bg)', stroke: 'var(--diag-amber)', strokeWidth: 1.5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Narrative block */}
      {projection && (
        <div
          className="rounded-xl p-4 flex items-start gap-3 border"
          style={{
            background: isOptimal ? 'rgba(16, 185, 129, 0.03)' : 'rgba(239, 68, 68, 0.03)',
            borderColor: isOptimal ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          }}
        >
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border"
            style={{
              background: isOptimal ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
              borderColor: isOptimal ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            }}
          >
            {trendIsUp
              ? <TrendingUp className="h-4 w-4" style={{ color: selectedMarker === 'hemoglobin' ? '#10B981' : '#EF4444' }} />
              : <TrendingDown className="h-4 w-4" style={{ color: selectedMarker === 'hemoglobin' ? '#EF4444' : '#10B981' }} />
            }
          </div>
          <div>
            <span
              className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1"
              style={{ color: isOptimal ? '#10B981' : '#EF4444' }}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Chronological Deviation forecast
            </span>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Diagnostic level for <strong className="text-slate-200 capitalize">{selectedMarker}</strong> shifted by{' '}
              <strong style={{ color: isOptimal ? '#10B981' : '#EF4444' }}>
                {projection.percentageChange > 0 ? '+' : ''}{projection.percentageChange.toFixed(1)}%
              </strong>{' '}
              since baseline index.{' '}
              {projection.percentageChange > 0 && selectedMarker === 'creatinine' && (
                <span>Linear regression models project values crossing the renal insufficiency threshold by next quarter. Limit heavy NSAIDs and check BP routinely.</span>
              )}
              {projection.percentageChange < 0 && selectedMarker === 'hemoglobin' && (
                <span>Downward trend forecasts potential development of severe anemia. Diet modifications under clinical supervision are recommended.</span>
              )}
              {isOptimal && (
                <span>Metric drift parameters are normal and showcase positive recovery. Continue maintaining present diet and hydration cycle.</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
