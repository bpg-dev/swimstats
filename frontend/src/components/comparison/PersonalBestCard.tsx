import { Link, useNavigate } from 'react-router-dom';
import { PersonalBest } from '@/types/personalbest';
import { getEventInfo } from '@/types/time';
import { Card } from '@/components/ui';

export interface AchievedStandard {
  id: string;
  name: string;
}

interface PersonalBestCardProps {
  pb: PersonalBest;
  achievedStandards?: AchievedStandard[];
}

export function PersonalBestCard({ pb, achievedStandards }: PersonalBestCardProps) {
  const navigate = useNavigate();
  const eventInfo = getEventInfo(pb.event);
  const eventName = eventInfo?.name ?? pb.event;

  const handleCardClick = () => {
    navigate(`/all-times?event=${pb.event}`);
  };

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View all ${eventName} times`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100">{eventName}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{pb.meet}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {pb.time_formatted}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{pb.date}</p>
        </div>
      </div>

      {achievedStandards && achievedStandards.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Achieved:</p>
          <div className="flex flex-wrap gap-1">
            {achievedStandards.map((standard) => (
              <Link
                key={standard.id}
                to={`/compare?standard_id=${standard.id}`}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[0.65rem] font-medium bg-emerald-50 text-slate-600 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-slate-300 dark:hover:bg-emerald-800 transition-colors"
                title={`View comparison with ${standard.name}`}
                onClick={(e) => e.stopPropagation()}
              >
                {standard.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default PersonalBestCard;
