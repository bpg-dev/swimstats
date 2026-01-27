import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { swimmerService } from '@/services/swimmer';
import { Swimmer, SwimmerInput } from '@/types/swimmer';

export const swimmerKeys = {
  all: ['swimmer'] as const,
  profile: () => [...swimmerKeys.all, 'profile'] as const,
};

export function useSwimmer() {
  return useQuery({
    queryKey: swimmerKeys.profile(),
    queryFn: swimmerService.getSwimmer,
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 (no swimmer exists yet)
      const apiError = error as { response?: { status?: number } };
      if (apiError?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useSwimmerExists() {
  return useQuery({
    queryKey: [...swimmerKeys.profile(), 'exists'],
    queryFn: swimmerService.swimmerExists,
  });
}

export function useCreateOrUpdateSwimmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SwimmerInput) => swimmerService.createOrUpdateSwimmer(input),
    onSuccess: (swimmer: Swimmer) => {
      queryClient.setQueryData(swimmerKeys.profile(), swimmer);
      queryClient.invalidateQueries({ queryKey: swimmerKeys.all });
    },
  });
}
