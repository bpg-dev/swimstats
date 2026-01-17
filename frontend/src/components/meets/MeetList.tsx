import { Meet, CourseType } from '@/types/meet';
import { Card, CardContent, CardHeader, CardTitle, Loading, ErrorBanner } from '@/components/ui';
import { useMeets } from '@/hooks/useMeets';

export interface MeetListProps {
  courseType?: CourseType;
  limit?: number;
  onSelectMeet?: (meet: Meet) => void;
  showHeader?: boolean;
  emptyMessage?: string;
}

export function MeetList({
  courseType,
  limit = 10,
  onSelectMeet,
  showHeader = true,
  emptyMessage = 'No meets found.',
}: MeetListProps) {
  const { data, isLoading, error } = useMeets({ course_type: courseType, limit });

  if (isLoading) {
    return <Loading className="py-8" />;
  }

  if (error) {
    return <ErrorBanner message="Failed to load meets" />;
  }

  const meets = data?.meets || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const content = (
    <>
      {meets.length === 0 ? (
        <p className="text-slate-500 text-center py-8">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {meets.map((meet) => (
            <li key={meet.id}>
              <button
                onClick={() => onSelectMeet?.(meet)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                disabled={!onSelectMeet}
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{meet.name}</p>
                  <p className="text-sm text-slate-500">
                    {meet.city}, {meet.country} • {formatDate(meet.date)}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${meet.course_type === '25m' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'}
                  `}>
                    {meet.course_type}
                  </span>
                  {meet.time_count !== undefined && meet.time_count > 0 && (
                    <span className="text-sm text-slate-400">
                      {meet.time_count} time{meet.time_count !== 1 ? 's' : ''}
                    </span>
                  )}
                  {onSelectMeet && (
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  if (!showHeader) {
    return <div className="-mx-4">{content}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Recent Meets
          {data?.total !== undefined && data.total > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({data.total} total)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="-mx-6 -mb-6">
        {content}
      </CardContent>
    </Card>
  );
}

export default MeetList;
