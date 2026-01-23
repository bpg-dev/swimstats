import { get, post, put, del } from './api';
import {
  Standard,
  StandardWithTimes,
  StandardInput,
  StandardTimeInput,
  StandardImportInput,
  StandardList,
  StandardListParams,
  JSONFileInput,
  JSONImportResult,
} from '@/types/standard';

export const standardService = {
  async listStandards(params?: StandardListParams): Promise<StandardList> {
    return get<StandardList>('/standards', params as Record<string, unknown>);
  },

  async getStandard(id: string): Promise<StandardWithTimes> {
    return get<StandardWithTimes>(`/standards/${id}`);
  },

  async createStandard(input: StandardInput): Promise<Standard> {
    return post<Standard>('/standards', input);
  },

  async updateStandard(id: string, input: StandardInput): Promise<Standard> {
    return put<Standard>(`/standards/${id}`, input);
  },

  async deleteStandard(id: string): Promise<void> {
    await del<void>(`/standards/${id}`);
  },

  async setStandardTimes(id: string, times: StandardTimeInput[]): Promise<StandardWithTimes> {
    return put<StandardWithTimes>(`/standards/${id}/times`, { times });
  },

  async importStandard(input: StandardImportInput): Promise<StandardWithTimes> {
    return post<StandardWithTimes>('/standards/import', input);
  },

  async importFromJSON(input: JSONFileInput): Promise<JSONImportResult> {
    return post<JSONImportResult>('/standards/import/json', input);
  },
};
