import { CourseType } from './meet';

export type Gender = 'female' | 'male';
export type AgeGroup = '10U' | '11-12' | '13-14' | '15-17' | 'OPEN';

export interface Standard {
  id: string;
  name: string;
  description?: string;
  course_type: CourseType;
  gender: Gender;
  is_preloaded: boolean;
}

export interface StandardTime {
  event: string;
  age_group: AgeGroup;
  time_ms: number;
  time_formatted: string;
}

export interface StandardWithTimes extends Standard {
  times: StandardTime[];
}

export interface StandardInput {
  name: string;
  description?: string;
  course_type: CourseType;
  gender: Gender;
}

export interface StandardTimeInput {
  event: string;
  age_group: AgeGroup;
  time_ms: number;
}

export interface StandardImportInput {
  name: string;
  description?: string;
  course_type: CourseType;
  gender: Gender;
  times: StandardTimeInput[];
}

export interface StandardList {
  standards: Standard[];
}

export interface StandardListParams {
  course_type?: CourseType;
  gender?: Gender;
}
