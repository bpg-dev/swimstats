import { ComparisonStatus } from '@/types/comparison';

interface StatusBadgeProps {
  status: ComparisonStatus;
  nextAchieved?: boolean;
  className?: string;
}

const statusConfig: Record<
  ComparisonStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  achieved: {
    label: 'Achieved',
    bgColor: 'bg-emerald-600',
    textColor: 'text-white',
  },
  almost: {
    label: 'Almost',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
  not_achieved: {
    label: 'Not Yet',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
  },
  no_time: {
    label: 'No Time',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-400',
  },
  no_standard: {
    label: 'N/A',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-400',
  },
};

export function StatusBadge({ status, nextAchieved, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];

  // Special case: achieved current AND next standard - add gold star
  if (status === 'achieved' && nextAchieved) {
    return (
      <span
        className={`inline-flex items-center justify-center gap-0.5 w-20 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
      >
        <svg className="w-3 h-3 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-20 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
    >
      {config.label}
    </span>
  );
}
