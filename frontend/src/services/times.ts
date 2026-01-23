import { get, post, put, del } from './api';
import {
  TimeRecord,
  TimeInput,
  TimeBatchInput,
  TimeList,
  TimeListParams,
  BatchResult,
} from '@/types/time';

export const timeService = {
  async listTimes(params?: TimeListParams): Promise<TimeList> {
    return get<TimeList>('/times', params as Record<string, unknown>);
  },

  async getTime(id: string): Promise<TimeRecord> {
    return get<TimeRecord>(`/times/${id}`);
  },

  async createTime(input: TimeInput): Promise<TimeRecord> {
    return post<TimeRecord>('/times', input);
  },

  async createBatch(input: TimeBatchInput): Promise<BatchResult> {
    return post<BatchResult>('/times/batch', input);
  },

  async updateTime(id: string, input: TimeInput): Promise<TimeRecord> {
    return put<TimeRecord>(`/times/${id}`, input);
  },

  async deleteTime(id: string): Promise<void> {
    await del<void>(`/times/${id}`);
  },
};
