import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

/**
 * Meets page - list and manage swim meets.
 */
export function Meets() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meets</h1>
          <p className="text-slate-600 mt-1">
            Manage your swim competitions and time trials.
          </p>
        </div>
        <Button>Add Meet</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Meets</CardTitle>
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">No meets yet</h3>
            <p className="mt-2 text-sm">
              Get started by adding your first swim meet or time trial.
            </p>
            <div className="mt-6">
              <Button>Add Your First Meet</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Meets;
