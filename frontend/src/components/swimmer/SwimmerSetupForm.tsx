import { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui';
import { SwimmerInput, Swimmer } from '@/types/swimmer';
import { useCreateOrUpdateSwimmer } from '@/hooks/useSwimmer';

export interface SwimmerSetupFormProps {
  initialData?: Swimmer;
  onSuccess?: (swimmer: Swimmer) => void;
  onCancel?: () => void;
}

export function SwimmerSetupForm({ initialData, onSuccess, onCancel }: SwimmerSetupFormProps) {
  const [formData, setFormData] = useState<SwimmerInput>({
    name: initialData?.name || '',
    birth_date: initialData?.birth_date || '',
    gender: initialData?.gender || 'female',
    threshold_percent: initialData?.threshold_percent ?? 3.0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SwimmerInput, string>>>({});

  const mutation = useCreateOrUpdateSwimmer();

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SwimmerInput, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }

    if (!formData.birth_date) {
      newErrors.birth_date = 'Birth date is required';
    } else {
      const birthDate = new Date(formData.birth_date);
      const now = new Date();
      const age = now.getFullYear() - birthDate.getFullYear();
      if (birthDate > now) {
        newErrors.birth_date = 'Birth date cannot be in the future';
      } else if (age < 4 || age > 25) {
        newErrors.birth_date = 'Birth date should result in age between 4 and 25';
      }
    }

    if (formData.threshold_percent !== undefined) {
      if (formData.threshold_percent < 0 || formData.threshold_percent > 100) {
        newErrors.threshold_percent = 'Threshold must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const swimmer = await mutation.mutateAsync(formData);
      onSuccess?.(swimmer);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save swimmer profile';
      setErrors({ name: message });
    }
  };

  const isEditing = !!initialData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Swimmer Profile' : 'Welcome! Set Up Your Profile'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update your swimmer information below.'
            : "Enter the swimmer's information to get started tracking their progress."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Swimmer Name"
            name="name"
            placeholder="Enter swimmer's name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            required
          />

          <Input
            label="Birth Date"
            name="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData((prev) => ({ ...prev, birth_date: e.target.value }))}
            error={errors.birth_date}
            hint="Age is calculated as of December 31st per Swimming Canada rules"
            required
          />

          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                gender: e.target.value as 'male' | 'female',
              }))
            }
            options={[
              { value: 'female', label: 'Female' },
              { value: 'male', label: 'Male' },
            ]}
            required
          />

          <Input
            label={'"Almost There" Threshold (%)'}
            name="threshold_percent"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={formData.threshold_percent?.toString() ?? '3'}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                threshold_percent: e.target.value ? parseFloat(e.target.value) : 3.0,
              }))
            }
            error={errors.threshold_percent}
            hint="Times within this percentage of a standard will be marked as 'Almost Achieved'. Default: 3%"
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={mutation.isPending}>
              {isEditing ? 'Save Changes' : 'Create Profile'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default SwimmerSetupForm;
