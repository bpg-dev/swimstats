import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';

import { Home } from '@/pages/Home';
import * as authStoreModule from '@/stores/authStore';

// Spy on useAuthStore to return full write access
beforeEach(() => {
  vi.spyOn(authStoreModule, 'useAuthStore').mockImplementation(
    (selector?: (state: Record<string, unknown>) => unknown) => {
      const mockState = {
        user: { id: 'test-user', name: 'Test User', access_level: 'full' },
        isAuthenticated: true,
        canWrite: () => true,
        accessLevel: () => 'full',
      };
      return selector ? selector(mockState) : mockState;
    }
  );
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  };
}

// Helper that renders Home inside a MemoryRouter and captures navigation
function renderHomeWithRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  let currentPath = '/';

  function LocationCapture() {
    const { pathname, search } = window.location;
    currentPath = pathname + search;
    return null;
  }

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/meets/:id"
            element={
              <div data-testid="meet-details">
                Meet Details
                <LocationCapture />
              </div>
            }
          />
          <Route
            path="/meets"
            element={
              <div data-testid="meets-list">
                Meets List
                <LocationCapture />
              </div>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { ...utils, getCurrentPath: () => currentPath };
}

describe('Home page', () => {
  it('renders dashboard with stats', async () => {
    render(<Home />, { wrapper: createWrapper() });

    // Wait for swimmer profile to load
    await waitFor(() => {
      expect(screen.getByText('Test Swimmer')).toBeInTheDocument();
    });

    // Stats cards should be visible
    expect(screen.getByText('Total Meets')).toBeInTheDocument();
    expect(screen.getByText('Total Times')).toBeInTheDocument();
  });

  it('navigates to meet details (not meets list) when a meet is clicked', async () => {
    const user = userEvent.setup();
    renderHomeWithRouter();

    // Wait for meets to load in the Recent Meets section
    await waitFor(() => {
      expect(screen.getByText('Test Championship')).toBeInTheDocument();
    });

    // Click on the meet
    await user.click(screen.getByText('Test Championship'));

    // Should navigate to meet details page, not the meets list
    await waitFor(() => {
      expect(screen.getByTestId('meet-details')).toBeInTheDocument();
    });

    // Should NOT show the meets list
    expect(screen.queryByTestId('meets-list')).not.toBeInTheDocument();
  });
});
