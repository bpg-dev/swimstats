import { useQuery } from '@tanstack/react-query';
import { personalBestService } from '@/services/personalBests';
import { CourseType } from '@/types/meet';
import { PersonalBest, PersonalBestsByStroke } from '@/types/personalbest';
import { EVENTS_BY_STROKE } from '@/types/time';

export const personalBestKeys = {
  all: ['personalBests'] as const,
  byCourse: (courseType: CourseType) => [...personalBestKeys.all, courseType] as const,
};

export function usePersonalBests(courseType: CourseType) {
  return useQuery({
    queryKey: personalBestKeys.byCourse(courseType),
    queryFn: () => personalBestService.getPersonalBests(courseType),
  });
}

// Utility function to group personal bests by stroke
export function groupByStroke(personalBests: PersonalBest[]): PersonalBestsByStroke {
  const strokes = Object.keys(EVENTS_BY_STROKE);
  const result: PersonalBestsByStroke = {};

  for (const stroke of strokes) {
    const strokeEvents = EVENTS_BY_STROKE[stroke].map(e => e.code);
    const strokePBs = personalBests.filter(pb => strokeEvents.includes(pb.event));
    if (strokePBs.length > 0) {
      result[stroke] = strokePBs;
    }
  }

  return result;
}
