import { forwardRef, useMemo } from 'react';
import { Select, SelectProps } from '@/components/ui';
import { EventCode, EVENTS, EVENTS_BY_STROKE } from '@/types/time';

export interface EventSelectorProps extends Omit<SelectProps, 'options'> {
  groupByStroke?: boolean;
  value?: EventCode;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  labelClassName?: string;
  /** Events to exclude from the dropdown (e.g., already entered for this meet) */
  excludeEvents?: EventCode[];
}

export const EventSelector = forwardRef<HTMLSelectElement, EventSelectorProps>(
  (
    {
      groupByStroke = false,
      label = 'Event',
      placeholder = 'Select event',
      labelClassName,
      excludeEvents = [],
      ...props
    },
    ref
  ) => {
    const excludeSet = useMemo(() => new Set(excludeEvents), [excludeEvents]);

    const options = useMemo(() => {
      if (groupByStroke) {
        // Create optgroup-like structure (flattened since Select doesn't support optgroups)
        const grouped: { value: string; label: string; disabled?: boolean }[] = [];

        Object.entries(EVENTS_BY_STROKE).forEach(([stroke, events]) => {
          // Only add stroke header if there are available events in this group
          const availableEvents = events.filter((e) => !excludeSet.has(e.code));
          if (availableEvents.length > 0) {
            grouped.push({ value: `__${stroke}`, label: `── ${stroke} ──`, disabled: true });
            availableEvents.forEach((event) => {
              grouped.push({ value: event.code, label: event.name });
            });
          }
        });

        return grouped;
      }

      return EVENTS.filter((event) => !excludeSet.has(event.code)).map((event) => ({
        value: event.code,
        label: event.name,
      }));
    }, [groupByStroke, excludeSet]);

    return (
      <Select
        ref={ref}
        label={label}
        labelClassName={labelClassName}
        placeholder={placeholder}
        options={options}
        {...props}
      />
    );
  }
);

EventSelector.displayName = 'EventSelector';

export default EventSelector;
