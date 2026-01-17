import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/**
 * Progress page - view progress charts for events.
 */
export function Progress() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Progress</h1>
        <p className="text-slate-600 mt-1">
          Track your improvement over time with progress charts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress Charts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
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
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">No data yet</h3>
            <p className="mt-2 text-sm">
              Record times from multiple meets to see your progress over time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Progress;
