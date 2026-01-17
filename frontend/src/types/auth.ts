/**
 * Access level for authenticated users.
 */
export type AccessLevel = 'full' | 'view_only';

/**
 * Authenticated user information.
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  access_level: AccessLevel;
}

/**
 * Authentication state.
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

/**
 * OIDC configuration for the auth provider.
 */
export interface OidcConfig {
  authority: string;
  client_id: string;
  redirect_uri: string;
  post_logout_redirect_uri?: string;
  scope?: string;
}

/**
 * Check if user has write access.
 */
export function canWrite(user: User | null): boolean {
  return user?.access_level === 'full';
}

/**
 * Check if user has read-only access.
 */
export function isViewOnly(user: User | null): boolean {
  return user?.access_level === 'view_only';
}
