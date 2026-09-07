import type { OccupancyPoint } from '@/lib/types';
import { cn } from '@/lib/utils';

const W = 640;
const H = 210;
const PAD_L = 40;
const PAD_R = 16;
const PAD_T = 14;
const PAD_B = 28;

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, 1).toLocaleDateString('en-US', { month: 'short' });
}

/**
 * Dependency-free SVG line/area chart for the portfolio occupancy trend.
 * Pure server-renderable markup with an accessible label and caption.
 */
export function OccupancyChart({
  points,
  className,
}: {
  points: OccupancyPoint[];
  className?: string;
}) {
  if (points.length < 2) return null;

  const values = points.map((p) => p.occupancy);
  const yMin = Math.floor(Math.min(...values) - 1);
  const yMax = Math.ceil(Math.max(...values) + 1);
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const x = (i: number) => PAD_L + (i * innerW) / (points.length - 1);
  const y = (v: number) => PAD_T + ((yMax - v) / (yMax - yMin)) * innerH;

  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.occupancy).toFixed(1)}`)
    .join(' ');
  const baseline = (H - PAD_B).toFixed(1);
  const area = `${line} L${x(points.length - 1).toFixed(1)},${baseline} L${PAD_L},${baseline} Z`;

  const latest = points[points.length - 1];
  const first = points[0];
  const gridValues = [yMin, (yMin + yMax) / 2, yMax];

  return (
    <figure className={cn('m-0', className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Portfolio occupancy trend from ${monthLabel(first.month)} at ${first.occupancy}% to ${monthLabel(latest.month)} at ${latest.occupancy}%.`}
        className="w-full"
      >
        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y(v)}
              y2={y(v)}
              stroke="#CBD5E1"
              strokeDasharray={v === yMin ? undefined : '3 3'}
            />
            <text
              x={PAD_L - 6}
              y={y(v) + 3}
              textAnchor="end"
              fontSize="10"
              fill="#64748B"
              fontFamily="var(--font-plex-mono), monospace"
            >
              {v}%
            </text>
          </g>
        ))}
        <path d={area} fill="#0D7377" opacity="0.08" />
        <path d={line} fill="none" stroke="#0D7377" strokeWidth="2" />
        {points.map((p, i) =>
          i % 2 === 0 ? (
            <text
              key={p.month}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#64748B"
              fontFamily="var(--font-plex-mono), monospace"
            >
              {monthLabel(p.month)}
            </text>
          ) : null,
        )}
        <circle cx={x(points.length - 1)} cy={y(latest.occupancy)} r="3.5" fill="#0D7377" />
        <text
          x={x(points.length - 1) - 6}
          y={y(latest.occupancy) - 8}
          textAnchor="end"
          fontSize="11"
          fontWeight="600"
          fill="#1A2B4A"
          fontFamily="var(--font-plex-mono), monospace"
        >
          {latest.occupancy.toFixed(1)}%
        </text>
      </svg>
      <figcaption className="sr-only">
        Occupancy moved {latest.occupancy >= first.occupancy ? 'up' : 'down'}{' '}
        {Math.abs(latest.occupancy - first.occupancy).toFixed(1)} percentage points over the last{' '}
        {points.length} months.
      </figcaption>
    </figure>
  );
}
