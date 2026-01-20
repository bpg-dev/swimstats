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
    return get<StandardList>('/v1/standards', params as Record<string, unknown>);
  },

  async getStandard(id: string): Promise<StandardWithTimes> {
    return get<StandardWithTimes>(`/v1/standards/${id}`);
  },

  async createStandard(input: StandardInput): Promise<Standard> {
    return post<Standard>('/v1/standards', input);
  },

  async updateStandard(id: string, input: StandardInput): Promise<Standard> {
    return put<Standard>(`/v1/standards/${id}`, input);
  },

  async deleteStandard(id: string): Promise<void> {
    await del<void>(`/v1/standards/${id}`);
  },

  async setStandardTimes(id: string, times: StandardTimeInput[]): Promise<StandardWithTimes> {
    return put<StandardWithTimes>(`/v1/standards/${id}/times`, { times });
  },

  async importStandard(input: StandardImportInput): Promise<StandardWithTimes> {
    return post<StandardWithTimes>('/v1/standards/import', input);
  },

  async importFromJSON(input: JSONFileInput): Promise<JSONImportResult> {
    return post<JSONImportResult>('/v1/standards/import/json', input);
  },
};
