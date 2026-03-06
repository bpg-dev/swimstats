import { Link } from 'react-router-dom';
import { EventCode, getEventInfo, isSplitEvent, baseEvent } from '@/types/time';

interface EventLinkProps {
  event: EventCode;
  className?: string;
  children?: React.ReactNode;
}

/**
 * EventLink - Clickable event name that navigates to All Times filtered by event.
 * For split events, shows the base event name with a "Split" badge and links to
 * the base event's All Times page (which includes split times).
 */
export function EventLink({ event, className, children }: EventLinkProps) {
  const isSplit = isSplitEvent(event);
  const resolvedEvent = isSplit ? baseEvent(event) : event;
  const eventInfo = getEventInfo(resolvedEvent);
  const displayName = children ?? eventInfo?.name ?? event;

  return (
    <Link
      to={`/all-times?event=${resolvedEvent}`}
      className={`
        font-medium text-blue-800 dark:text-blue-300
        border-b border-transparent hover:border-blue-600 dark:hover:border-blue-400
        hover:text-blue-600 dark:hover:text-blue-400
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        focus-visible:ring-offset-2
        transition-colors
        ${className ?? ''}
      `.trim()}
      aria-label={`View all times for ${eventInfo?.name ?? event}${isSplit ? ' (relay split)' : ''}`}
    >
      {displayName}
      {isSplit && (
        <span
          className="ml-1.5 inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700"
          aria-hidden="true"
        >
          Split
        </span>
      )}
    </Link>
  );
}

export default EventLink;
