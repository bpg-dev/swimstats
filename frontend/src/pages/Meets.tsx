import { useState } from 'react';
import { Button } from '@/components/ui';
import { MeetList, MeetForm } from '@/components/meets';
import { useCourseType } from '@/stores/courseFilterStore';
import { useAuthStore } from '@/stores/authStore';
import { Meet } from '@/types/meet';

/**
 * Meets page - list and manage swim meets.
 */
export function Meets() {
  const courseType = useCourseType();
  const canWrite = useAuthStore((state) => state.canWrite);
  const [showForm, setShowForm] = useState(false);
  const [editingMeet, setEditingMeet] = useState<Meet | null>(null);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMeet(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMeet(null);
  };

  // Show form for adding/editing
  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <MeetForm
          initialData={editingMeet || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meets</h1>
          <p className="text-slate-600 mt-1">
            Manage your swim competitions and time trials. Click on a meet to view details and
            times.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={!canWrite()}>
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Meet
        </Button>
      </div>

      <div className="max-w-2xl">
        <MeetList
          courseType={courseType}
          limit={50}
          linkToDetails
          emptyMessage="No meets yet. Click 'Add Meet' to get started!"
        />
      </div>
    </div>
  );
}

export default Meets;
