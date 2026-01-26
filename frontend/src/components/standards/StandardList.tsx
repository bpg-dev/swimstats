import { Link } from 'react-router-dom';
import { Standard, StandardListParams, Gender } from '@/types/standard';
import { Card, CardContent, CardHeader, CardTitle, Loading, ErrorBanner } from '@/components/ui';
import { useStandards } from '@/hooks/useStandards';

export interface StandardListProps {
  params?: StandardListParams;
  onSelectStandard?: (standard: Standard) => void;
  showHeader?: boolean;
  emptyMessage?: string;
  linkToDetails?: boolean;
  genderFilter?: Gender;
  onGenderFilterChange?: (gender: Gender) => void;
}

export function StandardList({
  params,
  onSelectStandard,
  showHeader = true,
  emptyMessage = 'No standards found.',
  linkToDetails = false,
  genderFilter,
  onGenderFilterChange,
}: StandardListProps) {
  const { data, isLoading, error } = useStandards(params);

  if (isLoading) {
    return <Loading className="py-8" />;
  }

  if (error) {
    return <ErrorBanner message="Failed to load standards" />;
  }

  const standards = data?.standards || [];

  const content = (
    <>
      {standards.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-slate-900">No standards yet</h3>
          <p className="mt-2 text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {standards.map((standard) => {
            const itemContent = (
              <>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{standard.name}</p>
                  {standard.description && (
                    <p className="text-sm text-slate-500 truncate">{standard.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span
                    className={`
                    inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${standard.course_type === '25m' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                  `}
                  >
                    {standard.course_type}
                  </span>
                  <span
                    className={`
                    inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${standard.gender === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-indigo-100 text-indigo-800'}
                  `}
                  >
                    {standard.gender === 'female' ? 'F' : 'M'}
                  </span>
                  {standard.is_preloaded && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      Preloaded
                    </span>
                  )}
                  {(onSelectStandard || linkToDetails) && (
                    <svg
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              </>
            );

            return (
              <li key={standard.id}>
                {linkToDetails ? (
                  <Link
                    to={`/standards/${standard.id}`}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    {itemContent}
                  </Link>
                ) : (
                  <button
                    onClick={() => onSelectStandard?.(standard)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                    disabled={!onSelectStandard}
                  >
                    {itemContent}
                  </button>
                )}
              </li>
            );
          })}
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
        <div className="flex items-center justify-between">
          <CardTitle>
            Standards
            {standards.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-500">({standards.length})</span>
            )}
          </CardTitle>
          {genderFilter && onGenderFilterChange && (
            <div
              className="inline-flex rounded-lg bg-slate-100 p-0.5"
              role="radiogroup"
              aria-label="Filter by gender"
            >
              <button
                role="radio"
                aria-checked={genderFilter === 'female'}
                aria-label="Female"
                title="Female"
                onClick={() => onGenderFilterChange('female')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${
                  genderFilter === 'female'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                F
              </button>
              <button
                role="radio"
                aria-checked={genderFilter === 'male'}
                aria-label="Male"
                title="Male"
                onClick={() => onGenderFilterChange('male')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${
                  genderFilter === 'male'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                M
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="-mx-6 -mb-6">{content}</CardContent>
    </Card>
  );
}

export default StandardList;
