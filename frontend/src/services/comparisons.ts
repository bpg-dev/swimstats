import { get } from './api';
import { ComparisonResult, ComparisonParams } from '@/types/comparison';

export const comparisonService = {
  async getComparison(params: ComparisonParams): Promise<ComparisonResult> {
    const queryParams: Record<string, string> = {
      standard_id: params.standard_id,
    };
    if (params.course_type) {
      queryParams.course_type = params.course_type;
    }
    return get<ComparisonResult>('/comparisons', queryParams);
  },
};
