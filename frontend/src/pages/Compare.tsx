import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Loading, ErrorBanner } from '@/components/ui';
import {
  StandardSelector,
  ComparisonTable,
  ComparisonSummary,
} from '@/components/comparison';
import { useComparison } from '@/hooks/useComparison';
import { useSwimmer } from '@/hooks/useSwimmer';
import { useCourseType } from '@/stores/courseFilterStore';

/**
 * Compare page - compare personal bests against time standards.
 */
export function Compare() {
  const [searchParams] = useSearchParams();
  const [selectedStandardId, setSelectedStandardId] = useState<string>('');
  const [showAllEvents, setShowAllEvents] = useState(false);
  const courseType = useCourseType();
  const { data: swimmer } = useSwimmer();

  // Pre-select standard from query parameter if provided
  useEffect(() => {
    const standardIdParam = searchParams.get('standard_id');
    if (standardIdParam && !selectedStandardId) {
      setSelectedStandardId(standardIdParam);
    }
  }, [searchParams, selectedStandardId]);

  const { data: comparison, isLoading, error } = useComparison(
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
        <p className="text-slate-600 mt-1">
          Compare your personal bests against time standards.
        </p>
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
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary: {comparison.standard_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparisonSummary
                summary={comparison.summary}
                thresholdPercent={comparison.threshold_percent}
              />
              <div className="mt-4 text-sm text-slate-500">
                Comparing {comparison.swimmer_name}'s times
                {comparison.swimmer_age_group !== 'OPEN' && (
                  <> (age group: {comparison.swimmer_age_group})</>
                )}{' '}
                against {comparison.standard_name} for{' '}
                {comparison.course_type === '25m' ? 'Short Course' : 'Long Course'}.
              </div>
            </CardContent>
          </Card>

          {/* Detailed comparison table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Event Details</CardTitle>
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
              <ComparisonTable
                comparisons={comparison.comparisons}
                showNoTime={showAllEvents}
              />
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
                You&apos;ll see which events you&apos;ve achieved and how close you are to
                others.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Compare;
