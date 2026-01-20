import { User } from '@/types/auth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Authentication service for interacting with the backend API.
 */
export const authService = {
  /**
   * Get the current authenticated user's information.
   */
  async getCurrentUser(token?: string): Promise<User> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Not authenticated');
      }
      throw new Error('Failed to get user info');
    }

    return response.json();
  },

  /**
   * Check if we're in development mode (for mock auth).
   */
  isDevMode(): boolean {
    return import.meta.env.DEV || import.meta.env.VITE_ENV === 'development';
  },

  /**
   * Create a mock user header for development.
   */
  createMockUserHeader(access: 'full' | 'view_only' = 'full'): string {
    return JSON.stringify({
      email: 'dev@swimstats.local',
      name: 'Developer',
      access,
    });
  },
};

export default authService;
