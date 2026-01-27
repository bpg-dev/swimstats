import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, hasAuthParams } from 'react-oidc-context';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';
import { AuthCallback } from '@/pages/AuthCallback';
import { PageLoading } from '@/components/ui/Loading';
import { isOidcConfigured } from './config';

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('@/pages/Home'));
const Meets = lazy(() => import('@/pages/Meets'));
const MeetDetails = lazy(() => import('@/pages/MeetDetails'));
const AddTimes = lazy(() => import('@/pages/AddTimes'));
const AllTimes = lazy(() => import('@/pages/AllTimes'));
const PersonalBests = lazy(() => import('@/pages/PersonalBests'));
const Progress = lazy(() => import('@/pages/Progress'));
const Standards = lazy(() => import('@/pages/Standards'));
const StandardDetail = lazy(() => import('@/pages/StandardDetail'));
const Compare = lazy(() => import('@/pages/Compare'));
const Settings = lazy(() => import('@/pages/Settings'));

// Dev mode login page
function DevModeLoginPage() {
  const { setUser, setLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleContinue = () => {
    setUser({
      id: 'dev-user',
      email: 'dev@swimstats.local',
      name: 'Developer',
      access_level: 'full',
    });
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 122.88 82.13">
            <path d="M0,66.24c7.11-2.74,13.1-0.95,21.42,1.55c2.17,0.65,4.53,1.36,6.66,1.92c1.9,0.5,4.82-0.58,7.88-1.71 c3.82-1.41,7.8-2.87,12.57-2.75c3.6,0.09,6.63,1.74,9.69,3.41c1.92,1.05,3.87,2.11,4.95,2.15c1.24,0.04,3.08-1.04,4.92-2.12 c3-1.77,6-3.54,10.17-3.68c4.48-0.15,7.95,1.39,11.39,2.92c1.96,0.87,3.91,1.74,5.54,1.86c1.54,0.12,3.6-1.2,5.6-2.47 c2.78-1.78,5.51-3.52,9.1-3.92c4.27-0.47,8.93,1.54,12.89,3.24l0.1,0.05c0,4.05,0,8.11,0,12.16c-0.85-0.25-1.73-0.59-2.64-0.96 c-0.63-0.26-1.28-0.54-1.94-0.82c-2.71-1.16-5.9-2.54-7.17-2.4c-1.02,0.11-2.63,1.14-4.27,2.19c-0.6,0.38-1.21,0.77-1.82,1.15 c-3.04,1.85-6.34,3.43-10.69,3.1c-3.54-0.27-6.42-1.55-9.31-2.84l-0.25-0.11c-2.16-0.96-4.33-1.89-6.17-1.83 c-1.13,0.04-2.75,0.95-4.39,1.91l-0.38,0.22c-3.25,1.92-6.51,3.84-11.08,3.67c-3.73-0.14-6.87-1.84-9.96-3.53l-0.39-0.21 c-1.72-0.94-3.37-1.8-4.16-1.82c-2.42-0.06-5.21,0.91-7.92,1.91l-0.47,0.17c-4.74,1.75-9.26,3.41-14.62,2.01 c-2.88-0.75-5.06-1.41-7.06-2.01l-0.06-0.02c-7.25-2.18-11.98-3.58-17.65,0.13c-0.15,0.1-0.31,0.2-0.47,0.31v-0.31V66.24L0,66.24z M87.91,17.06l14.16-2.15c8.81-1.32,6.16-17.18-5.13-14.64l-32.11,5.3c-3.48,0.57-9.45,1.01-12.05,3.33 c-1.49,1.33-2.11,3.18-1.77,5.49c0.48,3.27,3.21,7.37,4.85,10.34l3.97,7.14c2.89,5.19,4.44,5.69-0.91,8.56L22.45,59.99l2.67,0.79 l8.01,0.12c0.91-0.3,1.86-0.65,2.83-1.01c3.82-1.41,7.8-2.87,12.57-2.75c3.6,0.09,6.63,1.74,9.69,3.41l1.38,0.74l7.06,0.11 c0.47-0.26,0.95-0.54,1.42-0.82c3-1.77,6-3.54,10.17-3.68c4.48-0.15,7.95,1.39,11.39,2.92c1.96,0.87,3.91,1.74,5.54,1.86 c0.37,0.03,0.77-0.03,1.19-0.14L77.79,28.5c-1.58-2.81-4.42-6.36-4.01-8.5c0.14-0.72,1.1-1.01,2.27-1.19 C80.01,18.24,83.95,17.66,87.91,17.06L87.91,17.06z M103.21,24.42c7.77,0,14.07,6.3,14.07,14.07c0,7.77-6.3,14.07-14.07,14.07 c-7.77,0-14.07-6.3-14.07-14.07C89.15,30.71,95.44,24.42,103.21,24.42L103.21,24.42z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">SwimStats</h1>
        <p className="text-slate-600 mb-8">Track your competitive swimming progress</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Development Mode:</strong> OIDC not configured. Running with mock
            authentication.
          </p>
        </div>
        <button
          onClick={handleContinue}
          className="inline-flex items-center justify-center px-6 py-3 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors"
        >
          Continue to App
        </button>
      </div>
    </div>
  );
}

// OIDC-enabled login page
function OidcLoginPage() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <PageLoading text="Loading..." />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 122.88 82.13">
            <path d="M0,66.24c7.11-2.74,13.1-0.95,21.42,1.55c2.17,0.65,4.53,1.36,6.66,1.92c1.9,0.5,4.82-0.58,7.88-1.71 c3.82-1.41,7.8-2.87,12.57-2.75c3.6,0.09,6.63,1.74,9.69,3.41c1.92,1.05,3.87,2.11,4.95,2.15c1.24,0.04,3.08-1.04,4.92-2.12 c3-1.77,6-3.54,10.17-3.68c4.48-0.15,7.95,1.39,11.39,2.92c1.96,0.87,3.91,1.74,5.54,1.86c1.54,0.12,3.6-1.2,5.6-2.47 c2.78-1.78,5.51-3.52,9.1-3.92c4.27-0.47,8.93,1.54,12.89,3.24l0.1,0.05c0,4.05,0,8.11,0,12.16c-0.85-0.25-1.73-0.59-2.64-0.96 c-0.63-0.26-1.28-0.54-1.94-0.82c-2.71-1.16-5.9-2.54-7.17-2.4c-1.02,0.11-2.63,1.14-4.27,2.19c-0.6,0.38-1.21,0.77-1.82,1.15 c-3.04,1.85-6.34,3.43-10.69,3.1c-3.54-0.27-6.42-1.55-9.31-2.84l-0.25-0.11c-2.16-0.96-4.33-1.89-6.17-1.83 c-1.13,0.04-2.75,0.95-4.39,1.91l-0.38,0.22c-3.25,1.92-6.51,3.84-11.08,3.67c-3.73-0.14-6.87-1.84-9.96-3.53l-0.39-0.21 c-1.72-0.94-3.37-1.8-4.16-1.82c-2.42-0.06-5.21,0.91-7.92,1.91l-0.47,0.17c-4.74,1.75-9.26,3.41-14.62,2.01 c-2.88-0.75-5.06-1.41-7.06-2.01l-0.06-0.02c-7.25-2.18-11.98-3.58-17.65,0.13c-0.15,0.1-0.31,0.2-0.47,0.31v-0.31V66.24L0,66.24z M87.91,17.06l14.16-2.15c8.81-1.32,6.16-17.18-5.13-14.64l-32.11,5.3c-3.48,0.57-9.45,1.01-12.05,3.33 c-1.49,1.33-2.11,3.18-1.77,5.49c0.48,3.27,3.21,7.37,4.85,10.34l3.97,7.14c2.89,5.19,4.44,5.69-0.91,8.56L22.45,59.99l2.67,0.79 l8.01,0.12c0.91-0.3,1.86-0.65,2.83-1.01c3.82-1.41,7.8-2.87,12.57-2.75c3.6,0.09,6.63,1.74,9.69,3.41l1.38,0.74l7.06,0.11 c0.47-0.26,0.95-0.54,1.42-0.82c3-1.77,6-3.54,10.17-3.68c4.48-0.15,7.95,1.39,11.39,2.92c1.96,0.87,3.91,1.74,5.54,1.86 c0.37,0.03,0.77-0.03,1.19-0.14L77.79,28.5c-1.58-2.81-4.42-6.36-4.01-8.5c0.14-0.72,1.1-1.01,2.27-1.19 C80.01,18.24,83.95,17.66,87.91,17.06L87.91,17.06z M103.21,24.42c7.77,0,14.07,6.3,14.07,14.07c0,7.77-6.3,14.07-14.07,14.07 c-7.77,0-14.07-6.3-14.07-14.07C89.15,30.71,95.44,24.42,103.21,24.42L103.21,24.42z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">SwimStats</h1>
        <p className="text-slate-600 mb-8">Track your competitive swimming progress</p>
        <button
          onClick={() => auth.signinRedirect()}
          className="inline-flex items-center justify-center px-6 py-3 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors"
        >
          Sign in to continue
        </button>
      </div>
    </div>
  );
}

// Main authenticated app content
function AuthenticatedApp() {
  return (
    <AppShell>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meets" element={<Meets />} />
          <Route path="/meets/:id" element={<MeetDetails />} />
          <Route path="/add-times" element={<AddTimes />} />
          <Route path="/all-times" element={<AllTimes />} />
          <Route path="/personal-bests" element={<PersonalBests />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/standards" element={<Standards />} />
          <Route path="/standards/:id" element={<StandardDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}

// App for development mode (no OIDC)
function DevModeApp() {
  const { isAuthenticated, setLoading } = useAuthStore();

  // Auto-authenticate in dev mode on mount
  useEffect(() => {
    // Check if already authenticated
    if (!isAuthenticated) {
      // Set loading to false since there's no real auth
      setLoading(false);
    }
  }, [isAuthenticated, setLoading]);

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/login" element={<DevModeLoginPage />} />
        <Route
          path="/*"
          element={isAuthenticated ? <AuthenticatedApp /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Suspense>
  );
}

// App with OIDC authentication
function OidcApp() {
  const auth = useAuth();
  const { setUser, setLoading } = useAuthStore();

  // Handle OIDC auth state changes
  useEffect(() => {
    // Handle automatic silent sign-in
    if (!hasAuthParams() && !auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading) {
      // Not authenticated and no auth in progress
    }
  }, [auth.isAuthenticated, auth.activeNavigator, auth.isLoading]);

  // Sync OIDC state to our store
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      setUser({
        id: auth.user.profile.sub || 'unknown',
        email: auth.user.profile.email || 'unknown@example.com',
        name: auth.user.profile.name,
        access_level: 'full', // Would come from claims in real implementation
      });
    } else if (!auth.isLoading) {
      setUser(null);
    }
    setLoading(auth.isLoading);
  }, [auth.isAuthenticated, auth.isLoading, auth.user, setUser, setLoading]);

  if (auth.isLoading) {
    return <PageLoading text="Initializing..." />;
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/login" element={<OidcLoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/*"
          element={auth.isAuthenticated ? <AuthenticatedApp /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Suspense>
  );
}

// Main App component - chooses between OIDC and dev mode
function App() {
  if (isOidcConfigured()) {
    return <OidcApp />;
  }
  return <DevModeApp />;
}

export default App;
