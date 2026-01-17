import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * API error response structure.
 */
export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, string>;
}

/**
 * Create configured axios instance.
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  // Request interceptor for auth
  client.interceptors.request.use(
    (config) => {
      // In development mode, add mock user header if no auth token
      if (import.meta.env.DEV) {
        const authStore = useAuthStore.getState();
        if (!config.headers.Authorization && authStore.isAuthenticated) {
          // For dev mode, we might use mock auth
          const mockUser = JSON.stringify({
            email: 'dev@swimstats.local',
            name: 'Developer',
            access: authStore.canWrite() ? 'full' : 'view_only',
          });
          config.headers['X-Mock-User'] = mockUser;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      // Handle 401 - redirect to login
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        // Don't redirect here - let the ProtectedRoute handle it
      }

      // Extract error message
      const message =
        error.response?.data?.error ||
        error.message ||
        'An unexpected error occurred';

      return Promise.reject(new Error(message));
    }
  );

  return client;
}

export const apiClient = createApiClient();

/**
 * Generic API request function.
 */
export async function api<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}

/**
 * GET request helper.
 */
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  return api<T>({ method: 'GET', url, params });
}

/**
 * POST request helper.
 */
export async function post<T>(url: string, data?: unknown): Promise<T> {
  return api<T>({ method: 'POST', url, data });
}

/**
 * PUT request helper.
 */
export async function put<T>(url: string, data?: unknown): Promise<T> {
  return api<T>({ method: 'PUT', url, data });
}

/**
 * DELETE request helper.
 */
export async function del<T>(url: string): Promise<T> {
  return api<T>({ method: 'DELETE', url });
}

export default apiClient;
