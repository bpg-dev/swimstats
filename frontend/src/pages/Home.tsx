import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { SwimmerProfile, SwimmerSetupForm } from '@/components/swimmer';
import { MeetList } from '@/components/meets';
import { useCourseType } from '@/stores/courseFilterStore';
import { useSwimmer } from '@/hooks/useSwimmer';
import { useMeets } from '@/hooks/useMeets';
import { useTimes } from '@/hooks/useTimes';

/**
 * Home page - dashboard with quick stats and recent activity.
 */
export function Home() {
  const courseType = useCourseType();
  const navigate = useNavigate();

  const { data: swimmer, isLoading: swimmerLoading, error: swimmerError } = useSwimmer();
  const { data: meetsData, isLoading: meetsLoading } = useMeets({
    course_type: courseType,
    limit: 5,
  });
  const { data: timesData, isLoading: timesLoading } = useTimes({
    course_type: courseType,
    limit: 10,
  });

  // Show setup form if no swimmer profile exists
  if (swimmerLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    );
  }

  if (
    swimmerError &&
    (swimmerError as { response?: { status?: number } })?.response?.status === 404
  ) {
    return (
      <div className="max-w-xl mx-auto">
        <SwimmerSetupForm onSuccess={() => window.location.reload()} />
      </div>
    );
  }

  const totalMeets = meetsData?.total || 0;
  const totalTimes = timesData?.total || 0;

  return (
    <div className="space-y-6">
      {/* Swimmer Profile Header */}
      {swimmer && <SwimmerProfile swimmer={swimmer} compact onEdit={() => navigate('/settings')} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Current Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{courseType}</div>
            <p className="text-sm text-slate-500 mt-1">
              {courseType === '25m' ? 'Short Course' : 'Long Course'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Total Meets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {meetsLoading ? '...' : totalMeets}
            </div>
            <p className="text-sm text-slate-500 mt-1">competitions recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Total Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {timesLoading ? '...' : totalTimes}
            </div>
            <p className="text-sm text-slate-500 mt-1">swim times tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Age Group</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {swimmer?.current_age_group || '—'}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {swimmer ? `${swimmer.current_age} years old` : 'as of Dec 31'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Meets */}
        <MeetList
          courseType={courseType}
          limit={5}
          onSelectMeet={(meet) => navigate(`/meets?id=${meet.id}`)}
          emptyMessage="No meets yet. Add your first competition!"
        />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link
                to="/personal-bests"
                className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Personal Bests</div>
                    <div className="text-sm text-slate-500">See your fastest times</div>
                  </div>
                </div>
              </Link>
              <Link
                to="/add-times"
                className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-cyan-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Add Times</div>
                    <div className="text-sm text-slate-500">Record swim times from a meet</div>
                  </div>
                </div>
              </Link>
              <Link
                to="/meets"
                className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Manage Meets</div>
                    <div className="text-sm text-slate-500">Add or edit competitions</div>
                  </div>
                </div>
              </Link>
              <Link
                to="/all-times"
                className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">All Times</div>
                    <div className="text-sm text-slate-500">Browse your time history</div>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home;
