import { PersonalBest, PersonalBestsByStroke } from '@/types/personalbest';
import { EVENTS_BY_STROKE } from '@/types/time';
import { PersonalBestCard } from './PersonalBestCard';

interface PersonalBestGridProps {
  personalBests: PersonalBest[];
}

const STROKE_ORDER = [
  'Freestyle',
  'Backstroke',
  'Breaststroke',
  'Butterfly',
  'Individual Medley',
];

const STROKE_ICONS: Record<string, string> = {
  Freestyle: '🏊',
  Backstroke: '🔙',
  Breaststroke: '🐸',
  Butterfly: '🦋',
  'Individual Medley': '🔄',
};

function groupByStroke(personalBests: PersonalBest[]): PersonalBestsByStroke {
  const result: PersonalBestsByStroke = {};

  for (const stroke of STROKE_ORDER) {
    const strokeEvents = EVENTS_BY_STROKE[stroke]?.map(e => e.code) ?? [];
    const strokePBs = personalBests.filter(pb => strokeEvents.includes(pb.event));
    if (strokePBs.length > 0) {
      // Sort by distance (extracted from event code)
      strokePBs.sort((a, b) => {
        const aDistance = parseInt(a.event.replace(/\D/g, ''), 10);
        const bDistance = parseInt(b.event.replace(/\D/g, ''), 10);
        return aDistance - bDistance;
      });
      result[stroke] = strokePBs;
    }
  }

  return result;
}

export function PersonalBestGrid({ personalBests }: PersonalBestGridProps) {
  const byStroke = groupByStroke(personalBests);

  if (personalBests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🏊‍♀️</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Personal Bests Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Start recording swim times to see your personal bests here.
          Your fastest time for each event will be automatically tracked.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {STROKE_ORDER.map(stroke => {
        const pbs = byStroke[stroke];
        if (!pbs || pbs.length === 0) return null;

        return (
          <section key={stroke}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>{STROKE_ICONS[stroke]}</span>
              <span>{stroke}</span>
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({pbs.length} {pbs.length === 1 ? 'event' : 'events'})
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pbs.map(pb => (
                <PersonalBestCard key={pb.event} pb={pb} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default PersonalBestGrid;
