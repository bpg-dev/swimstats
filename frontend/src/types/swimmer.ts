export interface Swimmer {
  id: string;
  name: string;
  birth_date: string;
  gender: 'male' | 'female';
  current_age: number;
  current_age_group: AgeGroup;
}

export interface SwimmerInput {
  name: string;
  birth_date: string;
  gender: 'male' | 'female';
}

export type AgeGroup = '10U' | '11-12' | '13-14' | '15-17' | 'OPEN';

export const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: '10U', label: '10 & Under' },
  { value: '11-12', label: '11-12' },
  { value: '13-14', label: '13-14' },
  { value: '15-17', label: '15-17' },
  { value: 'OPEN', label: 'Open/Senior' },
];
