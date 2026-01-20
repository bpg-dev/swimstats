import { CourseType } from './meet';

export type ComparisonStatus = 'achieved' | 'almost' | 'not_achieved' | 'no_time' | 'no_standard';

export interface EventComparison {
  event: string;
  status: ComparisonStatus;
  swimmer_time_ms: number | null;
  swimmer_time_formatted: string | null;
  standard_time_ms: number | null;
  standard_time_formatted: string | null;
  difference_ms: number | null;
  difference_formatted: string | null;
  difference_percent: number | null;
  age_group: string;
  meet_name: string | null;
  date: string | null;

  // Adjacent age groups
  prev_age_group?: string | null;
  prev_standard_time_ms?: number | null;
  prev_standard_time_formatted?: string | null;
  prev_achieved: boolean;

  next_age_group?: string | null;
  next_standard_time_ms?: number | null;
  next_standard_time_formatted?: string | null;
  next_achieved: boolean;
}

export interface ComparisonResult {
  standard_id: string;
  standard_name: string;
  course_type: CourseType;
  swimmer_name: string;
  swimmer_age_group: string;
  threshold_percent: number;
  comparisons: EventComparison[];
  summary: ComparisonSummary;
}

export interface ComparisonSummary {
  total_events: number;
  achieved: number;
  almost: number;
  not_achieved: number;
  no_time: number;
}

export interface ComparisonParams {
  standard_id: string;
  course_type?: CourseType;
}
