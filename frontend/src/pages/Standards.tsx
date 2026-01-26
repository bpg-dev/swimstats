import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StandardList, StandardForm, StandardImportForm } from '@/components/standards';
import { StandardInput, Gender } from '@/types/standard';
import { useCreateStandard } from '@/hooks/useStandards';
import { useSwimmer } from '@/hooks/useSwimmer';
import { useAuthStore } from '@/stores/authStore';
import { useCourseType } from '@/stores/courseFilterStore';
import { ErrorBanner } from '@/components/ui';

type ViewMode = 'list' | 'create' | 'import';

/**
 * Standards page - manage time standards.
 */
export function Standards() {
  const [mode, setMode] = useState<ViewMode>('list');
  const canWrite = useAuthStore((state) => state.canWrite);
  const courseType = useCourseType();
  const { data: swimmer } = useSwimmer();
  const [genderOverride, setGenderOverride] = useState<Gender | null>(null);
  const createStandard = useCreateStandard();

  // Use override if set, otherwise use swimmer's gender, fallback to female
  const genderFilter: Gender = genderOverride ?? swimmer?.gender ?? 'female';

  const handleCreateStandard = async (input: StandardInput) => {
    try {
      await createStandard.mutateAsync(input);
      setMode('list');
    } catch {
      // Error is handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time Standards</h1>
          <p className="text-slate-600 mt-1">
            Manage qualifying time standards to compare your times against.
          </p>
        </div>
        {mode === 'list' && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setMode('import')} disabled={!canWrite()}>
              Import JSON
            </Button>
            <Button onClick={() => setMode('create')} disabled={!canWrite()}>
              Add Standard
            </Button>
          </div>
        )}
      </div>

      {createStandard.error && (
        <ErrorBanner message={createStandard.error.message || 'Failed to create standard'} />
      )}

      {mode === 'create' && (
        <StandardForm
          onSubmit={handleCreateStandard}
          onCancel={() => setMode('list')}
          isLoading={createStandard.isPending}
        />
      )}

      {mode === 'import' && (
        <StandardImportForm onSuccess={() => setMode('list')} onCancel={() => setMode('list')} />
      )}

      {mode === 'list' && (
        <StandardList
          params={{ course_type: courseType, gender: genderFilter }}
          linkToDetails
          emptyMessage="Add time standards like Swimming Canada or Swim Ontario to compare your times."
          genderFilter={genderFilter}
          onGenderFilterChange={setGenderOverride}
        />
      )}
    </div>
  );
}

export default Standards;
