import { Link } from 'react-router-dom';

interface MeetLinkProps {
  meetId: string;
  meetName: string;
  className?: string;
}

/**
 * MeetLink - Clickable meet name that navigates to Meet Details page.
 *
 * Usage:
 *   <MeetLink meetId="123" meetName="Ontario Championships" />
 *   Renders: <Link to="/meets/123">Ontario Championships</Link>
 */
export function MeetLink({ meetId, meetName, className }: MeetLinkProps) {
  return (
    <Link
      to={`/meets/${meetId}`}
      className={`
        font-medium text-blue-800 dark:text-blue-300
        hover:text-blue-600 hover:bg-slate-100 dark:hover:text-blue-400 dark:hover:bg-slate-700
        px-1 -mx-1 rounded
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        focus-visible:ring-offset-2
        transition-colors
        ${className ?? ''}
      `.trim()}
      aria-label={`View details for ${meetName}`}
    >
      {meetName}
    </Link>
  );
}

export default MeetLink;
