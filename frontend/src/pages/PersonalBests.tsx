import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useCourseType } from '@/stores/courseFilterStore';
import { usePersonalBests } from '@/hooks/usePersonalBests';
import { useSwimmer } from '@/hooks/useSwimmer';
import { useStandards, standardKeys } from '@/hooks/useStandards';
import { standardService } from '@/services/standards';
import { PersonalBestGrid } from '@/components/comparison';
import { AchievedStandard } from '@/components/comparison/PersonalBestCard';
import { Loading, ErrorBanner } from '@/components/ui';

/**
 * Personal Bests page - view fastest times by event.
 */
export function PersonalBests() {
  const courseType = useCourseType();
  const { data: pbData, isLoading: pbLoading, error: pbError } = usePersonalBests(courseType);
  const { data: swimmer } = useSwimmer();
  const { data: standardsData } = useStandards({ course_type: courseType, gender: swimmer?.gender });

  // Fetch all standards with times (for matching gender and course type)
  const standardIds = standardsData?.standards?.map(s => s.id) || [];
  const standardQueries = useQueries({
    queries: standardIds.map(id => ({
      queryKey: standardKeys.detail(id),
      queryFn: () => standardService.getStandard(id),
      enabled: !!id,
    })),
  });

  // Calculate achieved standards for each event
  const achievedStandardsByEvent = useMemo(() => {
    if (!pbData || !swimmer || !standardQueries.every(q => q.data)) {
      return undefined;
    }

    const map = new Map<string, AchievedStandard[]>();
    const personalBests = pbData.personal_bests;

    // Determine age group (Swimming Canada rules: age as of Dec 31 of current year)
    const birthDate = new Date(swimmer.birth_date);
    const now = new Date();
    const dec31ThisYear = new Date(now.getFullYear(), 11, 31);
    const ageOnDec31 = dec31ThisYear.getFullYear() - birthDate.getFullYear();
    let ageGroup: string;
    if (ageOnDec31 <= 10) ageGroup = '10U';
    else if (ageOnDec31 <= 12) ageGroup = '11-12';
    else if (ageOnDec31 <= 14) ageGroup = '13-14';
    else if (ageOnDec31 <= 17) ageGroup = '15-17';
    else ageGroup = 'OPEN';

    // For each PB, check which standards it achieved
    personalBests.forEach(pb => {
      const achieved: AchievedStandard[] = [];

      standardQueries.forEach(query => {
        const standard = query.data;
        if (!standard) return;

        // Find the time for this event and age group in the standard
        const standardTime = standard.times?.find(
          t => t.event === pb.event && (t.age_group === ageGroup || t.age_group === 'OPEN')
        );

        if (standardTime && pb.time_ms <= standardTime.time_ms) {
          achieved.push({
            id: standard.id,
            name: standard.name,
          });
        }
      });

      if (achieved.length > 0) {
        map.set(pb.event, achieved);
      }
    });

    return map;
  }, [pbData, swimmer, standardQueries]);

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

      {pbError && (
        <ErrorBanner
          message="Failed to load personal bests"
          onRetry={() => window.location.reload()}
        />
      )}

      {pbLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : pbData ? (
        <PersonalBestGrid
          personalBests={pbData.personal_bests}
          achievedStandardsByEvent={achievedStandardsByEvent}
        />
      ) : null}
    </div>
  );
}

export default PersonalBests;
