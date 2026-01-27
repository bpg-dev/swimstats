import { useState } from 'react';
import { Standard, StandardInput, Gender } from '@/types/standard';
import { CourseType } from '@/types/meet';
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export interface StandardFormProps {
  standard?: Standard;
  onSubmit: (input: StandardInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function StandardForm({
  standard,
  onSubmit,
  onCancel,
  isLoading = false,
}: StandardFormProps) {
  // State is initialized from `standard` prop. If parent needs to reset
  // the form when standard changes, they should use a key prop.
  const [name, setName] = useState(standard?.name || '');
  const [description, setDescription] = useState(standard?.description || '');
  const [courseType, setCourseType] = useState<CourseType>(standard?.course_type || '25m');
  const [gender, setGender] = useState<Gender>(standard?.gender || 'female');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      course_type: courseType,
      gender,
    });
  };

  const isValid = name.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{standard ? 'Edit Standard' : 'Create Standard'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="standard-name"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Swimming Canada Provincial 2026"
            required
            maxLength={255}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this standard"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              id="standard-course-type"
              label="Course Type"
              value={courseType}
              onChange={(e) => setCourseType(e.target.value as CourseType)}
              options={[
                { value: '25m', label: 'Short Course (25m)' },
                { value: '50m', label: 'Long Course (50m)' },
              ]}
            />

            <Select
              id="standard-gender"
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              options={[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading ? 'Saving...' : standard ? 'Update Standard' : 'Create Standard'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default StandardForm;
