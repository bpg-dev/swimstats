import { ComparisonSummary as ComparisonSummaryType } from '@/types/comparison';

interface ComparisonSummaryProps {
  summary: ComparisonSummaryType;
  thresholdPercent: number;
}

export function ComparisonSummary({ summary, thresholdPercent }: ComparisonSummaryProps) {
  const eventsWithTimes = summary.total_events - summary.no_time;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-green-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-700">{summary.achieved}</div>
        <div className="text-sm text-green-600">Achieved</div>
      </div>
      <div className="bg-amber-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-amber-700">{summary.almost}</div>
        <div className="text-sm text-amber-600">Almost ({thresholdPercent}%)</div>
      </div>
      <div className="bg-slate-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-slate-700">{summary.not_achieved}</div>
        <div className="text-sm text-slate-600">Not Yet</div>
      </div>
      <div className="bg-slate-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-slate-500">{eventsWithTimes}</div>
        <div className="text-sm text-slate-500">Events Tracked</div>
      </div>
    </div>
  );
}
