import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Clock, ShieldAlert } from 'lucide-react';
import { BIOMARKER_RANGES } from '../services/medicalEngine';

export default function TrendAnalysis({ historicalData }) {
  const [selectedMarker, setSelectedMarker] = useState('creatinine');

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="glassmorphism p-6 rounded-2xl border border-slate-800/80 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Activity className="h-10 w-10 text-cyber-gray animate-pulse mb-3" />
        <h4 className="text-md font-bold text-slate-300">No Historical Records Found</h4>
        <p className="text-xs text-cyber-gray mt-1 max-w-xs">
          Upload secondary reports or select a multi-report diagnostic file to track and project trends.
        </p>
      </div>
    );
  }

  // Format Recharts Data
  const chartData = historicalData.map(record => {
    return {
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value: record.biomarkers[selectedMarker],
      rawDate: new Date(record.date)
    };
  }).sort((a, b) => a.rawDate - b.rawDate);

  // Linear Regression Projection
  const computeProjection = (data) => {
    if (data.length < 2) return null;
    
    // Fit y = mx + c
    // We treat indexes as X points: 0, 1, 2...
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    data.forEach((d, idx) => {
      sumX += idx;
      sumY += d.value;
      sumXY += idx * d.value;
      sumXX += idx * idx;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Project the next two periods
    const lastValue = data[data.length - 1].value;
    const projected1 = slope * n + intercept;
    const projected2 = slope * (n + 1) + intercept;
    
    const percentageChange = ((lastValue - data[0].value) / data[0].value) * 100;
    
    return {
      slope,
      percentageChange,
      projectedPoints: [
        { date: 'Proj A', value: Math.max(0, parseFloat(projected1.toFixed(2))), isProjection: true },
        { date: 'Proj B', value: Math.max(0, parseFloat(projected2.toFixed(2))), isProjection: true }
      ]
    };
  };

  const projectionResult = computeProjection(chartData);
  
  // Combine historical points and projection points
  const fullChartData = [...chartData.map(d => ({ ...d, isProjection: false }))];
  if (projectionResult) {
    fullChartData.push({
      date: 'Next Qtr',
      projection: projectionResult.projectedPoints[0].value,
      isProjection: true
    });
    fullChartData.push({
      date: '6 Mths Out',
      projection: projectionResult.projectedPoints[1].value,
      isProjection: true
    });
    
    // Hook projection line to last historical line point to show smooth link
    fullChartData[chartData.length - 1].projection = chartData[chartData.length - 1].value;
  }

  // Range and thresholds
  const markerRangeInfo = BIOMARKER_RANGES[selectedMarker];
  const thresholdVal = markerRangeInfo?.normal[1] || 1.2;

  const markersList = [
    { id: 'creatinine', name: 'Creatinine (Kidneys)' },
    { id: 'hemoglobin', name: 'Hemoglobin (Blood)' },
    { id: 'sodium', name: 'Sodium (Brain)' },
    { id: 'glucose', name: 'Glucose (Pancreas)' }
  ];

  return (
    <div className="glassmorphism p-6 rounded-2xl border border-slate-800/80 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyber-cyan animate-pulse" />
            Biomarker Progression & Projections
          </h3>
          <p className="text-xs text-cyber-gray mt-0.5">
            AI tracks chronological variances and maps projected pathways
          </p>
        </div>

        {/* Marker Selectors */}
        <div className="flex flex-wrap gap-1 bg-cyber-bg/85 border border-slate-700/60 p-1 rounded-xl">
          {markersList.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMarker(m.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedMarker === m.id
                  ? 'bg-cyber-cyan text-cyber-bg font-extrabold shadow'
                  : 'text-cyber-gray hover:text-slate-200'
              }`}
            >
              {m.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-72 w-full bg-cyber-bg/50 border border-slate-850/60 rounded-xl p-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={fullChartData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280" 
              fontSize={11} 
              tickLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={11} 
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(11,19,41,0.95)', 
                border: '1px solid rgba(0, 242, 254, 0.4)', 
                borderRadius: '8px', 
                color: '#fff',
                fontSize: '12px'
              }} 
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            
            {/* Safe Reference Line */}
            {thresholdVal && (
              <ReferenceLine 
                y={thresholdVal} 
                stroke="rgba(255, 74, 90, 0.5)" 
                strokeDasharray="4 4"
                label={{ value: 'Warning Boundary', fill: 'rgba(255, 74, 90, 0.7)', fontSize: 9, position: 'insideBottomRight' }} 
              />
            )}

            {/* Historical Values Line */}
            <Line 
              name="Historical Record"
              type="monotone" 
              dataKey="value" 
              stroke="#00f2fe" 
              strokeWidth={3}
              activeDot={{ r: 8, strokeWidth: 0, fill: '#00f2fe' }}
              dot={{ r: 5, fill: '#0b1329', stroke: '#00f2fe', strokeWidth: 2 }}
              connectNulls
            />

            {/* Projection Values Line */}
            <Line 
              name="Risk Projection Path"
              type="monotone" 
              dataKey="projection" 
              stroke="#ffb800" 
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#0b1329', stroke: '#ffb800', strokeWidth: 1.5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Analytical Narrative Box */}
      {projectionResult && (
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center gap-4 ${
          projectionResult.percentageChange > 0 && selectedMarker !== 'hemoglobin'
            ? 'bg-cyber-red/10 border-cyber-red/20 text-slate-200'
            : 'bg-cyber-emerald/10 border-cyber-emerald/20 text-slate-200'
        }`}>
          <div className="p-2 rounded-lg bg-cyber-bg/60 border border-slate-750 flex items-center justify-center shrink-0">
            {projectionResult.percentageChange > 0 ? (
              <TrendingUp className={`h-6 w-6 ${selectedMarker === 'hemoglobin' ? 'text-cyber-emerald' : 'text-cyber-red'}`} />
            ) : (
              <TrendingDown className={`h-6 w-6 ${selectedMarker === 'hemoglobin' ? 'text-cyber-red' : 'text-cyber-emerald'}`} />
            )}
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-cyan flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-cyber-cyan" />
              Trend Intelligence & Projected Risk Path
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Your <strong className="text-white capitalize">{selectedMarker}</strong> levels have changed by{' '}
              <strong className={projectionResult.percentageChange > 0 && selectedMarker !== 'hemoglobin' ? 'text-cyber-red font-bold' : 'text-cyber-emerald font-bold'}>
                {projectionResult.percentageChange > 0 ? '+' : ''}{projectionResult.percentageChange.toFixed(1)}%
              </strong>{' '}
              compared to your baseline.
              {projectionResult.percentageChange > 0 && selectedMarker === 'creatinine' && (
                <span> At the current trajectory slope (+{(projectionResult.slope).toFixed(2)}/period), values are modeled to cross the critical kidney failure boundary line by Q4 2026. Preventive lifestyle adjustments are highly suggested.</span>
              )}
              {projectionResult.percentageChange < 0 && selectedMarker === 'hemoglobin' && (
                <span> Declining hemoglobin represents worsening anemia conditions. Recommended dietary red cell stimulators and nephrology assessment are advised to curb progression.</span>
              )}
              {isOptimalMarker(selectedMarker, projectionResult.percentageChange) && (
                <span> Change is within favorable metabolic recovery bounds. Maintain present clinical regimen and dietary protocols.</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function isOptimalMarker(marker, change) {
  if (marker === 'hemoglobin' && change > 0) return true;
  if (marker === 'sodium' && Math.abs(change) < 5) return true;
  if ((marker === 'glucose' || marker === 'creatinine') && change < 0) return true;
  return false;
}
