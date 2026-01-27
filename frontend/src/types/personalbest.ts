import { CourseType } from './meet';
import { EventCode } from './time';

export interface PersonalBest {
  event: EventCode;
  time_ms: number;
  time_formatted: string;
  time_id: string;
  meet: string; // Meet name
  date: string;
}

export interface PersonalBestList {
  course_type: CourseType;
  personal_bests: PersonalBest[];
}

// Grouped by stroke for display
export interface PersonalBestsByStroke {
  [stroke: string]: PersonalBest[];
}
