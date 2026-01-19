import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, Button, Loading, ErrorBanner } from '@/components/ui';
import { MeetTimesList } from '@/components/meets/MeetTimesList';
import { useMeet, useDeleteMeet } from '@/hooks/useMeets';
import { formatDateRange } from '@/utils/timeFormat';

/**
 * Meet details page - shows meet info and all recorded times.
 */
export function MeetDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: meet, isLoading, error, refetch } = useMeet(id || '');
  const deleteMutation = useDeleteMeet();

  const handleDelete = async () => {
    if (meet && window.confirm(`Delete "${meet.name}"? This will also delete all times from this meet.`)) {
      await deleteMutation.mutateAsync(meet.id);
      navigate('/meets');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  if (error || !meet) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorBanner
          message={error?.message || "Meet not found"}
          onRetry={() => refetch()}
        />
        <div className="mt-4">
          <Link
            to="/meets"
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            ← Back to Meets
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header with back link */}
      <div className="flex items-center gap-4">
        <Link
          to="/meets"
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Back to Meets"
        >
          <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{meet.name}</h1>
          <p className="text-slate-600">
            {meet.city}, {meet.country}
          </p>
        </div>
      </div>

      {/* Meet Info Card */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-slate-700">{formatDateRange(meet.start_date, meet.end_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  meet.course_type === '25m'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {meet.course_type === '25m' ? '25m Short Course' : '50m Long Course'}
              </span>
            </div>
            {meet.time_count !== undefined && (
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-slate-700">
                  {meet.time_count} time{meet.time_count !== 1 ? 's' : ''} recorded
                </span>
              </div>
            )}
            <div className="flex-1" />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => navigate(`/add-times?meet_id=${meet.id}`)}
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Times
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/meets?id=${meet.id}`)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Times List */}
      <Card>
        <CardContent>
          <MeetTimesList meetId={meet.id} courseType={meet.course_type} />
        </CardContent>
      </Card>
    </div>
  );
}

export default MeetDetails;
