import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/**
 * Add Times page - quick entry form for recording swim times.
 */
export function AddTimes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Times</h1>
        <p className="text-slate-600 mt-1">
          Record swim times from a competition.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <p>Time entry form coming soon.</p>
            <p className="text-sm mt-2">
              You&apos;ll be able to quickly enter multiple times from a meet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddTimes;
