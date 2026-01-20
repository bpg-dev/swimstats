import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { standardService } from '@/services/standards';
import {
  Standard,
  StandardWithTimes,
  StandardInput,
  StandardTimeInput,
  StandardImportInput,
  StandardListParams,
} from '@/types/standard';

export const standardKeys = {
  all: ['standards'] as const,
  lists: () => [...standardKeys.all, 'list'] as const,
  list: (params?: StandardListParams) => [...standardKeys.lists(), params] as const,
  details: () => [...standardKeys.all, 'detail'] as const,
  detail: (id: string) => [...standardKeys.details(), id] as const,
};

export function useStandards(params?: StandardListParams) {
  return useQuery({
    queryKey: standardKeys.list(params),
    queryFn: () => standardService.listStandards(params),
  });
}

export function useStandard(id: string) {
  return useQuery({
    queryKey: standardKeys.detail(id),
    queryFn: () => standardService.getStandard(id),
    enabled: !!id,
  });
}

export function useCreateStandard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StandardInput) => standardService.createStandard(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: standardKeys.lists() });
    },
  });
}

export function useUpdateStandard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StandardInput }) =>
      standardService.updateStandard(id, input),
    onSuccess: (standard: Standard) => {
      queryClient.invalidateQueries({ queryKey: standardKeys.detail(standard.id) });
      queryClient.invalidateQueries({ queryKey: standardKeys.lists() });
    },
  });
}

export function useDeleteStandard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => standardService.deleteStandard(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: standardKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: standardKeys.lists() });
    },
  });
}

export function useSetStandardTimes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, times }: { id: string; times: StandardTimeInput[] }) =>
      standardService.setStandardTimes(id, times),
    onSuccess: (standard: StandardWithTimes) => {
      queryClient.setQueryData(standardKeys.detail(standard.id), standard);
    },
  });
}

export function useImportStandard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StandardImportInput) => standardService.importStandard(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: standardKeys.lists() });
    },
  });
}
