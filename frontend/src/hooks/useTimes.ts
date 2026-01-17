import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeService } from '@/services/times';
import { TimeRecord, TimeInput, TimeBatchInput, TimeListParams } from '@/types/time';

export const timeKeys = {
  all: ['times'] as const,
  lists: () => [...timeKeys.all, 'list'] as const,
  list: (params?: TimeListParams) => [...timeKeys.lists(), params] as const,
  details: () => [...timeKeys.all, 'detail'] as const,
  detail: (id: string) => [...timeKeys.details(), id] as const,
};

export function useTimes(params?: TimeListParams) {
  return useQuery({
    queryKey: timeKeys.list(params),
    queryFn: () => timeService.listTimes(params),
  });
}

export function useTime(id: string) {
  return useQuery({
    queryKey: timeKeys.detail(id),
    queryFn: () => timeService.getTime(id),
    enabled: !!id,
  });
}

export function useCreateTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TimeInput) => timeService.createTime(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeKeys.lists() });
    },
  });
}

export function useCreateBatchTimes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TimeBatchInput) => timeService.createBatch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeKeys.lists() });
    },
  });
}

export function useUpdateTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TimeInput }) =>
      timeService.updateTime(id, input),
    onSuccess: (time: TimeRecord) => {
      queryClient.setQueryData(timeKeys.detail(time.id), time);
      queryClient.invalidateQueries({ queryKey: timeKeys.lists() });
    },
  });
}

export function useDeleteTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => timeService.deleteTime(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: timeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: timeKeys.lists() });
    },
  });
}
