import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requireWriteAccess?: boolean;
}

/**
 * Route wrapper that requires authentication.
 * Redirects to login if not authenticated.
 * Optionally requires full/write access level.
 */
export function ProtectedRoute({ children, requireWriteAccess = false }: ProtectedRouteProps) {
  const auth = useAuth();
  const { canWrite } = useAuthStore();
  const location = useLocation();

  // Check OIDC auth state
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!auth.isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check write access if required
  if (requireWriteAccess && !canWrite()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You need full access to perform this action.
          </p>
          <p className="text-sm text-gray-500">
            Contact an administrator if you need elevated access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
