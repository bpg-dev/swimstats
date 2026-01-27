import React from 'react';
import { EventComparison } from '@/types/comparison';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/utils/timeFormat';
import { EventLink } from '@/components/ui';
import { EventCode } from '@/types/time';

interface ComparisonTableProps {
  comparisons: EventComparison[];
  showNoTime?: boolean;
}

// Event display names
const eventNames: Record<string, string> = {
  '50FR': '50m Free',
  '100FR': '100m Free',
  '200FR': '200m Free',
  '400FR': '400m Free',
  '800FR': '800m Free',
  '1500FR': '1500m Free',
  '50BK': '50m Back',
  '100BK': '100m Back',
  '200BK': '200m Back',
  '50BR': '50m Breast',
  '100BR': '100m Breast',
  '200BR': '200m Breast',
  '50FL': '50m Fly',
  '100FL': '100m Fly',
  '200FL': '200m Fly',
  '200IM': '200m IM',
  '400IM': '400m IM',
};

// Group events by stroke
const strokeOrder = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM'];
const eventsByStroke: Record<string, string[]> = {
  Freestyle: ['50FR', '100FR', '200FR', '400FR', '800FR', '1500FR'],
  Backstroke: ['50BK', '100BK', '200BK'],
  Breaststroke: ['50BR', '100BR', '200BR'],
  Butterfly: ['50FL', '100FL', '200FL'],
  IM: ['200IM', '400IM'],
};

// Helper to format time difference in ms to a display string
function formatDifference(diffMs: number): string {
  const sign = diffMs <= 0 ? '' : '+';
  const absDiff = Math.abs(diffMs);
  const seconds = absDiff / 1000;
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${sign}${diffMs <= 0 ? '-' : ''}${mins}:${secs.padStart(5, '0')}`;
  }
  return `${diffMs <= 0 ? '-' : '+'}${seconds.toFixed(2)}`;
}

// Helper to calculate percentage difference
function calcPercent(swimmerMs: number, standardMs: number): number {
  return ((swimmerMs - standardMs) / standardMs) * 100;
}

export function ComparisonTable({ comparisons, showNoTime = false }: ComparisonTableProps) {
  // Filter and organize comparisons
  const comparisonMap = new Map(comparisons.map((c) => [c.event, c]));

  const filteredByStroke = strokeOrder
    .map((stroke) => ({
      stroke,
      events: eventsByStroke[stroke]
        .map((event) => comparisonMap.get(event))
        .filter((c): c is EventComparison => {
          if (!c) return false;
          if (!showNoTime && c.status === 'no_time') return false;
          return true;
        }),
    }))
    .filter((group) => group.events.length > 0);

  if (filteredByStroke.every((g) => g.events.length === 0)) {
    return (
      <div className="text-center py-8 text-slate-500">
        No times recorded yet. Add some times to see comparisons.
      </div>
    );
  }

  // Check if any comparison has prev/next age group data
  // Use truthy check - will be true only if there's an actual non-empty string value
  const hasPrevAgeGroup = comparisons.some((c) => !!c.prev_age_group);
  const hasNextAgeGroup = comparisons.some((c) => !!c.next_age_group);

  // Get age groups for headers (from first comparison that has them)
  const firstComp = comparisons.find((c) => c.age_group);
  const currentAgeGroup = firstComp?.age_group || '';
  const prevAgeGroup = comparisons.find((c) => c.prev_age_group)?.prev_age_group || '';
  const nextAgeGroup = comparisons.find((c) => c.next_age_group)?.next_age_group || '';

  // Calculate colspan for stroke header
  const baseColspan = 3; // Event, Your Time, Status
  const standardCols = (hasPrevAgeGroup ? 1 : 0) + 1 + (hasNextAgeGroup ? 1 : 0);
  const totalColspan = baseColspan + standardCols;

  return (
    <div className="overflow-x-auto">
      <table className="w-full divide-y divide-slate-200 table-fixed" style={{ minWidth: '800px' }}>
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap w-52 align-top">
              Event
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap w-28 align-top">
              Your Time
            </th>
            {hasPrevAgeGroup && (
              <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-32 align-top">
                <div>Prev Standard</div>
                {prevAgeGroup && prevAgeGroup !== 'OPEN' && (
                  <div className="text-xs font-normal normal-case text-slate-400">
                    ({prevAgeGroup})
                  </div>
                )}
              </th>
            )}
            <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider bg-indigo-50 border-x-2 border-indigo-200 w-36 align-top">
              <div>Current Standard</div>
              {currentAgeGroup && currentAgeGroup !== 'OPEN' && (
                <div className="text-xs font-normal normal-case text-slate-400">
                  ({currentAgeGroup})
                </div>
              )}
            </th>
            {hasNextAgeGroup && (
              <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-32 align-top">
                <div>Next Standard</div>
                {nextAgeGroup && nextAgeGroup !== 'OPEN' && (
                  <div className="text-xs font-normal normal-case text-slate-400">
                    ({nextAgeGroup})
                  </div>
                )}
              </th>
            )}
            <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap w-24 align-top">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {filteredByStroke.map((group) => (
            <React.Fragment key={group.stroke}>
              {/* Stroke header */}
              <tr className="bg-slate-50">
                <td
                  colSpan={totalColspan}
                  className="px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {group.stroke}
                </td>
              </tr>
              {/* Events */}
              {group.events.map((comp) => (
                <tr key={comp.event}>
                  <td className="px-4 py-3 whitespace-nowrap align-top">
                    <div className="text-sm">
                      <EventLink event={comp.event as EventCode}>
                        {eventNames[comp.event] || comp.event}
                      </EventLink>
                    </div>
                    {comp.meet_name && (
                      <div className="text-xs text-slate-500 mt-0.5">{comp.meet_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap align-top">
                    {comp.swimmer_time_formatted ? (
                      <div>
                        <div className="text-sm font-mono tabular-nums text-slate-900 font-semibold">
                          {comp.swimmer_time_formatted}
                        </div>
                        {comp.date && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {formatDate(comp.date)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  {/* Previous age group column */}
                  {hasPrevAgeGroup && (
                    <td
                      className={`px-4 py-3 whitespace-nowrap align-top text-center ${
                        comp.prev_achieved ? 'bg-slate-100' : ''
                      }`}
                    >
                      {comp.prev_standard_time_formatted ? (
                        <div>
                          <div>
                            <span
                              className={`text-sm font-mono tabular-nums ${
                                comp.prev_achieved
                                  ? 'text-slate-700 font-semibold'
                                  : 'text-slate-600'
                              }`}
                            >
                              {comp.prev_standard_time_formatted}
                            </span>
                          </div>
                          {comp.swimmer_time_ms != null && comp.prev_standard_time_ms != null && (
                            <div className="text-xs mt-0.5 tabular-nums">
                              <span
                                className={
                                  comp.swimmer_time_ms <= comp.prev_standard_time_ms
                                    ? 'text-slate-600'
                                    : 'text-slate-400'
                                }
                              >
                                {formatDifference(
                                  comp.swimmer_time_ms - comp.prev_standard_time_ms
                                )}{' '}
                                (
                                {calcPercent(comp.swimmer_time_ms, comp.prev_standard_time_ms) > 0
                                  ? '+'
                                  : ''}
                                {calcPercent(
                                  comp.swimmer_time_ms,
                                  comp.prev_standard_time_ms
                                ).toFixed(1)}
                                %)
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                  )}
                  {/* Current age group column (highlighted based on status) */}
                  <td
                    className={`px-4 py-3 whitespace-nowrap align-top text-center border-x-2 border-indigo-200 ${
                      comp.status === 'achieved'
                        ? 'bg-green-50'
                        : comp.status === 'almost'
                          ? 'bg-amber-50'
                          : ''
                    }`}
                  >
                    {comp.standard_time_formatted ? (
                      <div>
                        <div>
                          <span
                            className={`text-sm font-mono tabular-nums ${
                              comp.status === 'achieved'
                                ? 'text-green-700 font-semibold'
                                : comp.status === 'almost'
                                  ? 'text-amber-700 font-semibold'
                                  : 'text-slate-600'
                            }`}
                          >
                            {comp.standard_time_formatted}
                          </span>
                        </div>
                        {comp.difference_formatted && (
                          <div className="text-xs mt-0.5 tabular-nums">
                            <span
                              className={
                                (comp.difference_ms ?? 0) <= 0 ? 'text-green-600' : 'text-slate-500'
                              }
                            >
                              {comp.difference_formatted}
                              {comp.difference_percent != null && (
                                <>
                                  {' '}
                                  ({comp.difference_percent > 0 ? '+' : ''}
                                  {comp.difference_percent.toFixed(1)}%)
                                </>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">N/A</span>
                    )}
                  </td>
                  {/* Next age group column */}
                  {hasNextAgeGroup && (
                    <td
                      className={`px-4 py-3 whitespace-nowrap align-top text-center ${
                        comp.next_achieved ? 'bg-blue-50' : ''
                      }`}
                    >
                      {comp.next_standard_time_formatted ? (
                        <div>
                          <div>
                            <span
                              className={`text-sm font-mono tabular-nums ${
                                comp.next_achieved
                                  ? 'text-blue-700 font-semibold'
                                  : 'text-slate-600'
                              }`}
                            >
                              {comp.next_standard_time_formatted}
                            </span>
                          </div>
                          {comp.swimmer_time_ms != null && comp.next_standard_time_ms != null && (
                            <div className="text-xs mt-0.5 tabular-nums">
                              <span
                                className={
                                  comp.swimmer_time_ms <= comp.next_standard_time_ms
                                    ? 'text-blue-600'
                                    : 'text-slate-400'
                                }
                              >
                                {formatDifference(
                                  comp.swimmer_time_ms - comp.next_standard_time_ms
                                )}{' '}
                                (
                                {calcPercent(comp.swimmer_time_ms, comp.next_standard_time_ms) > 0
                                  ? '+'
                                  : ''}
                                {calcPercent(
                                  comp.swimmer_time_ms,
                                  comp.next_standard_time_ms
                                ).toFixed(1)}
                                %)
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap align-top text-center">
                    <StatusBadge status={comp.status} nextAchieved={comp.next_achieved} />
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
