import React, { useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, Clock, ShieldAlert } from 'lucide-react';
import { BIOMARKER_RANGES } from '../services/medicalEngine';

/* ══════════════════════════════════════════════════════════
   TREND ANALYSIS — Clinical Light Theme
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

// Custom tooltip for Recharts
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #BFDBFE',
      borderRadius: '10px',
      padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(37,99,235,0.12)',
      fontSize: '12px',
    }}>
      <p style={{ fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
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
      <div className="glass-card rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[280px]">
        <Activity className="h-10 w-10 text-blue-300 mb-3" />
        <h4 className="text-base font-bold text-slate-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
          No Historical Records
        </h4>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">
          Upload secondary reports to track biomarker trends and project future risk trajectories.
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
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Clock className="h-4 w-4 text-blue-500" />
            Biomarker Progression & Projections
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            AI tracks chronological variance and maps projected risk pathways
          </p>
        </div>

        {/* Marker Selector */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {MARKERS.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMarker(m.id)}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all ${
                selectedMarker === m.id
                  ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div
        className="h-72 w-full rounded-xl p-4 relative"
        style={{ background: '#F8FBFF', border: '1px solid #BFDBFE' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={fullData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(191,219,254,0.5)" />
            <XAxis
              dataKey="date"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontWeight: 600 }}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              domain={['auto', 'auto']}
              tick={{ fill: '#94A3B8', fontWeight: 600 }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}
            />

            {/* Reference threshold line */}
            {thresholdVal && (
              <ReferenceLine
                y={thresholdVal}
                stroke="rgba(239,68,68,0.5)"
                strokeDasharray="4 4"
                label={{
                  value: 'Warning Boundary',
                  fill: 'rgba(239,68,68,0.6)',
                  fontSize: 9,
                  position: 'insideBottomRight'
                }}
              />
            )}

            {/* Historical line */}
            <Line
              name="Historical"
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={{ r: 5, fill: '#FFFFFF', stroke: '#2563EB', strokeWidth: 2.5 }}
              activeDot={{ r: 7, fill: '#2563EB', strokeWidth: 0 }}
              connectNulls
            />

            {/* Projection line */}
            <Line
              name="Projection"
              type="monotone"
              dataKey="projection"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#FFFFFF', stroke: '#F59E0B', strokeWidth: 2 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Narrative */}
      {projection && (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: isOptimal ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${isOptimal ? '#86EFAC' : '#FCA5A5'}`,
          }}
        >
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: isOptimal ? '#DCFCE7' : '#FEE2E2' }}
          >
            {trendIsUp
              ? <TrendingUp className="h-4.5 w-4.5" style={{ color: selectedMarker === 'hemoglobin' ? '#22C55E' : '#EF4444' }} />
              : <TrendingDown className="h-4.5 w-4.5" style={{ color: selectedMarker === 'hemoglobin' ? '#EF4444' : '#22C55E' }} />
            }
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1"
              style={{ color: isOptimal ? '#16A34A' : '#DC2626' }}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Trend Intelligence & Projected Risk Path
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your <strong className="text-slate-800 capitalize">{selectedMarker}</strong> levels have changed by{' '}
              <strong style={{ color: isOptimal ? '#16A34A' : '#DC2626' }}>
                {projection.percentageChange > 0 ? '+' : ''}{projection.percentageChange.toFixed(1)}%
              </strong>{' '}
              from baseline.{' '}
              {projection.percentageChange > 0 && selectedMarker === 'creatinine' && (
                <span>At the current trajectory, values may cross the kidney failure boundary by Q4 2026. Preventive lifestyle adjustments are highly advised.</span>
              )}
              {projection.percentageChange < 0 && selectedMarker === 'hemoglobin' && (
                <span>Declining hemoglobin indicates worsening anemia. Dietary intervention and nephrology assessment are recommended.</span>
              )}
              {isOptimal && (
                <span>Change is within favorable recovery bounds. Maintain present clinical regimen.</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
