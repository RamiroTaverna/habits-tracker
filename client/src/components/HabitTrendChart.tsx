import { useState } from 'react';
import type { Habit, HabitLog } from '../store/useStore';
import { getPastDaysArray } from '../utils/dateUtils';
import { TrendingUp, BarChart2 } from 'lucide-react';

interface HabitTrendChartProps {
  habit: Habit;
  logs: HabitLog[];
  daysCount?: number;
}

export const HabitTrendChart: React.FC<HabitTrendChartProps> = ({ habit, logs, daysCount = 30 }) => {
  const [chartMode, setChartMode] = useState<'cumulative' | 'daily'>('cumulative');
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    formattedDate: string;
    value: number;
    cumulative: number;
    tier: 'ideal' | 'base' | 'partial' | 'none';
    x: number;
    y: number;
  } | null>(null);

  // Generate date array from (today - daysCount + 1) to today in local calendar time
  const dates: string[] = getPastDaysArray(daysCount);

  // Build log map for O(1) lookup
  const logMap = new Map<string, number>();
  logs.forEach(l => {
    if (l.habit_id === habit.id) {
      logMap.set(l.date, l.value || 0);
    }
  });

  // Calculate baseline before this time window (if any prior logs exist)
  const firstDateInWindow = dates[0];
  let initialBaseline = 0;
  logs.forEach(l => {
    if (l.habit_id === habit.id && l.date < firstDateInWindow) {
      initialBaseline += (l.value || 0);
    }
  });

  // Calculate Cumulative Series & Daily Points
  let runningCumulative = initialBaseline;
  let periodTotal = 0;

  const dataPoints = dates.map((date, index) => {
    const value = logMap.get(date) || 0;
    periodTotal += value;
    runningCumulative += value;

    let tier: 'ideal' | 'base' | 'partial' | 'none' = 'none';
    if (value >= habit.target_ideal && habit.target_ideal > 0) {
      tier = 'ideal';
    } else if (value >= habit.target_min && habit.target_min > 0) {
      tier = 'base';
    } else if (value > 0) {
      tier = 'partial';
    }

    const [, month, day] = date.split('-');

    return {
      date,
      formattedDate: `${day}/${month}`,
      value,
      cumulative: runningCumulative,
      tier,
      index
    };
  });

  // SVG dimensions
  const width = 640;
  const height = 230;
  const padding = { top: 25, right: 30, bottom: 35, left: 55 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Maximum value for scaling Y axis
  const maxCumulative = Math.max(runningCumulative, habit.target_ideal * 2, 1);
  const maxDaily = Math.max(...dataPoints.map(p => p.value), habit.target_ideal, 1);
  const maxY = chartMode === 'cumulative' ? maxCumulative : maxDaily;

  // Coordinate mappers
  const getX = (index: number) => padding.left + (index / Math.max(dates.length - 1, 1)) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - (val / maxY) * graphHeight;

  // Construct SVG Path
  const points = dataPoints.map(p => {
    const currentVal = chartMode === 'cumulative' ? p.cumulative : p.value;
    return {
      x: getX(p.index),
      y: getY(currentVal),
      ...p
    };
  });

  // Dynamic Y-axis steps (4 or 5 clean round intervals)
  const calculateYSteps = (max: number) => {
    const stepCount = 4;
    const rawStep = max / stepCount;
    // Round to a nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
    const niceStep = Math.ceil(rawStep / magnitude) * magnitude;
    const steps = [];
    for (let i = 0; i <= stepCount; i++) {
      steps.push(Math.round(i * niceStep));
    }
    return steps;
  };

  const ySteps = calculateYSteps(maxY);
  const chartMaxY = ySteps[ySteps.length - 1] || maxY;

  // Re-adjust getY to the nice step top
  const getAdjustedY = (val: number) => padding.top + graphHeight - (val / chartMaxY) * graphHeight;

  const adjustedPoints = points.map(p => ({
    ...p,
    y: getAdjustedY(chartMode === 'cumulative' ? p.cumulative : p.value)
  }));

  const adjustedPathD = adjustedPoints.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    return `${acc} L ${p.x} ${p.y}`;
  }, '');

  const adjustedAreaD = `${adjustedPathD} L ${getX(adjustedPoints.length - 1)} ${padding.top + graphHeight} L ${getX(0)} ${padding.top + graphHeight} Z`;

  const dailyAvg = (periodTotal / dates.length).toFixed(1);

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      
      {/* Header Info & Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total acumulado: </span>
            <strong style={{ fontSize: '1.05rem', color: habit.color || '#6366f1' }}>
              {runningCumulative.toLocaleString()} {habit.unit}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>En este período: </span>
            <strong style={{ fontSize: '0.95rem', color: '#10b981' }}>
              +{periodTotal.toLocaleString()} {habit.unit}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Promedio: </span>
            <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>
              {dailyAvg} {habit.unit}/día
            </strong>
          </div>
        </div>

        {/* Chart View Mode Toggle */}
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '8px' }}>
          <button
            onClick={() => setChartMode('cumulative')}
            style={{
              border: 'none',
              background: chartMode === 'cumulative' ? 'var(--accent-color)' : 'transparent',
              color: chartMode === 'cumulative' ? '#fff' : 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '0.2rem 0.6rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <TrendingUp size={13} /> Crecimiento Acumulado
          </button>
          <button
            onClick={() => setChartMode('daily')}
            style={{
              border: 'none',
              background: chartMode === 'daily' ? 'var(--accent-color)' : 'transparent',
              color: chartMode === 'daily' ? '#fff' : 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '0.2rem 0.6rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <BarChart2 size={13} /> Diario
          </button>
        </div>
      </div>

      {/* SVG Graph */}
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        style={{ width: '100%', height: 'auto', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid var(--border-color)' }}
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <defs>
          <linearGradient id={`grad-${habit.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={habit.color || '#6366f1'} stopOpacity="0.35" />
            <stop offset="100%" stopColor={habit.color || '#6366f1'} stopOpacity="0.0" />
          </linearGradient>
          <filter id="chart-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Y Grid lines and values */}
        {ySteps.map(stepVal => {
          const y = getAdjustedY(stepVal);
          return (
            <g key={stepVal}>
              <line 
                x1={padding.left} 
                y1={y} 
                x2={width - padding.right} 
                y2={y} 
                stroke="rgba(255,255,255,0.06)" 
                strokeDasharray={stepVal === 0 ? 'none' : '3 3'} 
              />
              <text 
                x={padding.left - 8} 
                y={y + 3} 
                fill="rgba(255,255,255,0.35)" 
                fontSize="10" 
                textAnchor="end"
              >
                {stepVal >= 1000 ? `${(stepVal / 1000).toFixed(stepVal % 1000 === 0 ? 0 : 1)}k` : stepVal}
              </text>
            </g>
          );
        })}

        {/* Daily Volume Bars in Background (only in cumulative mode) */}
        {chartMode === 'cumulative' && adjustedPoints.map(p => {
          const barHeight = p.value > 0 ? (p.value / maxDaily) * (graphHeight * 0.35) : 0;
          const barY = padding.top + graphHeight - barHeight;
          const barColor = p.tier === 'ideal' 
            ? 'rgba(16, 185, 129, 0.25)' 
            : p.tier === 'base' 
            ? 'rgba(245, 158, 11, 0.25)' 
            : p.tier === 'partial'
            ? 'rgba(129, 140, 248, 0.25)'
            : 'transparent';
          return (
            <rect
              key={`bar-${p.date}`}
              x={p.x - 2.5}
              y={barY}
              width={5}
              height={barHeight}
              rx={2}
              fill={barColor}
            />
          );
        })}

        {/* Area fill */}
        <path d={adjustedAreaD} fill={`url(#grad-${habit.id})`} />

        {/* Cumulative / Daily Growth Line */}
        <path 
          d={adjustedPathD} 
          fill="none" 
          stroke={habit.color || '#6366f1'} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter="url(#chart-glow)"
        />

        {/* Interactive Point Circles */}
        {adjustedPoints.map((p) => {
          const color = p.tier === 'ideal' 
            ? '#10b981' 
            : p.tier === 'base' 
            ? '#f59e0b' 
            : p.tier === 'partial'
            ? '#818cf8'
            : 'rgba(255,255,255,0.2)';
          const isHovered = hoveredPoint?.date === p.date;
          const isLargeHistory = dates.length > 45;
          const radius = isHovered 
            ? 6 
            : p.value > 0 
            ? (isLargeHistory ? 3 : 4) 
            : (isLargeHistory ? 1 : 2.5);

          return (
            <g key={`pt-${p.date}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={radius}
                fill={p.value > 0 ? color : '#1e293b'}
                stroke={color}
                strokeWidth={isHovered ? 2.5 : (isLargeHistory ? 1 : 1.5)}
                style={{ transition: 'all 0.15s ease', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(p)}
              />
              {/* Invisible larger hit target for easy mouse hover */}
              <circle
                cx={p.x}
                cy={p.y}
                r={Math.max(6, Math.min(12, graphWidth / dates.length))}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(p)}
              />
            </g>
          );
        })}

        {/* X Axis Labels (Dynamically spaced 5-7 labels max) */}
        {adjustedPoints.filter((_, i) => i % Math.max(1, Math.round(dates.length / 6)) === 0 || i === adjustedPoints.length - 1).map(p => (
          <text
            key={`lbl-${p.date}`}
            x={p.x}
            y={height - 10}
            fill="rgba(255,255,255,0.4)"
            fontSize="10"
            textAnchor="middle"
          >
            {p.formattedDate}
          </text>
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div style={{
          position: 'absolute',
          left: `${(hoveredPoint.x / width) * 100}%`,
          top: `${(hoveredPoint.y / height) * 100}%`,
          transform: 'translate(-50%, -120%)',
          backgroundColor: '#1e293b',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          borderRadius: '8px',
          padding: '0.6rem 0.85rem',
          pointerEvents: 'none',
          zIndex: 10,
          whiteSpace: 'nowrap',
          fontSize: '0.8rem',
          color: '#f8fafc'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
            <span>{hoveredPoint.date}</span>
            <span style={{ 
              color: hoveredPoint.tier === 'ideal' 
                ? '#10b981' 
                : hoveredPoint.tier === 'base' 
                ? '#f59e0b' 
                : hoveredPoint.tier === 'partial'
                ? '#818cf8'
                : '#94a3b8' 
            }}>
              {hoveredPoint.tier === 'ideal' 
                ? '✨ Nivel Ideal' 
                : hoveredPoint.tier === 'base' 
                ? '🛡️ Nivel Base (20%)' 
                : hoveredPoint.tier === 'partial'
                ? '⚡ Registro Activo'
                : '⏸️ Sin registro'}
            </span>
          </div>
          <div>
            Día: <strong style={{ color: hoveredPoint.value > 0 ? '#10b981' : '#94a3b8' }}>+{hoveredPoint.value} {habit.unit}</strong>
          </div>
          <div style={{ color: habit.color || 'var(--accent-color)', fontWeight: 'bold', marginTop: '0.2rem' }}>
            Acumulado total: {hoveredPoint.cumulative.toLocaleString()} {habit.unit}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} /> Ideal (≥{habit.target_ideal} {habit.unit})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} /> Base (≥{habit.target_min} {habit.unit})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#818cf8', display: 'inline-block' }} /> Registrado (&gt;0 {habit.unit})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'inline-block' }} /> Sin registro (+0)
          </span>
        </div>
        <div>
          📈 Crecimiento continuo infinito • La línea se aplana en días inactivos
        </div>
      </div>
    </div>
  );
};
