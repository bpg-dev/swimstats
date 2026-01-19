import { useState, useMemo } from 'react';
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { EventSelector } from './EventSelector';
import { MeetSelector } from '@/components/meets/MeetSelector';
import { TimeInput, TimeRecord, EventCode } from '@/types/time';
import { CourseType } from '@/types/meet';
import { useCreateTime, useUpdateTime, useTimes } from '@/hooks/useTimes';
import { useMeets } from '@/hooks/useMeets';
import { parseTime, formatTime, getDateRange } from '@/utils/timeFormat';
import { ApiRequestError } from '@/services/api';

export interface TimeEntryFormProps {
  initialData?: TimeRecord;
  meetId?: string;
  courseType?: CourseType;
  onSuccess?: (time: TimeRecord) => void;
  onCancel?: () => void;
}

export function TimeEntryForm({ 
  initialData, 
  meetId: defaultMeetId, 
  courseType,
  onSuccess, 
  onCancel 
}: TimeEntryFormProps) {
  const [formData, setFormData] = useState({
    meet_id: initialData?.meet_id || defaultMeetId || '',
    event: initialData?.event || '' as EventCode | '',
    time_str: initialData ? formatTime(initialData.time_ms) : '',
    event_date: initialData?.event_date || '',
    notes: initialData?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateTime();
  const updateMutation = useUpdateTime();
  
  // Fetch existing times for the selected meet
  const { data: existingTimesData } = useTimes(
    formData.meet_id ? { meet_id: formData.meet_id, limit: 100 } : undefined
  );

  // Fetch meets to get the selected meet's date range
  const { data: meetsData } = useMeets({ course_type: courseType, limit: 100 });
  
  // Get selected meet's info
  const selectedMeet = useMemo(() => {
    if (!formData.meet_id || !meetsData?.meets) return null;
    return meetsData.meets.find(m => m.id === formData.meet_id) || null;
  }, [formData.meet_id, meetsData]);
  
  // Check if selected meet is multi-day
  const isMultiDayMeet = useMemo(() => {
    return selectedMeet ? selectedMeet.start_date !== selectedMeet.end_date : false;
  }, [selectedMeet]);
  
  // Get available dates for the meet
  const availableDates = useMemo(() => {
    if (!selectedMeet) return [];
    return getDateRange(selectedMeet.start_date, selectedMeet.end_date);
  }, [selectedMeet]);
  
  // Compute events to exclude (already in meet, but allow current event when editing)
  const excludedEvents = useMemo(() => {
    if (!existingTimesData?.times) return [];
    
    const excluded: EventCode[] = [];
    existingTimesData.times.forEach(time => {
      // When editing, don't exclude the event we're editing
      if (initialData && time.id === initialData.id) return;
      if (!excluded.includes(time.event)) {
        excluded.push(time.event);
      }
    });
    return excluded;
  }, [existingTimesData, initialData]);

  const isEditing = !!initialData;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.meet_id) {
      newErrors.meet_id = 'Please select a meet';
    }

    if (!formData.event) {
      newErrors.event = 'Please select an event';
    }

    if (!formData.time_str.trim()) {
      newErrors.time_str = 'Time is required';
    } else {
      const timeMs = parseTime(formData.time_str);
      if (timeMs === null) {
        newErrors.time_str = 'Invalid time format. Use SS.ss or M:SS.ss';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const timeMs = parseTime(formData.time_str)!;
    const input: TimeInput = {
      meet_id: formData.meet_id,
      event: formData.event as EventCode,
      time_ms: timeMs,
      event_date: formData.event_date || undefined,
      notes: formData.notes || undefined,
    };

    try {
      let time: TimeRecord;
      if (isEditing) {
        time = await updateMutation.mutateAsync({ id: initialData.id, input });
      } else {
        time = await createMutation.mutateAsync(input);
      }
      onSuccess?.(time);
    } catch (error: unknown) {
      if (error instanceof ApiRequestError && error.code === 'DUPLICATE_EVENT') {
        setErrors({ form: 'This event already has a time recorded for this meet. Each event can only be entered once per meet.' });
      } else {
        const message = error instanceof Error ? error.message : 'Failed to save time';
        setErrors({ form: message });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Time' : 'Add Time'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.form}
            </div>
          )}

          {!defaultMeetId && (
            <MeetSelector
              name="meet_id"
              value={formData.meet_id}
              onChange={(e) => setFormData(prev => ({ ...prev, meet_id: e.target.value, event_date: '' }))}
              courseType={courseType}
              error={errors.meet_id}
              required
            />
          )}

          <EventSelector
            name="event"
            value={formData.event as EventCode}
            onChange={(e) => setFormData(prev => ({ ...prev, event: e.target.value as EventCode }))}
            groupByStroke
            error={errors.event}
            excludeEvents={excludedEvents}
            required
          />

          {isMultiDayMeet && (
            <Select
              label="Event Date"
              name="event_date"
              value={formData.event_date}
              onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
              placeholder="Select date (optional)"
              options={availableDates.map(date => ({
                value: date,
                label: new Date(date + 'T00:00:00').toLocaleDateString('en-CA', { 
                  weekday: 'long',
                  month: 'short', 
                  day: 'numeric' 
                }),
              }))}
              hint="Which day of the meet was this event swum?"
            />
          )}

          <Input
            label="Time"
            name="time_str"
            placeholder="e.g., 28.45 or 1:05.32"
            value={formData.time_str}
            onChange={(e) => setFormData(prev => ({ ...prev, time_str: e.target.value }))}
            error={errors.time_str}
            hint="Format: SS.ss or M:SS.ss"
            required
          />

          <Input
            label="Notes (optional)"
            name="notes"
            placeholder="e.g., Heat time, Finals, PB attempt"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              isLoading={isPending}
            >
              {isEditing ? 'Save Changes' : 'Add Time'}
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

export default TimeEntryForm;
