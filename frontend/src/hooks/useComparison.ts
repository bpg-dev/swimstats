import { useQuery } from '@tanstack/react-query';
import { comparisonService } from '@/services/comparisons';
import { ComparisonParams } from '@/types/comparison';

export const comparisonKeys = {
  all: ['comparisons'] as const,
  comparison: (params: ComparisonParams) => [...comparisonKeys.all, params] as const,
};

export function useComparison(params: ComparisonParams | null) {
  return useQuery({
    queryKey: params ? comparisonKeys.comparison(params) : comparisonKeys.all,
    queryFn: () => comparisonService.getComparison(params!),
    enabled: !!params?.standard_id,
  });
}
