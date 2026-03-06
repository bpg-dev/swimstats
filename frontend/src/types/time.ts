import { CourseType, Meet } from './meet';

export type EventCode =
  | '50FR'
  | '100FR'
  | '200FR'
  | '400FR'
  | '800FR'
  | '1500FR'
  | '50BK'
  | '100BK'
  | '200BK'
  | '50BR'
  | '100BR'
  | '200BR'
  | '50FL'
  | '100FL'
  | '200FL'
  | '200IM'
  | '400IM'
  | '50FRS'
  | '100FRS'
  | '200FRS'
  | '50BKS'
  | '100BKS';

export interface TimeRecord {
  id: string;
  meet_id: string;
  event: EventCode;
  time_ms: number;
  time_formatted: string;
  event_date?: string; // Specific date when event was swum (within meet date range)
  notes?: string;
  is_pb?: boolean;
  meet?: Meet;
}

export interface TimeInput {
  meet_id: string;
  event: EventCode;
  time_ms: number;
  event_date?: string; // Optional - specific date when event was swum
  notes?: string;
}

export interface TimeBatchInput {
  meet_id: string;
  times: Array<{
    event: EventCode;
    time_ms: number;
    event_date?: string; // Optional - specific date when event was swum
    notes?: string;
  }>;
}

export interface TimeList {
  times: TimeRecord[];
  total: number;
}

export interface TimeListParams {
  course_type?: CourseType;
  event?: EventCode;
  meet_id?: string;
  limit?: number;
  offset?: number;
}

export interface BatchResult {
  times: TimeRecord[];
  new_pbs: EventCode[];
}

// Event metadata for UI
export interface EventInfo {
  code: EventCode;
  name: string;
  stroke: string;
  distance: number;
}

export const EVENTS: EventInfo[] = [
  // Freestyle
  { code: '50FR', name: '50m Freestyle', stroke: 'Freestyle', distance: 50 },
  { code: '100FR', name: '100m Freestyle', stroke: 'Freestyle', distance: 100 },
  { code: '200FR', name: '200m Freestyle', stroke: 'Freestyle', distance: 200 },
  { code: '400FR', name: '400m Freestyle', stroke: 'Freestyle', distance: 400 },
  { code: '800FR', name: '800m Freestyle', stroke: 'Freestyle', distance: 800 },
  { code: '1500FR', name: '1500m Freestyle', stroke: 'Freestyle', distance: 1500 },
  // Freestyle splits
  { code: '50FRS', name: '50m Freestyle Split', stroke: 'Freestyle', distance: 50 },
  { code: '100FRS', name: '100m Freestyle Split', stroke: 'Freestyle', distance: 100 },
  { code: '200FRS', name: '200m Freestyle Split', stroke: 'Freestyle', distance: 200 },
  // Backstroke
  { code: '50BK', name: '50m Backstroke', stroke: 'Backstroke', distance: 50 },
  { code: '100BK', name: '100m Backstroke', stroke: 'Backstroke', distance: 100 },
  { code: '200BK', name: '200m Backstroke', stroke: 'Backstroke', distance: 200 },
  // Backstroke splits
  { code: '50BKS', name: '50m Backstroke Split', stroke: 'Backstroke', distance: 50 },
  { code: '100BKS', name: '100m Backstroke Split', stroke: 'Backstroke', distance: 100 },
  // Breaststroke
  { code: '50BR', name: '50m Breaststroke', stroke: 'Breaststroke', distance: 50 },
  { code: '100BR', name: '100m Breaststroke', stroke: 'Breaststroke', distance: 100 },
  { code: '200BR', name: '200m Breaststroke', stroke: 'Breaststroke', distance: 200 },
  // Butterfly
  { code: '50FL', name: '50m Butterfly', stroke: 'Butterfly', distance: 50 },
  { code: '100FL', name: '100m Butterfly', stroke: 'Butterfly', distance: 100 },
  { code: '200FL', name: '200m Butterfly', stroke: 'Butterfly', distance: 200 },
  // Individual Medley
  { code: '200IM', name: '200m IM', stroke: 'Individual Medley', distance: 200 },
  { code: '400IM', name: '400m IM', stroke: 'Individual Medley', distance: 400 },
];

export const EVENTS_BY_STROKE: Record<string, EventInfo[]> = {
  Freestyle: EVENTS.filter((e) => e.stroke === 'Freestyle'),
  Backstroke: EVENTS.filter((e) => e.stroke === 'Backstroke'),
  Breaststroke: EVENTS.filter((e) => e.stroke === 'Breaststroke'),
  Butterfly: EVENTS.filter((e) => e.stroke === 'Butterfly'),
  'Individual Medley': EVENTS.filter((e) => e.stroke === 'Individual Medley'),
};

export function getEventInfo(code: EventCode): EventInfo | undefined {
  return EVENTS.find((e) => e.code === code);
}

const SPLIT_CODES: Set<EventCode> = new Set(['50FRS', '100FRS', '200FRS', '50BKS', '100BKS']);

const SPLIT_TO_BASE: Record<string, EventCode> = {
  '50FRS': '50FR',
  '100FRS': '100FR',
  '200FRS': '200FR',
  '50BKS': '50BK',
  '100BKS': '100BK',
};

export function isSplitEvent(code: EventCode): boolean {
  return SPLIT_CODES.has(code);
}

export function baseEvent(code: EventCode): EventCode {
  return SPLIT_TO_BASE[code] ?? code;
}

const BASE_TO_SPLIT: Record<string, EventCode> = {
  '50FR': '50FRS',
  '100FR': '100FRS',
  '200FR': '200FRS',
  '50BK': '50BKS',
  '100BK': '100BKS',
};

export function splitVariant(code: EventCode): EventCode | undefined {
  return BASE_TO_SPLIT[code];
}
