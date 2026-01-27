import { useQuery } from '@tanstack/react-query';
import { progressService } from '@/services/progress';
import { ProgressParams } from '@/types/progress';

export const progressKeys = {
  all: ['progress'] as const,
  byEvent: (params: ProgressParams) => [...progressKeys.all, params] as const,
};

export function useProgress(params: ProgressParams | null) {
  return useQuery({
    queryKey: params ? progressKeys.byEvent(params) : ['progress', 'disabled'],
    queryFn: () => {
      if (!params) throw new Error('Progress params required');
      return progressService.getProgressData(params);
    },
    enabled: !!params,
  });
}
