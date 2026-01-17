import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AccessLevel } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  
  // Computed
  canWrite: () => boolean;
  accessLevel: () => AccessLevel | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        }),

      canWrite: () => get().user?.access_level === 'full',

      accessLevel: () => get().user?.access_level ?? null,
    }),
    {
      name: 'swimstats-auth',
      partialize: (state) => ({
        // Only persist minimal state - user info will be refreshed on load
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
