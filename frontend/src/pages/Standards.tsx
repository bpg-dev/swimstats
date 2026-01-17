import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

/**
 * Standards page - manage time standards.
 */
export function Standards() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time Standards</h1>
          <p className="text-slate-600 mt-1">
            Manage qualifying time standards to compare your times against.
          </p>
        </div>
        <Button>Add Standard</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Standards</CardTitle>
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">No standards yet</h3>
            <p className="mt-2 text-sm">
              Add time standards like Swimming Canada or Swim Ontario to compare your times.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Standards;
