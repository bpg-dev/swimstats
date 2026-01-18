import { useCourseType } from '@/stores/courseFilterStore';
import { usePersonalBests } from '@/hooks/usePersonalBests';
import { PersonalBestGrid } from '@/components/comparison';
import { Loading, ErrorBanner } from '@/components/ui';

/**
 * Personal Bests page - view fastest times by event.
 */
export function PersonalBests() {
  const courseType = useCourseType();
  const { data, isLoading, error } = usePersonalBests(courseType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Personal Bests
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Your fastest times in {courseType} ({courseType === '25m' ? 'Short Course' : 'Long Course'}).
        </p>
      </div>

      {error && (
        <ErrorBanner
          message="Failed to load personal bests"
          onRetry={() => window.location.reload()}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : data ? (
        <PersonalBestGrid personalBests={data.personal_bests} />
      ) : null}
    </div>
  );
}

export default PersonalBests;
