import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCourseType } from '@/stores/courseFilterStore';
import { useTimes } from '@/hooks/useTimes';
import { usePersonalBests } from '@/hooks/usePersonalBests';
import { EventFilter, SortToggle, AllTimesList, SortBy } from '@/components/times';
import { Loading, ErrorBanner } from '@/components/ui';
import { EventCode, EVENTS, getEventInfo, isSplitEvent, splitVariant } from '@/types/time';

// Only base (non-split) events for the filter
const BASE_EVENTS = EVENTS.filter((e) => !isSplitEvent(e.code));

// Default to first base event (50m Freestyle)
const DEFAULT_EVENT: EventCode = BASE_EVENTS[0].code;

// Valid event codes for URL param validation (base events only)
const VALID_EVENTS = new Set(BASE_EVENTS.map((e) => e.code));

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

  // Also fetch split variant times (e.g., 100FRS when viewing 100FR)
  const splitEvent = splitVariant(selectedEvent);
  const {
    data: splitTimeData,
    isLoading: splitTimesLoading,
    error: splitTimesError,
    refetch: refetchSplitTimes,
  } = useTimes(splitEvent ? { course_type: courseType, event: splitEvent, limit: 100 } : undefined);

  // Merge base and split times
  const mergedTimes = [...(timeData?.times || []), ...(splitTimeData?.times || [])];
  const mergedTotal = (timeData?.total || 0) + (splitTimeData?.total || 0);

  // Fetch personal bests to identify PB
  const { data: pbData, isLoading: pbLoading } = usePersonalBests(courseType);

  // Find the PB time ID for the selected event (could be from base or split)
  const pbTimeId = pbData?.personal_bests.find((pb) => pb.event === selectedEvent)?.time_id;

  const isLoading = timesLoading || splitTimesLoading || pbLoading;
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
          <EventFilter
            value={selectedEvent}
            onChange={handleEventChange}
            className="w-full"
            excludeSplits
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sort by</label>
          <SortToggle value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {/* Error */}
      {(timesError || splitTimesError) && (
        <ErrorBanner
          message={(timesError || splitTimesError)?.message || 'Failed to load times'}
          onRetry={() => {
            refetchTimes();
            refetchSplitTimes();
          }}
        />
      )}

      {/* Loading */}
      {isLoading && <Loading />}

      {/* Times list */}
      {!isLoading && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {mergedTotal} time{mergedTotal !== 1 ? 's' : ''} recorded for{' '}
              {eventInfo?.name || selectedEvent}
            </p>
          </div>
          <AllTimesList times={mergedTimes} pbTimeId={pbTimeId} sortBy={sortBy} />
        </>
      )}
    </div>
  );
}

export default AllTimes;
