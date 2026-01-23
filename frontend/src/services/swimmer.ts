import { get, put } from './api';
import { Swimmer, SwimmerInput } from '@/types/swimmer';

export const swimmerService = {
  async getSwimmer(): Promise<Swimmer> {
    return get<Swimmer>('/swimmer');
  },

  async createOrUpdateSwimmer(input: SwimmerInput): Promise<Swimmer> {
    return put<Swimmer>('/swimmer', input);
  },

  async swimmerExists(): Promise<boolean> {
    try {
      await this.getSwimmer();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('404') || message.includes('not found')) {
        return false;
      }
      throw error;
    }
  },
};
