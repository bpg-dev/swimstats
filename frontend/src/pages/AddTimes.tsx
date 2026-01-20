import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { TimeEntryForm, QuickEntryForm } from '@/components/times';
import { useCourseType } from '@/stores/courseFilterStore';

type EntryMode = 'quick' | 'single';

/**
 * Add Times page - quick entry form for recording swim times.
 */
export function AddTimes() {
  const courseType = useCourseType();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const meetId = searchParams.get('meet_id') || undefined;
  const [mode, setMode] = useState<EntryMode>('quick');

  const handleSuccess = () => {
    // Stay on page for more entries, or navigate based on user preference
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Times</h1>
          <p className="text-slate-600 mt-1">Record swim times from a competition.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'quick' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setMode('quick')}
          >
            Quick Entry
          </Button>
          <Button
            variant={mode === 'single' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setMode('single')}
          >
            Single Entry
          </Button>
        </div>
      </div>

      <div className="max-w-3xl">
        {mode === 'quick' ? (
          <QuickEntryForm
            meetId={meetId}
            courseType={courseType}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : (
          <TimeEntryForm
            meetId={meetId}
            courseType={courseType}
            onSuccess={() => {
              // Reset form for next entry by reloading
              window.location.reload();
            }}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}

export default AddTimes;
