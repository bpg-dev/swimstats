import { useState } from 'react';
import { useCourseType } from '@/stores/courseFilterStore';
import { useProgress } from '@/hooks/useProgress';
import { useSwimmer } from '@/hooks/useSwimmer';
import { useStandards, useStandard } from '@/hooks/useStandards';
import { ProgressChart } from '@/components/charts/ProgressChart';
import { EventSelector } from '@/components/times/EventSelector';
import { Card, CardHeader, CardTitle, CardContent, Loading, ErrorBanner } from '@/components/ui';
import { EventCode } from '@/types/time';

/**
 * Progress page - visualize time progression over dates.
 */
export function Progress() {
  const courseType = useCourseType();
  const { data: swimmer } = useSwimmer();
  const [selectedEvent, setSelectedEvent] = useState<EventCode>('50FR');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedStandardId, setSelectedStandardId] = useState<string>('');

  const { data: standardsData } = useStandards({
    course_type: courseType,
    gender: swimmer?.gender,
  });

  // Fetch full standard with times when a standard is selected
  const { data: selectedStandardData } = useStandard(selectedStandardId);

  const progressParams = {
    event: selectedEvent,
    course_type: courseType,
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate }),
  };

  const { data: progressData, isLoading, error } = useProgress(progressParams);

  // Find the qualifying time for the selected event in the selected standard
  let standardTime: number | undefined;
  let standardName: string | undefined;
  if (selectedStandardData) {
    standardName = selectedStandardData.name;
    // Find the time for this event (match any age group - we'll show the fastest/first one)
    const matchingTime = selectedStandardData.times?.find((t) => t.event === selectedEvent);
    if (matchingTime) {
      standardTime = matchingTime.time_ms;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Progress</h1>
        <p className="text-slate-600 mt-1">Visualize your improvement over time.</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event selector */}
            <EventSelector
              id="event"
              label="Event"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value as EventCode)}
            />

            {/* Standard selector (optional reference line) */}
            <div>
              <label htmlFor="standard" className="block text-sm font-medium text-slate-700 mb-1">
                Standard Reference (Optional)
              </label>
              <select
                id="standard"
                value={selectedStandardId}
                onChange={(e) => setSelectedStandardId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">None</option>
                {standardsData?.standards?.map((standard) => (
                  <option key={standard.id} value={standard.id}>
                    {standard.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start date */}
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 mb-1">
                Start Date (Optional)
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* End date */}
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Clear filters */}
          {(startDate || endDate || selectedStandardId) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSelectedStandardId('');
                }}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent>
            <Loading text="Loading progress data..." />
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && <ErrorBanner message={error.message || 'Failed to load progress data'} />}

      {/* Chart */}
      {progressData && (
        <Card>
          <CardHeader>
            <CardTitle>Time Progression - {selectedEvent}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart
              data={progressData.data_points}
              standardTime={standardTime}
              standardName={standardName}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Progress;
