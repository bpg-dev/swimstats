import { useState } from 'react';
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { MeetInput, Meet, CourseType } from '@/types/meet';
import { useCreateMeet, useUpdateMeet } from '@/hooks/useMeets';

export interface MeetFormProps {
  initialData?: Meet;
  onSuccess?: (meet: Meet) => void;
  onCancel?: () => void;
}

export function MeetForm({ initialData, onSuccess, onCancel }: MeetFormProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<MeetInput>({
    name: initialData?.name || '',
    city: initialData?.city || '',
    country: initialData?.country || 'Canada',
    start_date: initialData?.start_date || today,
    end_date: initialData?.end_date || initialData?.start_date || today,
    course_type: initialData?.course_type || '25m',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateMeet();
  const updateMutation = useUpdateMeet();

  const isEditing = !!initialData;
  const isPending = createMutation.isPending || updateMutation.isPending;
  
  // Check if it's a multi-day meet
  const isMultiDay = formData.start_date !== formData.end_date;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Meet name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (formData.city.length > 255) {
      newErrors.city = 'City must be 255 characters or less';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (formData.end_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'End date cannot be before start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Ensure end_date is always set (for single-day meets, it equals start_date)
    const input: MeetInput = {
      ...formData,
      end_date: formData.end_date || formData.start_date,
    };

    try {
      let meet: Meet;
      if (isEditing) {
        meet = await updateMutation.mutateAsync({ id: initialData.id, input });
      } else {
        meet = await createMutation.mutateAsync(input);
      }
      onSuccess?.(meet);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save meet';
      setErrors({ form: message });
    }
  };

  // When start_date changes, update end_date if it's before the new start_date
  const handleStartDateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      start_date: value,
      // If end_date is before new start_date, update it to match start_date
      end_date: prev.end_date && prev.end_date < value ? value : prev.end_date,
    }));
    if (errors.start_date) setErrors(prev => ({ ...prev, start_date: '' }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Meet' : 'Add New Meet'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.form}
            </div>
          )}

          <Input
            label="Meet Name"
            name="name"
            placeholder="e.g., Ontario Championships 2026"
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            error={errors.name}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              placeholder="e.g., Toronto"
              value={formData.city}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, city: e.target.value }));
                if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
              }}
              error={errors.city}
              required
            />

            <Input
              label="Country"
              name="country"
              placeholder="e.g., Canada"
              value={formData.country || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleStartDateChange(e.target.value)}
              error={errors.start_date}
              required
            />

            <Input
              label="End Date"
              name="end_date"
              type="date"
              value={formData.end_date || formData.start_date}
              min={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              error={errors.end_date}
              hint={!isMultiDay ? 'Same as start date for single-day meets' : undefined}
            />
          </div>

          <Select
            label="Course Type"
            name="course_type"
            value={formData.course_type}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              course_type: e.target.value as CourseType 
            }))}
            options={[
              { value: '25m', label: '25m (Short Course)' },
              { value: '50m', label: '50m (Long Course)' },
            ]}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              isLoading={isPending}
            >
              {isEditing ? 'Save Changes' : 'Add Meet'}
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

export default MeetForm;
