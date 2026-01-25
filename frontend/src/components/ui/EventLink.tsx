import { Link } from 'react-router-dom';
import { EventCode, getEventInfo } from '@/types/time';

interface EventLinkProps {
  event: EventCode;
  className?: string;
  children?: React.ReactNode;
}

/**
 * EventLink - Clickable event name that navigates to All Times filtered by event.
 *
 * Usage:
 *   <EventLink event="50FR" />
 *   Renders: <Link to="/all-times?event=50FR">50m Freestyle</Link>
 *
 *   <EventLink event="50FR">Custom text</EventLink>
 *   Renders: <Link to="/all-times?event=50FR">Custom text</Link>
 */
export function EventLink({ event, className, children }: EventLinkProps) {
  const eventInfo = getEventInfo(event);
  const displayName = children ?? eventInfo?.name ?? event;

  return (
    <Link
      to={`/all-times?event=${event}`}
      className={`
        font-medium text-blue-800 dark:text-blue-300
        hover:text-blue-600 hover:bg-slate-100 dark:hover:text-blue-400 dark:hover:bg-slate-700
        px-1 -mx-1 rounded
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        focus-visible:ring-offset-2
        transition-colors
        ${className ?? ''}
      `.trim()}
      aria-label={`View all times for ${eventInfo?.name ?? event}`}
    >
      {displayName}
    </Link>
  );
}

export default EventLink;
