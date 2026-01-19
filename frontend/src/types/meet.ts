export type CourseType = '25m' | '50m';

export interface Meet {
  id: string;
  name: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  course_type: CourseType;
  time_count?: number;
}

export interface MeetInput {
  name: string;
  city: string;
  country?: string;
  start_date: string;
  end_date?: string;  // Optional - defaults to start_date for single-day meets
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
