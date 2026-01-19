import { forwardRef, useMemo } from 'react';
import { Select, SelectProps, Loading } from '@/components/ui';
import { CourseType } from '@/types/meet';
import { useMeets } from '@/hooks/useMeets';
import { formatDateRange } from '@/utils/timeFormat';

export interface MeetSelectorProps extends Omit<SelectProps, 'options'> {
  courseType?: CourseType;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  showEmpty?: boolean;
  emptyLabel?: string;
}

export const MeetSelector = forwardRef<HTMLSelectElement, MeetSelectorProps>(
  ({ 
    courseType, 
    label = 'Meet', 
    placeholder = 'Select a meet',
    showEmpty = true,
    emptyLabel = 'No meets available',
    ...props 
  }, ref) => {
    const { data, isLoading, error } = useMeets({ course_type: courseType, limit: 100 });

    const options = useMemo(() => {
      if (!data?.meets || data.meets.length === 0) {
        return showEmpty ? [{ value: '', label: emptyLabel, disabled: true }] : [];
      }

      return data.meets.map(meet => {
        const dateStr = formatDateRange(meet.start_date, meet.end_date);
        return {
          value: meet.id,
          label: `${meet.name} - ${dateStr} (${meet.course_type})`,
        };
      });
    }, [data, showEmpty, emptyLabel]);

    if (isLoading) {
      return (
        <div className="w-full">
          {label && (
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {label}
            </label>
          )}
          <div className="h-10 flex items-center">
            <Loading className="h-5 w-5" />
            <span className="ml-2 text-sm text-slate-500">Loading meets...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full">
          {label && (
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {label}
            </label>
          )}
          <p className="text-sm text-red-600">Failed to load meets</p>
        </div>
      );
    }

    return (
      <Select
        ref={ref}
        label={label}
        placeholder={placeholder}
        options={options}
        {...props}
      />
    );
  }
);

MeetSelector.displayName = 'MeetSelector';

export default MeetSelector;
