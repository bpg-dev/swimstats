import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Loading, ErrorBanner } from '@/components/ui';
import { StandardSelector, ComparisonTable } from '@/components/comparison';
import { useComparison } from '@/hooks/useComparison';
import { useSwimmer } from '@/hooks/useSwimmer';
import { useCourseType } from '@/stores/courseFilterStore';

/**
 * Compare page - compare personal bests against time standards.
 */
export function Compare() {
  const [searchParams] = useSearchParams();
  // Initialize from URL param if present (lazy initialization avoids useEffect)
  const [selectedStandardId, setSelectedStandardId] = useState<string>(
    () => searchParams.get('standard_id') || ''
  );
  const [showAllEvents, setShowAllEvents] = useState(false);
  const courseType = useCourseType();
  const { data: swimmer } = useSwimmer();

  // Track the course type to reset selection when it changes
  const [prevCourseType, setPrevCourseType] = useState(courseType);
  if (courseType !== prevCourseType) {
    setSelectedStandardId('');
    setPrevCourseType(courseType);
  }

  const {
    data: comparison,
    isLoading,
    error,
  } = useComparison(
    selectedStandardId
      ? {
          standard_id: selectedStandardId,
          course_type: courseType || '25m',
        }
      : null
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compare</h1>
        <p className="text-slate-600 mt-1">Compare your personal bests against time standards.</p>
      </div>

      {/* Standard selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Standard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <StandardSelector
              value={selectedStandardId}
              onChange={setSelectedStandardId}
              gender={swimmer?.gender as 'female' | 'male' | undefined}
            />
          </div>
          {!selectedStandardId && (
            <p className="text-sm text-slate-500 mt-2">
              Choose a time standard to compare your times against.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent>
            <Loading text="Loading comparison..." />
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && <ErrorBanner message={error.message || 'Failed to load comparison'} />}

      {/* Comparison results */}
      {comparison && (
        <>
          {/* Comparison table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{comparison.standard_name}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  {comparison.swimmer_name}
                  {comparison.swimmer_age_group !== 'OPEN' && (
                    <> ({comparison.swimmer_age_group})</>
                  )}
                  {' · '}
                  {comparison.course_type === '25m' ? 'Short Course' : 'Long Course'}
                  {' · '}
                  <span className="text-green-600">{comparison.summary.achieved} achieved</span>
                  {comparison.summary.almost > 0 && (
                    <>
                      , <span className="text-amber-600">{comparison.summary.almost} almost</span>
                    </>
                  )}
                  {comparison.summary.not_achieved > 0 && (
                    <>
                      ,{' '}
                      <span className="text-slate-500">
                        {comparison.summary.not_achieved} not yet
                      </span>
                    </>
                  )}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm font-normal">
                <input
                  type="checkbox"
                  checked={showAllEvents}
                  onChange={(e) => setShowAllEvents(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Show events without times
              </label>
            </CardHeader>
            <CardContent className="p-0">
              <ComparisonTable comparisons={comparison.comparisons} showNoTime={showAllEvents} />
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty state when no standard selected */}
      {!selectedStandardId && !isLoading && (
        <Card>
          <CardContent>
            <div className="text-center py-12 text-slate-500">
              <p>Select a time standard above to see how your times compare.</p>
              <p className="text-sm mt-2">
                You&apos;ll see which events you&apos;ve achieved and how close you are to others.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Compare;
