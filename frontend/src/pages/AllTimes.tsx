import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCourseType } from '@/stores/courseFilterStore';
import { useTimes } from '@/hooks/useTimes';
import { usePersonalBests } from '@/hooks/usePersonalBests';
import { EventFilter, SortToggle, AllTimesList, SortBy } from '@/components/times';
import { Loading, ErrorBanner } from '@/components/ui';
import { EventCode, EVENTS, getEventInfo } from '@/types/time';

// Default to first event (50m Freestyle)
const DEFAULT_EVENT: EventCode = EVENTS[0].code;

// Valid event codes for URL param validation
const VALID_EVENTS = new Set(EVENTS.map((e) => e.code));

/**
 * All Times page - view all recorded times for a selected event.
 * Supports ?event=CODE URL parameter for deep linking from Personal Bests.
 */
export function AllTimes() {
  const courseType = useCourseType();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<SortBy>('date');

  // Derive selected event from URL, with fallback to default
  const eventFromUrl = searchParams.get('event') as EventCode | null;
  const selectedEvent =
    eventFromUrl && VALID_EVENTS.has(eventFromUrl) ? eventFromUrl : DEFAULT_EVENT;

  // Update URL when event changes
  const handleEventChange = (event: EventCode) => {
    setSearchParams({ event });
  };

  // Fetch times for the selected event
  const {
    data: timeData,
    isLoading: timesLoading,
    error: timesError,
    refetch: refetchTimes,
  } = useTimes({
    course_type: courseType,
    event: selectedEvent,
    limit: 100, // Get all times for the event
  });

  // Fetch personal bests to identify PB
  const { data: pbData, isLoading: pbLoading } = usePersonalBests(courseType);

  // Find the PB time ID for the selected event
  const pbTimeId = pbData?.personal_bests.find((pb) => pb.event === selectedEvent)?.time_id;

  const isLoading = timesLoading || pbLoading;
  const eventInfo = getEventInfo(selectedEvent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Times</h1>
        <p className="text-slate-600 mt-1">
          View all recorded times for{' '}
          {courseType === '25m' ? 'Short Course (25m)' : 'Long Course (50m)'}.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full sm:max-w-xs">
          <label htmlFor="event-filter" className="block text-sm font-medium text-slate-700 mb-1">
            Event
          </label>
          <EventFilter value={selectedEvent} onChange={handleEventChange} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sort by</label>
          <SortToggle value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {/* Error */}
      {timesError && (
        <ErrorBanner
          message={timesError.message || 'Failed to load times'}
          onRetry={() => refetchTimes()}
        />
      )}

      {/* Loading */}
      {isLoading && <Loading />}

      {/* Times list */}
      {!isLoading && timeData && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {timeData.total} time{timeData.total !== 1 ? 's' : ''} recorded for{' '}
              {eventInfo?.name || selectedEvent}
            </p>
          </div>
          <AllTimesList times={timeData.times} pbTimeId={pbTimeId} sortBy={sortBy} />
        </>
      )}
    </div>
  );
}

export default AllTimes;
