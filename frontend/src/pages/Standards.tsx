import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StandardList, StandardForm } from '@/components/standards';
import { StandardInput } from '@/types/standard';
import { useCreateStandard } from '@/hooks/useStandards';
import { ErrorBanner } from '@/components/ui';

/**
 * Standards page - manage time standards.
 */
export function Standards() {
  const [showForm, setShowForm] = useState(false);
  const createStandard = useCreateStandard();

  const handleCreateStandard = async (input: StandardInput) => {
    try {
      await createStandard.mutateAsync(input);
      setShowForm(false);
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
        {!showForm && <Button onClick={() => setShowForm(true)}>Add Standard</Button>}
      </div>

      {createStandard.error && (
        <ErrorBanner message={createStandard.error.message || 'Failed to create standard'} />
      )}

      {showForm ? (
        <StandardForm
          onSubmit={handleCreateStandard}
          onCancel={() => setShowForm(false)}
          isLoading={createStandard.isPending}
        />
      ) : (
        <StandardList
          linkToDetails
          emptyMessage="Add time standards like Swimming Canada or Swim Ontario to compare your times."
        />
      )}
    </div>
  );
}

export default Standards;
