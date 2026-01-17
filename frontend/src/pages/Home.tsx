import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useCourseType } from '@/stores/courseFilterStore';

/**
 * Home page - dashboard with quick stats and recent activity.
 */
export function Home() {
  const courseType = useCourseType();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Welcome to SwimStats. Track your swimming progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Current Course
            </CardTitle>
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
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Meets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">—</div>
            <p className="text-sm text-slate-500 mt-1">competitions recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">—</div>
            <p className="text-sm text-slate-500 mt-1">swim times tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Personal Bests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">—</div>
            <p className="text-sm text-slate-500 mt-1">events with PBs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <p>No recent activity yet.</p>
              <p className="text-sm mt-2">Start by adding a meet and recording some times!</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a
                href="/add-times"
                className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="font-medium text-slate-900">Add Times</div>
                <div className="text-sm text-slate-500">Record swim times from a meet</div>
              </a>
              <a
                href="/meets"
                className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="font-medium text-slate-900">Create Meet</div>
                <div className="text-sm text-slate-500">Add a new competition</div>
              </a>
              <a
                href="/personal-bests"
                className="block p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="font-medium text-slate-900">View Personal Bests</div>
                <div className="text-sm text-slate-500">See your fastest times</div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home;
