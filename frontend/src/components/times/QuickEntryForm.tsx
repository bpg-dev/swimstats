import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { EventSelector } from './EventSelector';
import { MeetSelector } from '@/components/meets/MeetSelector';
import { TimeBatchInput, EventCode, BatchResult } from '@/types/time';
import { CourseType, MeetInput } from '@/types/meet';
import { useCreateBatchTimes } from '@/hooks/useTimes';
import { useCreateMeet } from '@/hooks/useMeets';
import { parseTime } from '@/utils/timeFormat';
import { ApiRequestError } from '@/services/api';

interface TimeEntry {
  id: string;
  event: EventCode | '';
  time_str: string;
  notes: string;
}

export interface QuickEntryFormProps {
  meetId?: string;
  courseType?: CourseType;
  onSuccess?: (result: BatchResult) => void;
  onCancel?: () => void;
}

let entryIdCounter = 0;
const generateId = () => `entry-${++entryIdCounter}`;

export function QuickEntryForm({ 
  meetId: defaultMeetId, 
  courseType,
  onSuccess, 
  onCancel 
}: QuickEntryFormProps) {
  const navigate = useNavigate();
  const [meetId, setMeetId] = useState(defaultMeetId || '');
  const [entries, setEntries] = useState<TimeEntry[]>([
    { id: generateId(), event: '', time_str: '', notes: '' },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newPBs, setNewPBs] = useState<EventCode[]>([]);
  const [savedCount, setSavedCount] = useState(0); // Track number of times saved
  const [showSuccess, setShowSuccess] = useState(false); // Show success state
  
  // Quick add meet state
  const [showQuickMeet, setShowQuickMeet] = useState(false);
  const [quickMeet, setQuickMeet] = useState<MeetInput>({
    name: '',
    city: '',
    country: 'Canada',
    date: new Date().toISOString().split('T')[0],
    course_type: courseType || '25m',
  });
  const [quickMeetError, setQuickMeetError] = useState('');

  const mutation = useCreateBatchTimes();
  const createMeetMutation = useCreateMeet();

  const addEntry = () => {
    setEntries(prev => [...prev, { id: generateId(), event: '', time_str: '', notes: '' }]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const updateEntry = (id: string, field: keyof TimeEntry, value: string) => {
    setEntries(prev => prev.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!meetId) {
      newErrors.meet_id = 'Please select a meet';
    }

    const validEntries = entries.filter(e => e.event || e.time_str);
    if (validEntries.length === 0) {
      newErrors.entries = 'Add at least one time entry';
    }

    // Check for duplicate events in the batch
    const seenEvents = new Set<string>();
    validEntries.forEach((entry) => {
      if (!entry.event) {
        newErrors[`${entry.id}_event`] = 'Select event';
      } else if (seenEvents.has(entry.event)) {
        newErrors[`${entry.id}_event`] = 'Duplicate event';
        newErrors.form = 'Each event can only be entered once per meet';
      } else {
        seenEvents.add(entry.event);
      }
      if (!entry.time_str.trim()) {
        newErrors[`${entry.id}_time`] = 'Enter time';
      } else if (parseTime(entry.time_str) === null) {
        newErrors[`${entry.id}_time`] = 'Invalid format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const validEntries = entries.filter(e => e.event && e.time_str);
    const input: TimeBatchInput = {
      meet_id: meetId,
      times: validEntries.map(entry => ({
        event: entry.event as EventCode,
        time_ms: parseTime(entry.time_str)!,
        notes: entry.notes || undefined,
      })),
    };

    try {
      const result = await mutation.mutateAsync(input);
      setNewPBs(result.new_pbs);
      setSavedCount(result.times.length);
      setShowSuccess(true);
      onSuccess?.(result);
    } catch (error: unknown) {
      if (error instanceof ApiRequestError && error.code === 'DUPLICATE_EVENT') {
        setErrors({ form: 'This event already has a time recorded for this meet. Each event can only be entered once per meet.' });
      } else {
        const message = error instanceof Error ? error.message : 'Failed to save times';
        setErrors({ form: message });
      }
    }
  };

  const reset = () => {
    setEntries([{ id: generateId(), event: '', time_str: '', notes: '' }]);
    setNewPBs([]);
    setSavedCount(0);
    setShowSuccess(false);
    setErrors({});
  };

  const handleViewMeet = () => {
    navigate(`/meets/${meetId}`);
  };

  const handleQuickMeetSubmit = async () => {
    if (!quickMeet.name.trim()) {
      setQuickMeetError('Meet name is required');
      return;
    }
    if (!quickMeet.city.trim()) {
      setQuickMeetError('City is required');
      return;
    }
    
    try {
      const meet = await createMeetMutation.mutateAsync(quickMeet);
      setMeetId(meet.id);
      setShowQuickMeet(false);
      setQuickMeet({
        name: '',
        city: '',
        country: 'Canada',
        date: new Date().toISOString().split('T')[0],
        course_type: courseType || '25m',
      });
      setQuickMeetError('');
      // Clear the meet error if it existed
      setErrors(prev => {
        const { meet_id, ...rest } = prev;
        return rest;
      });
    } catch (error: any) {
      setQuickMeetError(error.message || 'Failed to create meet');
    }
  };

  // Show success state after saving
  if (showSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">
            {newPBs.length > 0 ? '🎉 Times Saved with New PBs!' : '✅ Times Saved Successfully!'}
          </CardTitle>
          <CardDescription>
            {savedCount} time{savedCount !== 1 ? 's' : ''} saved to the meet.
            {newPBs.length > 0 && ` You achieved ${newPBs.length} new personal best${newPBs.length !== 1 ? 's' : ''}!`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {newPBs.length > 0 && (
            <ul className="space-y-2 mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              {newPBs.map(event => (
                <li key={event} className="flex items-center gap-2 text-amber-800">
                  <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{event}</span>
                  <span className="text-xs bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded font-bold">PB</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleViewMeet}>
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Meet
            </Button>
            <Button variant="outline" onClick={reset}>
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add More Times
            </Button>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>Done</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Entry</CardTitle>
        <CardDescription>
          Add multiple times from a meet in one go. All times will be saved together.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.form}
            </div>
          )}

          {!defaultMeetId && (
            <div className="space-y-3">
              {!showQuickMeet ? (
                <>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <MeetSelector
                        name="meet_id"
                        value={meetId}
                        onChange={(e) => setMeetId(e.target.value)}
                        courseType={courseType}
                        error={errors.meet_id}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuickMeet(true)}
                      className="mb-0.5 px-3 py-2 text-sm font-medium text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors whitespace-nowrap"
                    >
                      + New Meet
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-cyan-900">Quick Add Meet</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickMeet(false);
                        setQuickMeetError('');
                      }}
                      className="text-cyan-600 hover:text-cyan-800"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {quickMeetError && (
                    <p className="text-sm text-red-600">{quickMeetError}</p>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Meet Name"
                      placeholder="e.g., Winter Championships"
                      value={quickMeet.name}
                      onChange={(e) => setQuickMeet(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                    <Input
                      label="City"
                      placeholder="e.g., Toronto"
                      value={quickMeet.city}
                      onChange={(e) => setQuickMeet(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Date"
                      type="date"
                      value={quickMeet.date}
                      onChange={(e) => setQuickMeet(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                    <Select
                      label="Course Type"
                      value={quickMeet.course_type}
                      onChange={(e) => setQuickMeet(prev => ({ 
                        ...prev, 
                        course_type: e.target.value as CourseType 
                      }))}
                      options={[
                        { value: '25m', label: '25m (Short Course)' },
                        { value: '50m', label: '50m (Long Course)' },
                      ]}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleQuickMeetSubmit}
                      isLoading={createMeetMutation.isPending}
                    >
                      Create Meet
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowQuickMeet(false);
                        setQuickMeetError('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {errors.entries && (
            <p className="text-sm text-red-600">{errors.entries}</p>
          )}

          <div className="space-y-3">
            {/* Column headers - visible on sm+ screens */}
            <div className="hidden sm:flex gap-3 items-end px-4">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <label className="block text-sm font-medium text-slate-700">Event</label>
                <label className="block text-sm font-medium text-slate-700">Time</label>
                <label className="block text-sm font-medium text-slate-700">Notes</label>
              </div>
              {/* Spacer for delete button column */}
              <div className="w-7" />
            </div>
            
            {entries.map((entry) => (
              <div key={entry.id} className="flex gap-3 items-center p-4 bg-slate-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <EventSelector
                    value={entry.event as EventCode}
                    onChange={(e) => updateEntry(entry.id, 'event', e.target.value)}
                    label="Event"
                    labelClassName="sm:hidden"
                    placeholder="Select event"
                    error={errors[`${entry.id}_event`]}
                  />
                  <Input
                    label="Time"
                    labelClassName="sm:hidden"
                    placeholder="SS.ss or M:SS.ss"
                    value={entry.time_str}
                    onChange={(e) => updateEntry(entry.id, 'time_str', e.target.value)}
                    error={errors[`${entry.id}_time`]}
                  />
                  <Input
                    label="Notes"
                    labelClassName="sm:hidden"
                    placeholder="Optional"
                    value={entry.notes}
                    onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)}
                  />
                </div>
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    aria-label="Remove entry"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addEntry}
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium text-sm"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another Time
          </button>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              type="submit"
              isLoading={mutation.isPending}
            >
              Save All Times ({entries.filter(e => e.event && e.time_str).length})
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default QuickEntryForm;
