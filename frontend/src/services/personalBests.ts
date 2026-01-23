import { get } from './api';
import { CourseType } from '@/types/meet';
import { PersonalBestList } from '@/types/personalbest';

export const personalBestService = {
  async getPersonalBests(courseType: CourseType): Promise<PersonalBestList> {
    return get<PersonalBestList>('/personal-bests', { course_type: courseType });
  },
};
