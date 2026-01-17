import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from 'react-oidc-context';
import App from './App';
import './index.css';

// React Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// OIDC configuration
const oidcConfig = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY || '',
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID || '',
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  post_logout_redirect_uri: window.location.origin,
  scope: 'openid email profile',
  automaticSilentRenew: true,
  onSigninCallback: () => {
    // Remove the code and state from the URL after login
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

// Check if OIDC is configured (skip auth in dev if not configured)
const isOidcConfigured = oidcConfig.authority && oidcConfig.client_id;

function AppWithProviders() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {isOidcConfigured ? (
            <AuthProvider {...oidcConfig}>
              <App />
            </AuthProvider>
          ) : (
            // Dev mode without OIDC - render app directly
            <App />
          )}
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<AppWithProviders />);
