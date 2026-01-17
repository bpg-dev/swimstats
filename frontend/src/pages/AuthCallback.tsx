import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth';

/**
 * Handles the OIDC callback after authentication.
 * Fetches user info and redirects to the intended destination.
 */
export function AuthCallback() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    async function handleCallback() {
      try {
        setLoading(true);

        // Wait for OIDC to process the callback
        if (auth.isLoading) {
          return;
        }

        if (auth.error) {
          setError(auth.error.message);
          navigate('/login', { replace: true });
          return;
        }

        if (auth.isAuthenticated && auth.user?.access_token) {
          // Fetch user info from our API
          const user = await authService.getCurrentUser(auth.user.access_token);
          setUser(user);

          // Redirect to the original destination or home
          const from = (location.state as { from?: Location })?.from?.pathname || '/';
          navigate(from, { replace: true });
        } else {
          // Not authenticated, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    }

    handleCallback();
  }, [auth.isLoading, auth.isAuthenticated, auth.user, auth.error, navigate, location, setUser, setLoading, setError]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4" />
      <p className="text-gray-600">Completing authentication...</p>
    </div>
  );
}

export default AuthCallback;
