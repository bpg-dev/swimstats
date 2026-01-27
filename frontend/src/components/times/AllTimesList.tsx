import { TimeRecord, getEventInfo } from '@/types/time';
import { SortBy } from './SortToggle';
import { formatDate } from '@/utils/timeFormat';
import { MeetLink } from '@/components/ui';

interface AllTimesListProps {
  times: TimeRecord[];
  pbTimeId?: string; // ID of the personal best time to highlight
  sortBy: SortBy;
}

/**
 * Compact table list of all times for a selected event, with PB marker and ranking.
 */
export function AllTimesList({ times, pbTimeId, sortBy }: AllTimesListProps) {
  if (times.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12">
        <div className="text-4xl mb-4">🏊</div>
        <p className="text-lg">No times recorded yet.</p>
        <p className="text-sm mt-2">Add times from the "Add Times" page to see them here.</p>
      </div>
    );
  }

  // Sort times based on sortBy
  const sortedTimes = [...times].sort((a, b) => {
    if (sortBy === 'time') {
      // Fastest first
      return a.time_ms - b.time_ms;
    } else {
      // Newest first (by event date or meet start date)
      const dateA = a.event_date || a.meet?.start_date;
      const dateB = b.event_date || b.meet?.start_date;
      const timeA = dateA ? new Date(dateA).getTime() : 0;
      const timeB = dateB ? new Date(dateB).getTime() : 0;
      return timeB - timeA;
    }
  });

  const formatEventDate = (time: TimeRecord): string => {
    // Always show the event date (which is now required)
    if (time.event_date) {
      return formatDate(time.event_date);
    }
    // Fallback for legacy data without event_date
    if (time.meet) {
      return formatDate(time.meet.start_date);
    }
    return '—';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
            {sortBy === 'time' && <th className="pb-3 pr-3 font-medium w-12">#</th>}
            <th className="pb-3 font-medium">Event</th>
            <th className="pb-3 font-medium">Time</th>
            <th className="pb-3 font-medium">Meet</th>
            <th className="pb-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {sortedTimes.map((time, index) => {
            const isPB = time.id === pbTimeId;
            const eventInfo = getEventInfo(time.event);
            const rank = sortBy === 'time' ? index + 1 : undefined;

            return (
              <tr key={time.id} className={isPB ? 'bg-amber-50' : ''}>
                {/* Rank (only when sorting by time) */}
                {sortBy === 'time' && (
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        rank === 1
                          ? 'bg-amber-400 text-amber-900'
                          : rank === 2
                            ? 'bg-slate-300 text-slate-700'
                            : rank === 3
                              ? 'bg-orange-300 text-orange-800'
                              : 'text-slate-500'
                      }`}
                    >
                      {rank}
                    </span>
                  </td>
                )}

                {/* Event */}
                <td className="py-3">
                  <div className="font-medium text-slate-900">{eventInfo?.name || time.event}</div>
                  {time.notes && <div className="text-xs text-slate-500 italic">{time.notes}</div>}
                </td>

                {/* Time */}
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-900 font-medium tabular-nums">
                      {time.time_formatted}
                    </span>
                    {isPB && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-amber-400 text-amber-900">
                        PB
                      </span>
                    )}
                  </div>
                </td>

                {/* Meet */}
                <td className="py-3">
                  {time.meet ? (
                    <MeetLink meetId={time.meet_id} meetName={time.meet.name} />
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* Date */}
                <td className="py-3 text-slate-600">{formatEventDate(time)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AllTimesList;
