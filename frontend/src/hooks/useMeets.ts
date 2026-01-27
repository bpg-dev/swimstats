import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetService } from '@/services/meets';
import { Meet, MeetInput, MeetListParams } from '@/types/meet';

export const meetKeys = {
  all: ['meets'] as const,
  lists: () => [...meetKeys.all, 'list'] as const,
  list: (params?: MeetListParams) => [...meetKeys.lists(), params] as const,
  details: () => [...meetKeys.all, 'detail'] as const,
  detail: (id: string) => [...meetKeys.details(), id] as const,
};

export function useMeets(params?: MeetListParams) {
  return useQuery({
    queryKey: meetKeys.list(params),
    queryFn: () => meetService.listMeets(params),
  });
}

export function useMeet(id: string) {
  return useQuery({
    queryKey: meetKeys.detail(id),
    queryFn: () => meetService.getMeet(id),
    enabled: !!id,
  });
}

export function useCreateMeet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MeetInput) => meetService.createMeet(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetKeys.lists() });
    },
  });
}

export function useUpdateMeet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MeetInput }) =>
      meetService.updateMeet(id, input),
    onSuccess: (meet: Meet) => {
      queryClient.setQueryData(meetKeys.detail(meet.id), meet);
      queryClient.invalidateQueries({ queryKey: meetKeys.lists() });
    },
  });
}

export function useDeleteMeet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => meetService.deleteMeet(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: meetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: meetKeys.lists() });
    },
  });
}
