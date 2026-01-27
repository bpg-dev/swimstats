import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useStandard,
  useUpdateStandard,
  useDeleteStandard,
  useSetStandardTimes,
} from '@/hooks/useStandards';
import { StandardForm, StandardTimesEditor } from '@/components/standards';
import { StandardInput, StandardTimeInput, AgeGroup } from '@/types/standard';
import { useAuthStore } from '@/stores/authStore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Loading,
  ErrorBanner,
} from '@/components/ui';

const EVENTS = [
  { code: '50FR', name: '50 Free' },
  { code: '100FR', name: '100 Free' },
  { code: '200FR', name: '200 Free' },
  { code: '400FR', name: '400 Free' },
  { code: '800FR', name: '800 Free' },
  { code: '1500FR', name: '1500 Free' },
  { code: '50BK', name: '50 Back' },
  { code: '100BK', name: '100 Back' },
  { code: '200BK', name: '200 Back' },
  { code: '50BR', name: '50 Breast' },
  { code: '100BR', name: '100 Breast' },
  { code: '200BR', name: '200 Breast' },
  { code: '50FL', name: '50 Fly' },
  { code: '100FL', name: '100 Fly' },
  { code: '200FL', name: '200 Fly' },
  { code: '200IM', name: '200 IM' },
  { code: '400IM', name: '400 IM' },
];

const AGE_GROUPS: { code: AgeGroup; name: string }[] = [
  { code: '10U', name: '10U' },
  { code: '11-12', name: '11-12' },
  { code: '13-14', name: '13-14' },
  { code: '15-17', name: '15-17' },
  { code: 'OPEN', name: 'Open' },
];

type ViewMode = 'view' | 'edit' | 'edit-times';

export function StandardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canWrite = useAuthStore((state) => state.canWrite);
  const [mode, setMode] = useState<ViewMode>('view');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: standard, isLoading, error } = useStandard(id || '');
  const updateStandard = useUpdateStandard();
  const deleteStandard = useDeleteStandard();
  const setTimes = useSetStandardTimes();

  if (isLoading) {
    return <Loading className="py-12" />;
  }

  if (error || !standard) {
    return (
      <div className="space-y-4">
        <ErrorBanner message="Failed to load standard" />
        <Link to="/standards" className="text-blue-600 hover:text-blue-700">
          &larr; Back to Standards
        </Link>
      </div>
    );
  }

  const handleUpdate = async (input: StandardInput) => {
    try {
      await updateStandard.mutateAsync({ id: standard.id, input });
      setMode('view');
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStandard.mutateAsync(standard.id);
      navigate('/standards');
    } catch {
      // Error handled by mutation
    }
  };

  const handleSaveTimes = async (times: StandardTimeInput[]) => {
    try {
      await setTimes.mutateAsync({ id: standard.id, times });
      setMode('view');
    } catch {
      // Error handled by mutation
    }
  };

  // Build a lookup map for times
  const timesMap: Record<string, Record<string, string>> = {};
  for (const time of standard.times || []) {
    if (!timesMap[time.event]) {
      timesMap[time.event] = {};
    }
    timesMap[time.event][time.age_group] = time.time_formatted;
  }

  const getTime = (event: string, ageGroup: string): string => {
    return timesMap[event]?.[ageGroup] || '-';
  };

  if (mode === 'edit') {
    return (
      <div className="space-y-4">
        <Link to="/standards" className="text-blue-600 hover:text-blue-700">
          &larr; Back to Standards
        </Link>
        {updateStandard.error && (
          <ErrorBanner message={updateStandard.error.message || 'Failed to update standard'} />
        )}
        <StandardForm
          standard={standard}
          onSubmit={handleUpdate}
          onCancel={() => setMode('view')}
          isLoading={updateStandard.isPending}
        />
      </div>
    );
  }

  if (mode === 'edit-times') {
    return (
      <div className="space-y-4">
        <Link to="/standards" className="text-blue-600 hover:text-blue-700">
          &larr; Back to Standards
        </Link>
        {setTimes.error && (
          <ErrorBanner message={setTimes.error.message || 'Failed to save times'} />
        )}
        <StandardTimesEditor
          times={standard.times || []}
          onSave={handleSaveTimes}
          onCancel={() => setMode('view')}
          isLoading={setTimes.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/standards" className="text-blue-600 hover:text-blue-700">
          &larr; Back to Standards
        </Link>
      </div>

      {deleteStandard.error && (
        <ErrorBanner message={deleteStandard.error.message || 'Failed to delete standard'} />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{standard.name}</CardTitle>
              {standard.description && (
                <p className="mt-1 text-sm text-slate-500">{standard.description}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    standard.course_type === '25m'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {standard.course_type}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    standard.gender === 'female'
                      ? 'bg-pink-100 text-pink-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {standard.gender === 'female' ? 'Female' : 'Male'}
                </span>
                {standard.is_preloaded && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                    Preloaded
                  </span>
                )}
              </div>
            </div>
            {!standard.is_preloaded && (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMode('edit')}
                  disabled={!canWrite()}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700"
                  disabled={!canWrite()}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-800">
              Are you sure you want to delete this standard? This action cannot be undone.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteStandard.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                disabled={deleteStandard.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteStandard.isPending ? 'Deleting...' : 'Delete Standard'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Times table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Qualifying Times</CardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMode('edit-times')}
              disabled={!canWrite()}
            >
              Edit Times
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(standard.times || []).length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No qualifying times have been added yet.</p>
              <Button className="mt-4" onClick={() => setMode('edit-times')} disabled={!canWrite()}>
                Add Times
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Event
                    </th>
                    {AGE_GROUPS.map((ag) => (
                      <th
                        key={ag.code}
                        className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        {ag.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {EVENTS.map((event) => {
                    // Only show events that have at least one time
                    const hasTime = AGE_GROUPS.some((ag) => timesMap[event.code]?.[ag.code]);
                    if (!hasTime) return null;

                    return (
                      <tr key={event.code}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-slate-900">
                          {event.name}
                        </td>
                        {AGE_GROUPS.map((ag) => (
                          <td
                            key={`${event.code}-${ag.code}`}
                            className="px-3 py-2 whitespace-nowrap text-sm text-center text-slate-600"
                          >
                            {getTime(event.code, ag.code)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default StandardDetail;
