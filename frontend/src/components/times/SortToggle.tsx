export type SortBy = 'date' | 'time';

interface SortToggleProps {
  value: SortBy;
  onChange: (sortBy: SortBy) => void;
  className?: string;
}

/**
 * Toggle between sorting by date (newest first) and time (fastest first).
 */
export function SortToggle({ value, onChange, className = '' }: SortToggleProps) {
  return (
    <div className={`inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 ${className}`}>
      <button
        type="button"
        onClick={() => onChange('date')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          value === 'date'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        📅 Newest
      </button>
      <button
        type="button"
        onClick={() => onChange('time')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          value === 'time'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        ⚡ Fastest
      </button>
    </div>
  );
}

export default SortToggle;
