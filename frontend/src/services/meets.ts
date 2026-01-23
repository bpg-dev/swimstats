import { get, post, put, del } from './api';
import { Meet, MeetInput, MeetList, MeetListParams } from '@/types/meet';

export const meetService = {
  async listMeets(params?: MeetListParams): Promise<MeetList> {
    return get<MeetList>('/meets', params as Record<string, unknown>);
  },

  async getMeet(id: string): Promise<Meet> {
    return get<Meet>(`/meets/${id}`);
  },

  async createMeet(input: MeetInput): Promise<Meet> {
    return post<Meet>('/meets', input);
  },

  async updateMeet(id: string, input: MeetInput): Promise<Meet> {
    return put<Meet>(`/meets/${id}`, input);
  },

  async deleteMeet(id: string): Promise<void> {
    await del<void>(`/meets/${id}`);
  },
};
