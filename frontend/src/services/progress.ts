import { get } from './api';
import { ProgressData, ProgressParams } from '@/types/progress';

export const progressService = {
  async getProgressData(params: ProgressParams): Promise<ProgressData> {
    const queryParams: Record<string, string> = {
      course_type: params.course_type,
    };

    if (params.start_date) {
      queryParams.start_date = params.start_date;
    }
    if (params.end_date) {
      queryParams.end_date = params.end_date;
    }

    return get<ProgressData>(`/v1/progress/${params.event}`, queryParams);
  },
};
