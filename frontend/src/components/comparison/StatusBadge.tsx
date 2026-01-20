import { ComparisonStatus } from '@/types/comparison';

interface StatusBadgeProps {
  status: ComparisonStatus;
  className?: string;
}

const statusConfig: Record<
  ComparisonStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  achieved: {
    label: 'Achieved',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
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

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
    >
      {config.label}
    </span>
  );
}
