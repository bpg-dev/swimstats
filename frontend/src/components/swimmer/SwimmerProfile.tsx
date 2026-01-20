import { Swimmer, AGE_GROUPS } from '@/types/swimmer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export interface SwimmerProfileProps {
  swimmer: Swimmer;
  compact?: boolean;
  onEdit?: () => void;
}

export function SwimmerProfile({ swimmer, compact = false, onEdit }: SwimmerProfileProps) {
  const ageGroupLabel = AGE_GROUPS.find((ag) => ag.value === swimmer.current_age_group)?.label;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {swimmer.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-semibold text-slate-900">{swimmer.name}</p>
          <p className="text-sm text-slate-500">
            {swimmer.current_age} years • {ageGroupLabel}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Swimmer Profile</CardTitle>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
          >
            Edit
          </button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl">
              {swimmer.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{swimmer.name}</h3>
              <p className="text-slate-500 capitalize">{swimmer.gender}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Birth Date</p>
                <p className="font-medium text-slate-900">{formatDate(swimmer.birth_date)}</p>
              </div>
              <div>
                <p className="text-slate-500">Current Age</p>
                <p className="font-medium text-slate-900">{swimmer.current_age} years</p>
              </div>
              <div>
                <p className="text-slate-500">Age Group</p>
                <p className="font-medium text-slate-900">{ageGroupLabel}</p>
              </div>
              <div>
                <p className="text-slate-500">Competition Age</p>
                <p className="font-medium text-slate-900">{swimmer.current_age} (as of Dec 31)</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SwimmerProfile;
