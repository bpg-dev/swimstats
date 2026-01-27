import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
  Label,
} from 'recharts';
import { ProgressDataPoint } from '@/types/progress';
import { formatDate } from '@/utils/timeFormat';
import { MeetLink } from '@/components/ui';

// Extended data point with timestamp for proper time-based charting
interface ChartDataPoint extends ProgressDataPoint {
  timestamp: number;
}

interface ProgressChartProps {
  data: ProgressDataPoint[];
  standardTime?: number; // Standard time in ms for reference line
  standardName?: string;
}

// Custom dot component to highlight PBs
interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartDataPoint;
  r?: number;
  fill?: string;
  stroke?: string;
}

const CustomDot = (props: CustomDotProps) => {
  const { cx, cy, payload } = props;

  if (cx === undefined || cy === undefined) {
    return null;
  }

  if (payload?.is_pb) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill="#10b981" stroke="#fff" strokeWidth={2} />
        <text x={cx} y={cy - 12} textAnchor="middle" fontSize={12} fill="#10b981" fontWeight="bold">
          PB
        </text>
      </g>
    );
  }

  return <Dot {...props} r={4} fill="#3b82f6" />;
};

// Custom tooltip to show meet details
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-lg">
        <p className="font-semibold text-slate-900">{data.time_formatted}</p>
        <p className="text-sm">
          <MeetLink meetId={data.meet_id} meetName={data.meet_name} />
        </p>
        <p className="text-sm text-slate-500">{formatDate(data.date)}</p>
        {data.is_pb && <p className="text-xs text-green-600 font-semibold mt-1">Personal Best</p>}
      </div>
    );
  }
  return null;
};

// Format time for Y-axis (minutes:seconds or seconds)
const formatYAxis = (timeMs: number) => {
  const totalSeconds = timeMs / 1000;
  const hundredths = Math.floor((timeMs % 1000) / 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (minutes === 0) {
    return `${seconds}.${hundredths.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
};

// Format timestamp for X-axis (receives Unix timestamp in ms)
const formatXAxis = (timestamp: number) => {
  const date = new Date(timestamp);
  return formatDate(date.toISOString().split('T')[0]);
};

// Calculate nice round tick values for Y-axis (times in ms)
const calculateYTicks = (minMs: number, maxMs: number): number[] => {
  const range = maxMs - minMs;

  // Choose interval based on range (in ms)
  // Prefer intervals like 0.5s, 1s, 2s, 5s, 10s, 30s, 1min
  const intervals = [500, 1000, 2000, 5000, 10000, 30000, 60000];
  let interval = intervals[0];

  for (const i of intervals) {
    if (range / i >= 3 && range / i <= 8) {
      interval = i;
      break;
    }
    if (range / i < 3) {
      break;
    }
    interval = i;
  }

  // Round min down and max up to interval boundaries
  const startTick = Math.floor(minMs / interval) * interval;
  const endTick = Math.ceil(maxMs / interval) * interval;

  const ticks: number[] = [];
  for (let tick = startTick; tick <= endTick; tick += interval) {
    ticks.push(tick);
  }

  return ticks;
};

// Format time helper (reuse the formatYAxis logic)
const formatTime = (timeMs: number) => {
  const totalSeconds = timeMs / 1000;
  const hundredths = Math.floor((timeMs % 1000) / 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (minutes === 0) {
    return `${seconds}.${hundredths.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
};

// Custom label component for reference line
interface ReferenceLabelProps {
  viewBox?: { x: number; y: number };
  standardTime: number;
  standardName: string;
}

const ReferenceLabel = (props: ReferenceLabelProps) => {
  const { viewBox, standardTime, standardName } = props;
  const { x, y } = viewBox || { x: 0, y: 0 };

  return (
    <g>
      <text x={x + 10} y={y - 8} fill="#ef4444" fontSize={12} fontWeight="600">
        {standardName}
      </text>
      <text x={x + 10} y={y + 20} fill="#ef4444" fontSize={16} fontWeight="bold">
        {formatTime(standardTime)}
      </text>
    </g>
  );
};

export function ProgressChart({ data, standardTime, standardName }: ProgressChartProps) {
  // Transform data to include numeric timestamps for proper time-based scaling
  const chartData: ChartDataPoint[] = useMemo(() => {
    return data.map((point) => ({
      ...point,
      timestamp: new Date(point.date).getTime(),
    }));
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No times recorded yet for this event.</p>
        <p className="text-sm mt-2">Add some times to see your progress!</p>
      </div>
    );
  }

  // Find min and max times for Y-axis domain (add 5% padding)
  const times = chartData.map((d) => d.time_ms);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const padding = (maxTime - minTime) * 0.05;
  const yDomain = [Math.max(0, minTime - padding), maxTime + padding];

  // Include standard time in domain if provided
  if (standardTime) {
    yDomain[0] = Math.min(yDomain[0], standardTime - padding);
    yDomain[1] = Math.max(yDomain[1], standardTime + padding);
  }

  // Find min and max timestamps for X-axis domain (add padding for visual margin)
  const timestamps = chartData.map((d) => d.timestamp);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const timePadding = (maxTimestamp - minTimestamp) * 0.05 || 86400000; // 1 day fallback for single point
  const xDomain = [minTimestamp - timePadding, maxTimestamp + timePadding];

  // Calculate nice round tick values for Y-axis
  const yTicks = calculateYTicks(yDomain[0], yDomain[1]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="timestamp"
          type="number"
          scale="time"
          domain={xDomain}
          tickFormatter={formatXAxis}
          stroke="#64748b"
          style={{ fontSize: '12px' }}
          label={{
            value: 'Date',
            position: 'insideBottom',
            offset: -10,
            style: { fontSize: '14px', fill: '#64748b' },
          }}
        />
        <YAxis
          reversed
          domain={yDomain}
          ticks={yTicks}
          tickFormatter={formatYAxis}
          stroke="#64748b"
          style={{ fontSize: '12px' }}
          label={{
            value: 'Time',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: '14px', fill: '#64748b' },
          }}
        >
          <Label
            value="Faster"
            position="top"
            offset={15}
            style={{ fontSize: '11px', fill: '#64748b' }}
          />
        </YAxis>
        <Tooltip content={<CustomTooltip />} />

        {/* Reference line for standard time */}
        {standardTime && (
          <ReferenceLine
            y={standardTime}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={3}
            label={
              <ReferenceLabel
                standardTime={standardTime}
                standardName={standardName || 'Standard'}
              />
            }
          />
        )}

        <Line
          type="monotone"
          dataKey="time_ms"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Time"
          dot={<CustomDot />}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
