import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from 'recharts';
import { ProgressDataPoint } from '@/types/progress';

interface ProgressChartProps {
  data: ProgressDataPoint[];
  standardTime?: number; // Standard time in ms for reference line
  standardName?: string;
}

// Custom dot component to highlight PBs
interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ProgressDataPoint;
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
  payload?: Array<{ payload: ProgressDataPoint }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ProgressDataPoint;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-md shadow-lg">
        <p className="font-semibold text-slate-900">{data.time_formatted}</p>
        <p className="text-sm text-slate-600">{data.meet_name}</p>
        <p className="text-sm text-slate-500">
          {new Date(data.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
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

// Format date for X-axis
const formatXAxis = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No times recorded yet for this event.</p>
        <p className="text-sm mt-2">Add some times to see your progress!</p>
      </div>
    );
  }

  // Find min and max times for Y-axis domain (add 5% padding)
  const times = data.map((d) => d.time_ms);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const padding = (maxTime - minTime) * 0.05;
  const yDomain = [Math.max(0, minTime - padding), maxTime + padding];

  // Include standard time in domain if provided
  if (standardTime) {
    yDomain[0] = Math.min(yDomain[0], standardTime - padding);
    yDomain[1] = Math.max(yDomain[1], standardTime + padding);
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          reversed
          domain={yDomain}
          tickFormatter={formatYAxis}
          stroke="#64748b"
          style={{ fontSize: '12px' }}
          label={{
            value: 'Time',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: '14px', fill: '#64748b' },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />

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
