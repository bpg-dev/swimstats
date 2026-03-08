import { TimeRecord, getEventInfo, isSplitEvent, baseEvent, EventCode } from '@/types/time';
import { SortBy } from './SortToggle';
import { formatDate } from '@/utils/timeFormat';
import {
  EmptyState,
  MeetLink,
  Table,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui';
import { useDeleteTime } from '@/hooks/useTimes';
import { useAuthStore } from '@/stores/authStore';

interface AllTimesListProps {
  times: TimeRecord[];
  pbTimeId?: string; // ID of the personal best time to highlight
  sortBy: SortBy;
  onEditTime?: (time: TimeRecord) => void;
}

/**
 * Compact table list of all times for a selected event, with PB marker and ranking.
 */
export function AllTimesList({ times, pbTimeId, sortBy, onEditTime }: AllTimesListProps) {
  const deleteMutation = useDeleteTime();
  const canWrite = useAuthStore((state) => state.canWrite);

  const handleDelete = async (time: TimeRecord) => {
    if (window.confirm(`Delete this ${time.event} time (${time.time_formatted})?`)) {
      await deleteMutation.mutateAsync(time.id);
    }
  };

  if (times.length === 0) {
    return (
      <EmptyState
        message="No times recorded yet."
        detail='Add times from the "Add Times" page to see them here.'
      />
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
    <Table>
      <TableHeader>
        <TableHeaderRow>
          {sortBy === 'time' && <TableHead className="pr-3 w-12">#</TableHead>}
          <TableHead className="w-[25%]">Event</TableHead>
          <TableHead className="w-[15%]">Time</TableHead>
          <TableHead>Meet</TableHead>
          <TableHead className="w-[15%]">Date</TableHead>
          <TableHead className="w-20 sr-only">Actions</TableHead>
        </TableHeaderRow>
      </TableHeader>
      <TableBody>
        {sortedTimes.map((time, index) => {
          const isPB = time.id === pbTimeId;
          const eventInfo = getEventInfo(time.event);
          const rank = sortBy === 'time' ? index + 1 : undefined;

          return (
            <TableRow key={time.id} className={isPB ? 'bg-amber-50' : ''}>
              {/* Rank (only when sorting by time) */}
              {sortBy === 'time' && (
                <TableCell className="pr-3">
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
                </TableCell>
              )}

              {/* Event */}
              <TableCell>
                <div className="font-medium text-slate-900">
                  {isSplitEvent(time.event)
                    ? getEventInfo(baseEvent(time.event as EventCode))?.name || time.event
                    : eventInfo?.name || time.event}
                  {isSplitEvent(time.event) && (
                    <span
                      className="ml-1.5 inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700"
                      aria-hidden="true"
                    >
                      Split
                    </span>
                  )}
                </div>
                {time.notes && <div className="text-xs text-slate-500 italic">{time.notes}</div>}
              </TableCell>

              {/* Time */}
              <TableCell>
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
              </TableCell>

              {/* Meet */}
              <TableCell>
                {time.meet ? (
                  <MeetLink meetId={time.meet_id} meetName={time.meet.name} />
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </TableCell>

              {/* Date */}
              <TableCell className="text-slate-600">{formatEventDate(time)}</TableCell>

              {/* Actions */}
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {onEditTime && (
                    <button
                      onClick={() => onEditTime(time)}
                      className="p-1 text-slate-400 hover:text-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-400"
                      aria-label={`Edit ${eventInfo?.name || time.event} time`}
                      disabled={!canWrite()}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(time)}
                    className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-400"
                    aria-label={`Delete ${eventInfo?.name || time.event} time`}
                    disabled={deleteMutation.isPending || !canWrite()}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default AllTimesList;
