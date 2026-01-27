import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Course type (pool length).
 */
export type CourseType = '25m' | '50m';

interface CourseFilterState {
  courseType: CourseType;
  setCourseType: (courseType: CourseType) => void;
  toggle: () => void;
}

/**
 * Global course type filter store.
 * Used to filter all data views by 25m (short course) or 50m (long course).
 */
export const useCourseFilterStore = create<CourseFilterState>()(
  persist(
    (set, get) => ({
      courseType: '25m', // Default to short course

      setCourseType: (courseType) => set({ courseType }),

      toggle: () => set({ courseType: get().courseType === '25m' ? '50m' : '25m' }),
    }),
    {
      name: 'swimstats-course-filter',
    }
  )
);

/**
 * Hook to get the current course type.
 */
export function useCourseType(): CourseType {
  return useCourseFilterStore((state) => state.courseType);
}

/**
 * Hook to get the course type setter.
 */
export function useSetCourseType(): (courseType: CourseType) => void {
  return useCourseFilterStore((state) => state.setCourseType);
}

export default useCourseFilterStore;
