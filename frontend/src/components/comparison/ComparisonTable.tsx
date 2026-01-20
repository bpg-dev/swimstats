import React from 'react';
import { EventComparison } from '@/types/comparison';
import { StatusBadge } from './StatusBadge';

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

  // Calculate colspan for stroke header
  const baseColspan = 4; // Event, Your Time, Difference, Status
  const standardCols = (hasPrevAgeGroup ? 1 : 0) + 1 + (hasNextAgeGroup ? 1 : 0);
  const totalColspan = baseColspan + standardCols;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-48">
              Event
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">
              Your Time
            </th>
            {hasPrevAgeGroup && (
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-28">
                Prev Standard
              </th>
            )}
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider bg-indigo-50 border-x-2 border-indigo-200 w-28">
              Current Standard
            </th>
            {hasNextAgeGroup && (
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-28">
                Next Standard
              </th>
            )}
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-32">
              Difference
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-24">
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
                <tr key={comp.event} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap align-top">
                    <div className="text-sm font-medium text-slate-900">
                      {eventNames[comp.event] || comp.event}
                    </div>
                    {comp.meet_name && (
                      <div className="text-xs text-slate-500 mt-0.5">{comp.meet_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap align-top">
                    {comp.swimmer_time_formatted ? (
                      <div>
                        <div className="text-sm font-mono tabular-nums text-slate-900">
                          {comp.swimmer_time_formatted}
                        </div>
                        {comp.date && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {new Date(comp.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
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
                        comp.prev_achieved ? 'bg-green-50' : ''
                      }`}
                    >
                      {comp.prev_standard_time_formatted ? (
                        <div>
                          <span
                            className={`text-sm font-mono tabular-nums ${
                              comp.prev_achieved ? 'text-green-700 font-semibold' : 'text-slate-600'
                            }`}
                          >
                            {comp.prev_standard_time_formatted}
                          </span>
                          {comp.prev_age_group !== 'OPEN' && (
                            <span className="text-xs text-slate-400 ml-1">
                              ({comp.prev_age_group})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                  )}
                  {/* Current age group column (highlighted) */}
                  <td className="px-4 py-3 whitespace-nowrap align-top text-center bg-indigo-50 border-x-2 border-indigo-200">
                    {comp.standard_time_formatted ? (
                      <div>
                        <span className="text-sm font-mono tabular-nums text-slate-900 font-semibold">
                          {comp.standard_time_formatted}
                        </span>
                        {comp.age_group !== 'OPEN' && (
                          <span className="text-xs text-slate-500 ml-1">({comp.age_group})</span>
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
                          <span
                            className={`text-sm font-mono tabular-nums ${
                              comp.next_achieved ? 'text-blue-700 font-semibold' : 'text-slate-600'
                            }`}
                          >
                            {comp.next_standard_time_formatted}
                          </span>
                          {comp.next_age_group !== 'OPEN' && (
                            <span className="text-xs text-slate-400 ml-1">
                              ({comp.next_age_group})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap align-top text-center">
                    {comp.difference_formatted ? (
                      <div>
                        <span
                          className={`text-sm font-mono tabular-nums ${
                            (comp.difference_ms ?? 0) <= 0 ? 'text-green-600' : 'text-slate-600'
                          }`}
                        >
                          {comp.difference_formatted}
                        </span>
                        {comp.difference_percent != null && (
                          <span
                            className={`text-xs ml-1 tabular-nums ${
                              (comp.difference_ms ?? 0) <= 0 ? 'text-green-600' : 'text-slate-500'
                            }`}
                          >
                            ({comp.difference_percent > 0 ? '+' : ''}
                            {comp.difference_percent.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap align-top text-center">
                    <StatusBadge status={comp.status} />
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
