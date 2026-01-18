import { PersonalBest } from '@/types/personalbest';
import { getEventInfo } from '@/types/time';
import { Card } from '@/components/ui';

interface PersonalBestCardProps {
  pb: PersonalBest;
}

export function PersonalBestCard({ pb }: PersonalBestCardProps) {
  const eventInfo = getEventInfo(pb.event);
  const eventName = eventInfo?.name ?? pb.event;
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {eventName}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pb.meet}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {pb.time_formatted}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {pb.date}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default PersonalBestCard;
