import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useCourseType } from '@/stores/courseFilterStore';

/**
 * Personal Bests page - view fastest times by event.
 */
export function PersonalBests() {
  const courseType = useCourseType();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Personal Bests</h1>
        <p className="text-slate-600 mt-1">
          Your fastest times in {courseType} ({courseType === '25m' ? 'Short Course' : 'Long Course'}).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Best Times by Event</CardTitle>
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
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">No personal bests yet</h3>
            <p className="mt-2 text-sm">
              Record some swim times to see your personal bests here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PersonalBests;
