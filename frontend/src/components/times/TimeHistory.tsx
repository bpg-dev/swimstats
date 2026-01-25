import { TimeRecord, EventCode } from '@/types/time';
import { CourseType } from '@/types/meet';
import { Card, CardContent, CardHeader, CardTitle, Loading, ErrorBanner, EventLink, MeetLink } from '@/components/ui';
import { useTimes, useDeleteTime } from '@/hooks/useTimes';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, formatDateRange } from '@/utils/timeFormat';

export interface TimeHistoryProps {
  courseType?: CourseType;
  event?: EventCode;
  meetId?: string;
  limit?: number;
  showHeader?: boolean;
  onEditTime?: (time: TimeRecord) => void;
  emptyMessage?: string;
}

export function TimeHistory({
  courseType,
  event,
  meetId,
  limit = 50,
  showHeader = true,
  onEditTime,
  emptyMessage = 'No times recorded yet.',
}: TimeHistoryProps) {
  const { data, isLoading, error } = useTimes({
    course_type: courseType,
    event,
    meet_id: meetId,
    limit,
  });
  const deleteMutation = useDeleteTime();
  const canWrite = useAuthStore((state) => state.canWrite);

  if (isLoading) {
    return <Loading className="py-8" />;
  }

  if (error) {
    return <ErrorBanner message="Failed to load times" />;
  }

  const times = data?.times || [];

  const formatMeetDate = (time: TimeRecord): string => {
    if (!time.meet) return '—';
    // If event_date is set and different from meet start_date, show it
    if (time.event_date && time.event_date !== time.meet.start_date) {
      return formatDate(time.event_date);
    }
    return formatDateRange(time.meet.start_date, time.meet.end_date);
  };

  const handleDelete = async (time: TimeRecord) => {
    if (window.confirm(`Delete this ${time.event} time (${time.time_formatted})?`)) {
      await deleteMutation.mutateAsync(time.id);
    }
  };

  const content = (
    <>
      {times.length === 0 ? (
        <p className="text-slate-500 text-center py-8">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                <th className="pb-3 font-medium">Event</th>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Meet</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {times.map((time) => (
                  <tr key={time.id}>
                    <td className="py-3">
                      <EventLink event={time.event} />
                      {time.notes && <div className="text-xs text-slate-500">{time.notes}</div>}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 font-medium">
                          {time.time_formatted}
                        </span>
                        {time.is_pb && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            PB
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      {time.meet ? (
                        <div>
                          <MeetLink meetId={time.meet_id} meetName={time.meet.name} />
                          <div className="text-xs text-slate-500">
                            {time.meet.city}
                            <span
                              className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium
                              ${
                                time.meet.course_type === '25m'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-green-50 text-green-700'
                              }
                            `}
                            >
                              {time.meet.course_type}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-600">{formatMeetDate(time)}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onEditTime && (
                          <button
                            onClick={() => onEditTime(time)}
                            className="p-1 text-slate-400 hover:text-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-400"
                            aria-label="Edit time"
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
                          aria-label="Delete time"
                          disabled={deleteMutation.isPending || !canWrite()}
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  if (!showHeader) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Time History
          {data?.total !== undefined && data.total > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-500">({data.total} total)</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

export default TimeHistory;
