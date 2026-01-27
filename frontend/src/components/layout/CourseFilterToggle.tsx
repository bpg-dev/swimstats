import { useCourseFilterStore, CourseType } from '@/stores/courseFilterStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface CourseFilterToggleProps {
  className?: string;
}

/**
 * Toggle switch for selecting pool course type (25m vs 50m).
 */
export function CourseFilterToggle({ className }: CourseFilterToggleProps) {
  const { courseType, setCourseType } = useCourseFilterStore();

  const options: { value: CourseType; label: string; description: string }[] = [
    { value: '25m', label: '25m', description: 'Short Course' },
    { value: '50m', label: '50m', description: 'Long Course' },
  ];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="text-sm text-slate-500 mr-2 hidden sm:inline">Course:</span>
      <div
        className="inline-flex rounded-lg bg-slate-100 p-0.5"
        role="radiogroup"
        aria-label="Select pool course type"
      >
        {options.map((option) => (
          <button
            key={option.value}
            role="radio"
            aria-checked={courseType === option.value}
            onClick={() => setCourseType(option.value)}
            className={cn(
              'px-3.5 py-1.5 text-sm font-semibold rounded-md transition-all',
              courseType === option.value
                ? option.value === '25m'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-green-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            )}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact version for mobile/narrow spaces.
 */
export function CourseFilterToggleCompact({ className }: CourseFilterToggleProps) {
  const { courseType, toggle } = useCourseFilterStore();

  return (
    <button
      onClick={toggle}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
        courseType === '25m'
          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          : 'bg-green-100 text-green-800 hover:bg-green-200',
        className
      )}
      aria-label={`Current: ${courseType}. Click to toggle.`}
    >
      {courseType}
    </button>
  );
}

export default CourseFilterToggle;
