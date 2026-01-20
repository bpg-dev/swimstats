import { Select } from '@/components/ui';
import { useStandards } from '@/hooks/useStandards';
import { useCourseType } from '@/stores/courseFilterStore';

interface StandardSelectorProps {
  value: string;
  onChange: (standardId: string) => void;
  gender?: 'female' | 'male';
}

export function StandardSelector({ value, onChange, gender }: StandardSelectorProps) {
  const courseType = useCourseType();
  const { data, isLoading } = useStandards({
    course_type: courseType || undefined,
    gender,
  });

  const options = [
    { value: '', label: 'Select a standard...' },
    ...(data?.standards || []).map((s) => ({
      value: s.id,
      label: s.name,
    })),
  ];

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      disabled={isLoading}
    />
  );
}
