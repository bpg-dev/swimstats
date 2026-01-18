import { EVENTS, EventCode } from '@/types/time';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface EventFilterProps {
  value: EventCode;
  onChange: (event: EventCode) => void;
  className?: string;
}

const STROKE_ORDER = [
  'Freestyle',
  'Backstroke',
  'Breaststroke',
  'Butterfly',
  'Individual Medley',
];

/**
 * Event selector dropdown grouped by stroke.
 */
export function EventFilter({ value, onChange, className = '' }: EventFilterProps) {
  // Group events by stroke
  const eventsByStroke = STROKE_ORDER.reduce((acc, stroke) => {
    acc[stroke] = EVENTS.filter(e => e.stroke === stroke);
    return acc;
  }, {} as Record<string, typeof EVENTS>);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as EventCode)}
      className={cn(
        'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
        'border-slate-300',
        'appearance-none bg-no-repeat bg-right',
        'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")]',
        'bg-[length:1.5rem_1.5rem]',
        'pr-10',
        className
      )}
    >
      {STROKE_ORDER.map((stroke) => (
        <optgroup key={stroke} label={stroke}>
          {eventsByStroke[stroke]?.map((event) => (
            <option key={event.code} value={event.code}>
              {event.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

export default EventFilter;
