import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { TimeEntryForm, QuickEntryForm } from '@/components/times';
import { useCourseType } from '@/stores/courseFilterStore';
import { useAuthStore } from '@/stores/authStore';

type EntryMode = 'quick' | 'single';

/**
 * Add Times page - quick entry form for recording swim times.
 */
export function AddTimes() {
  const courseType = useCourseType();
  const navigate = useNavigate();
  const canWrite = useAuthStore((state) => state.canWrite);
  const [searchParams] = useSearchParams();

  const meetId = searchParams.get('meet_id') || undefined;
  const [mode, setMode] = useState<EntryMode>('quick');

  // Show access denied for view-only users
  if (!canWrite()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Add Times</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">View Only Access</h2>
            <p className="mt-2 text-slate-600">You do not have permission to add times.</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
