import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/**
 * Compare page - compare personal bests against standards.
 */
export function Compare() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compare</h1>
        <p className="text-slate-600 mt-1">
          Compare your personal bests against time standards.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparison Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <p>Select a time standard to compare your personal bests.</p>
            <p className="text-sm mt-2">
              You&apos;ll see which events you&apos;ve achieved and how close you are to others.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Compare;
