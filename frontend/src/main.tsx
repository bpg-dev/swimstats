import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from 'react-oidc-context';
import App from './App';
import './index.css';
import { loadConfig, getConfig, isOidcConfigured } from './config';

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

// eslint-disable-next-line react-refresh/only-export-components
function AppWithProviders() {
  const config = getConfig();

  // Build OIDC config from runtime configuration
  const oidcConfig = isOidcConfigured()
    ? {
        authority: config.oidc!.authority,
        client_id: config.oidc!.clientId,
        redirect_uri: config.oidc?.redirectUri || `${window.location.origin}/auth/callback`,
        post_logout_redirect_uri: window.location.origin,
        scope: 'openid email profile',
        automaticSilentRenew: true,
        onSigninCallback: () => {
          // Remove the code and state from the URL after login
          window.history.replaceState({}, document.title, window.location.pathname);
        },
      }
    : null;

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {oidcConfig ? (
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

// Load config before rendering
loadConfig().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(<AppWithProviders />);
});
