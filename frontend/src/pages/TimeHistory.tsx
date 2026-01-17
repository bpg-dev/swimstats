import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/**
 * Time History page - view all recorded times.
 */
export function TimeHistory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Time History</h1>
        <p className="text-slate-600 mt-1">
          View all your recorded swim times.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Times</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <p>No times recorded yet.</p>
            <p className="text-sm mt-2">
              Start by adding times from your swim meets.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TimeHistory;
