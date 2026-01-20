export interface ProgressDataPoint {
  id: string;
  time_ms: number;
  time_formatted: string;
  date: string;
  meet_name: string;
  event: string;
  is_pb: boolean;
}

export interface ProgressData {
  swimmer_id: string;
  event: string;
  course_type: string;
  start_date?: string;
  end_date?: string;
  data_points: ProgressDataPoint[];
}

export interface ProgressParams {
  event: string;
  course_type: string;
  start_date?: string;
  end_date?: string;
}
