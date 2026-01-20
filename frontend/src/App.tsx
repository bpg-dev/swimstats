import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, hasAuthParams } from 'react-oidc-context';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';
import { AuthCallback } from '@/pages/AuthCallback';
import { PageLoading } from '@/components/ui/Loading';

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

// Check if OIDC is configured
const isOidcConfigured = Boolean(
  import.meta.env.VITE_OIDC_AUTHORITY && import.meta.env.VITE_OIDC_CLIENT_ID
);

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
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">SwimStats</h1>
        <p className="text-slate-600 mb-8">Track your competitive swimming progress</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Development Mode:</strong> OIDC not configured. 
            Running with mock authentication.
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
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
          element={
            isAuthenticated ? (
              <AuthenticatedApp />
            ) : (
              <Navigate to="/login" replace />
            )
          }
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
          element={
            auth.isAuthenticated ? (
              <AuthenticatedApp />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Suspense>
  );
}

// Main App component - chooses between OIDC and dev mode
function App() {
  if (isOidcConfigured) {
    return <OidcApp />;
  }
  return <DevModeApp />;
}

export default App;
