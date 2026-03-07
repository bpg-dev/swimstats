import { Fragment, useState } from 'react';
import { TimeRecord, getEventInfo } from '@/types/time';
import {
  Loading,
  ErrorBanner,
  EventLink,
  Table,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui';
import { TimeEntryForm } from '@/components/times/TimeEntryForm';
import { useTimes, useDeleteTime } from '@/hooks/useTimes';
import { usePersonalBests } from '@/hooks/usePersonalBests';
import { useAuthStore } from '@/stores/authStore';
import { CourseType } from '@/types/meet';

interface MeetTimesListProps {
  meetId: string;
  courseType: CourseType;
}

/**
 * Display all times from a specific meet, grouped by date.
 */
export function MeetTimesList({ meetId, courseType }: MeetTimesListProps) {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<TimeRecord | null>(null);
  const canWrite = useAuthStore((state) => state.canWrite);
  const { data, isLoading, error, refetch } = useTimes({
    meet_id: meetId,
    limit: 100,
  });
  const { data: pbData } = usePersonalBests(courseType);
  const deleteMutation = useDeleteTime();

  const handleDeleteClick = (timeId: string) => {
    setConfirmingDeleteId(timeId);
  };

  const handleConfirmDelete = async (timeId: string) => {
    setDeletingId(timeId);
    setConfirmingDeleteId(null);
    try {
      await deleteMutation.mutateAsync(timeId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmingDeleteId(null);
  };

  if (editingTime) {
    return (
      <TimeEntryForm
        initialData={editingTime}
        meetId={meetId}
        courseType={courseType}
        onSuccess={() => setEditingTime(null)}
        onCancel={() => setEditingTime(null)}
      />
    );
  }

  if (isLoading) {
    return <Loading className="py-8" />;
  }

  if (error) {
    return (
      <ErrorBanner message={error.message || 'Failed to load times'} onRetry={() => refetch()} />
    );
  }

  if (!data?.times || data.times.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="mt-4">No times recorded for this meet yet.</p>
      </div>
    );
  }

  // Group times by date
  const strokeOrder = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Individual Medley'];

  const sortByEvent = (a: TimeRecord, b: TimeRecord) => {
    const eventInfoA = getEventInfo(a.event);
    const eventInfoB = getEventInfo(b.event);
    if (!eventInfoA || !eventInfoB) return 0;
    const strokeDiff =
      strokeOrder.indexOf(eventInfoA.stroke) - strokeOrder.indexOf(eventInfoB.stroke);
    if (strokeDiff !== 0) return strokeDiff;
    return eventInfoA.distance - eventInfoB.distance;
  };

  const timesByDate: Record<string, TimeRecord[]> = {};
  data.times.forEach((time) => {
    const dateKey = time.event_date!;
    if (!timesByDate[dateKey]) {
      timesByDate[dateKey] = [];
    }
    timesByDate[dateKey].push(time);
  });

  // Sort dates chronologically and sort times within each date by event
  const sortedDates = Object.keys(timesByDate).sort((a, b) => a.localeCompare(b));

  sortedDates.forEach((date) => {
    timesByDate[date].sort(sortByEvent);
  });

  // Only show date headers for multi-day meets
  const isMultiDayMeet = sortedDates.length > 1;

  // Get PB time IDs for comparison
  const pbTimeIds = new Set(pbData?.personal_bests.map((pb) => pb.time_id) || []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Times ({data.total})</h3>
      </div>

      <Table>
        <TableHeader>
          <TableHeaderRow>
            <TableHead className="w-[30%]">Event</TableHead>
            <TableHead className="w-[20%]">Time</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="w-20 sr-only">Actions</TableHead>
          </TableHeaderRow>
        </TableHeader>
        <TableBody>
          {sortedDates.map((date) => (
            <Fragment key={date}>
              {isMultiDayMeet && (
                <TableRow key={`date-${date}`}>
                  <TableCell
                    colSpan={4}
                    className="pt-4 pb-2 text-sm font-semibold text-slate-800 px-3 bg-slate-100"
                  >
                    {date}
                  </TableCell>
                </TableRow>
              )}
              {timesByDate[date].map((time) => {
                const isPB = pbTimeIds.has(time.id);
                const eventInfo = getEventInfo(time.event);

                return (
                  <TableRow key={time.id} className={isPB ? 'bg-amber-50' : ''}>
                    <TableCell>
                      <EventLink event={time.event} />
                    </TableCell>
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
                    <TableCell className="text-slate-600">{time.notes || '—'}</TableCell>
                    <TableCell>
                      {confirmingDeleteId === time.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleConfirmDelete(time.id)}
                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            aria-label="Confirm delete"
                          >
                            Delete
                          </button>
                          <button
                            onClick={handleCancelDelete}
                            className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            aria-label="Cancel delete"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingTime(time)}
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
                          <button
                            onClick={() => handleDeleteClick(time.id)}
                            className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-400"
                            aria-label={`Delete ${eventInfo?.name || time.event} time`}
                            disabled={deletingId === time.id || !canWrite()}
                          >
                            {deletingId === time.id ? (
                              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                            ) : (
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
                            )}
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default MeetTimesList;
