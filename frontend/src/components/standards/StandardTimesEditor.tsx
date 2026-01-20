import { useState } from 'react';
import { StandardTime, StandardTimeInput, AgeGroup } from '@/types/standard';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { parseTimeToMs } from '@/utils/timeFormat';

const EVENTS = [
  { code: '50FR', name: '50 Free' },
  { code: '100FR', name: '100 Free' },
  { code: '200FR', name: '200 Free' },
  { code: '400FR', name: '400 Free' },
  { code: '800FR', name: '800 Free' },
  { code: '1500FR', name: '1500 Free' },
  { code: '50BK', name: '50 Back' },
  { code: '100BK', name: '100 Back' },
  { code: '200BK', name: '200 Back' },
  { code: '50BR', name: '50 Breast' },
  { code: '100BR', name: '100 Breast' },
  { code: '200BR', name: '200 Breast' },
  { code: '50FL', name: '50 Fly' },
  { code: '100FL', name: '100 Fly' },
  { code: '200FL', name: '200 Fly' },
  { code: '200IM', name: '200 IM' },
  { code: '400IM', name: '400 IM' },
];

const AGE_GROUPS: { code: AgeGroup; name: string }[] = [
  { code: '10U', name: '10 & Under' },
  { code: '11-12', name: '11-12' },
  { code: '13-14', name: '13-14' },
  { code: '15-17', name: '15-17' },
  { code: 'OPEN', name: 'Open' },
];

interface StandardTimesEditorProps {
  times: StandardTime[];
  onSave: (times: StandardTimeInput[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function StandardTimesEditor({
  times,
  onSave,
  onCancel,
  isLoading = false,
}: StandardTimesEditorProps) {
  // Build initial state from existing times
  const buildInitialState = () => {
    const state: Record<string, Record<string, string>> = {};
    for (const time of times) {
      if (!state[time.event]) {
        state[time.event] = {};
      }
      state[time.event][time.age_group] = time.time_formatted;
    }
    return state;
  };

  const [timeValues, setTimeValues] =
    useState<Record<string, Record<string, string>>>(buildInitialState);

  const handleTimeChange = (event: string, ageGroup: string, value: string) => {
    setTimeValues((prev) => ({
      ...prev,
      [event]: {
        ...prev[event],
        [ageGroup]: value,
      },
    }));
  };

  const handleSave = () => {
    const result: StandardTimeInput[] = [];

    for (const [event, ageGroups] of Object.entries(timeValues)) {
      for (const [ageGroup, timeStr] of Object.entries(ageGroups)) {
        if (timeStr && timeStr.trim()) {
          const timeMs = parseTimeToMs(timeStr.trim());
          if (timeMs > 0) {
            result.push({
              event,
              age_group: ageGroup as AgeGroup,
              time_ms: timeMs,
            });
          }
        }
      }
    }

    onSave(result);
  };

  const getTimeValue = (event: string, ageGroup: string): string => {
    return timeValues[event]?.[ageGroup] || '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Qualifying Times</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Event
                </th>
                {AGE_GROUPS.map((ag) => (
                  <th
                    key={ag.code}
                    className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    {ag.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {EVENTS.map((event) => (
                <tr key={event.code}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-slate-900">
                    {event.name}
                  </td>
                  {AGE_GROUPS.map((ag) => (
                    <td key={`${event.code}-${ag.code}`} className="px-2 py-1">
                      <input
                        type="text"
                        value={getTimeValue(event.code, ag.code)}
                        onChange={(e) => handleTimeChange(event.code, ag.code, e.target.value)}
                        placeholder="--"
                        className="w-20 px-2 py-1 text-sm text-center border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Enter times in format: 28.45 or 1:05.32. Leave blank for events without a standard.
        </p>

        <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Times'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default StandardTimesEditor;
