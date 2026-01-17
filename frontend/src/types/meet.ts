export type CourseType = '25m' | '50m';

export interface Meet {
  id: string;
  name: string;
  city: string;
  country: string;
  date: string;
  course_type: CourseType;
  time_count?: number;
}

export interface MeetInput {
  name: string;
  city: string;
  country?: string;
  date: string;
  course_type: CourseType;
}

export interface MeetList {
  meets: Meet[];
  total: number;
}

export interface MeetListParams {
  course_type?: CourseType;
  limit?: number;
  offset?: number;
}
