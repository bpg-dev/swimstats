import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { TimeEntryForm } from '@/components/times/TimeEntryForm';
import { QuickEntryForm } from '@/components/times/QuickEntryForm';
import { EventSelector } from '@/components/times/EventSelector';
import { TimeHistory } from '@/components/times/TimeHistory';
import { mockMeet, mockTime } from '../mocks/handlers';
import * as authStoreModule from '@/stores/authStore';

// Test wrapper with providers
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

describe('EventSelector', () => {
  it('renders all swim events', () => {
    render(<EventSelector />, { wrapper: createWrapper() });

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Check for some events in the dropdown
    expect(screen.getByText('50m Freestyle')).toBeInTheDocument();
    expect(screen.getByText('100m Backstroke')).toBeInTheDocument();
    expect(screen.getByText('200m IM')).toBeInTheDocument();
  });

  it('calls onChange when event is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<EventSelector onChange={onChange} />, { wrapper: createWrapper() });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '100FR');

    expect(onChange).toHaveBeenCalled();
  });

  it('shows error message when provided', () => {
    render(<EventSelector error="Event is required" />, { wrapper: createWrapper() });
    expect(screen.getByText('Event is required')).toBeInTheDocument();
  });
});

describe('TimeEntryForm', () => {
  it('renders form fields', async () => {
    render(<TimeEntryForm meetId={mockMeet.id} />, { wrapper: createWrapper() });

    // Check for form elements
    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <TimeEntryForm meetId={mockMeet.id} onSuccess={onSuccess} />,
      { wrapper: createWrapper() }
    );

    // Wait for times to be fetched
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Select event - use 200FR since 100FR is already taken for this meet
    const eventSelect = screen.getByRole('combobox');
    await user.selectOptions(eventSelect, '200FR');

    // Enter time
    const timeInput = screen.getByPlaceholderText(/28\.45/i);
    await user.type(timeInput, '2:15.50');

    // Submit
    const submitButton = screen.getByRole('button', { name: /add time/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <TimeEntryForm meetId={mockMeet.id} onCancel={onCancel} />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('shows save changes button when editing', async () => {
    render(
      <TimeEntryForm initialData={mockTime} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
  });
});

describe('QuickEntryForm', () => {
  it('renders with entry row', async () => {
    render(<QuickEntryForm meetId={mockMeet.id} />, { wrapper: createWrapper() });

    // Should have event select and time input
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText(/SS\.ss/i)).toBeInTheDocument();
  });

  it('adds new entry row when clicking add button', async () => {
    const user = userEvent.setup();
    render(<QuickEntryForm meetId={mockMeet.id} />, { wrapper: createWrapper() });

    const initialSelects = screen.getAllByRole('combobox');
    const addButton = screen.getByRole('button', { name: /add another time/i });
    await user.click(addButton);

    // Should now have more selects
    const newSelects = screen.getAllByRole('combobox');
    expect(newSelects.length).toBeGreaterThan(initialSelects.length);
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<QuickEntryForm meetId={mockMeet.id} />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole('button', { name: /save all times/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/add at least one time entry/i)).toBeInTheDocument();
    });
  });

  it('submits batch times successfully', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <QuickEntryForm meetId={mockMeet.id} onSuccess={onSuccess} />,
      { wrapper: createWrapper() }
    );

    // Fill in the first entry - select first combobox (event selector)
    // Use 200FR since 100FR is already in the mock data for this meet
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '200FR');

    // Fill in time
    const timeInputs = screen.getAllByPlaceholderText(/SS\.ss/i);
    await user.type(timeInputs[0], '2:15.50');

    // Submit
    const submitButton = screen.getByRole('button', { name: /save all times/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows PB notification after successful batch submit', async () => {
    const user = userEvent.setup();

    render(
      <QuickEntryForm meetId={mockMeet.id} />,
      { wrapper: createWrapper() }
    );

    // Fill in entry - use 200FR since 100FR is already in the mock data
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '200FR');

    const timeInputs = screen.getAllByPlaceholderText(/SS\.ss/i);
    await user.type(timeInputs[0], '2:15.50');

    // Submit
    const submitButton = screen.getByRole('button', { name: /save all times/i });
    await user.click(submitButton);

    // The mock returns 100FR as a new PB
    await waitFor(() => {
      expect(screen.getByText(/times saved/i)).toBeInTheDocument();
    });
    // Should show View Meet button
    expect(screen.getByRole('button', { name: /view meet/i })).toBeInTheDocument();
    // Should show Add More button
    expect(screen.getByRole('button', { name: /add more/i })).toBeInTheDocument();
  });

  it('excludes already-entered events from dropdown', async () => {
    render(
      <QuickEntryForm meetId={mockMeet.id} />,
      { wrapper: createWrapper() }
    );

    // Wait for the form to load AND for the times query to complete
    // The dropdown should eventually NOT contain 100FR since it's already recorded for this meet
    await waitFor(() => {
      const select = screen.getByRole('combobox');
      const options = select.querySelectorAll('option');
      const has100FR = Array.from(options).some(opt => opt.value === '100FR');
      expect(has100FR).toBe(false);
    }, { timeout: 3000 });
    
    // But it should have 200FR which is available
    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');
    const has200FR = Array.from(options).some(opt => opt.value === '200FR');
    expect(has200FR).toBe(true);
  });
});

// Mock auth store for TimeHistory tests
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

describe('QuickEntryForm MeetSelector Integration', () => {
  it('shows meet selector when no meetId provided', async () => {
    render(<QuickEntryForm courseType="25m" />, { wrapper: createWrapper() });

    // Should show meet selector - wait for it to load
    await waitFor(() => {
      expect(screen.getByLabelText(/meet/i)).toBeInTheDocument();
    });
  });

  it('submits successfully when meet and time are filled in', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(<QuickEntryForm courseType="25m" onSuccess={onSuccess} />, { wrapper: createWrapper() });

    // Wait for meets to load
    await waitFor(() => {
      const meetSelect = screen.getByLabelText(/meet/i);
      expect(meetSelect).toBeInTheDocument();
    });

    // Select a meet
    const meetSelect = screen.getByLabelText(/meet/i);
    await user.selectOptions(meetSelect, mockMeet.id);

    // Wait for the times to be fetched for the selected meet
    await waitFor(() => {
      const allSelects = screen.getAllByRole('combobox');
      expect(allSelects.length).toBeGreaterThan(1);
    });

    // Find and fill in event selector
    // The selects are: meet selector, event selector
    const allSelects = screen.getAllByRole('combobox');
    // Find the event selector (not the meet one, has 200FR option - since 100FR is already taken)
    for (const select of allSelects) {
      const options = select.querySelectorAll('option');
      const has200FR = Array.from(options).some(opt => opt.value === '200FR');
      if (has200FR) {
        await user.selectOptions(select, '200FR');
        break;
      }
    }

    // Fill in time
    const timeInputs = screen.getAllByPlaceholderText(/SS\.ss/i);
    await user.type(timeInputs[0], '2:15.50');

    // Submit
    const submitButton = screen.getByRole('button', { name: /save all times/i });
    await user.click(submitButton);

    // Should succeed and show success message
    await waitFor(() => {
      expect(screen.getByText(/times saved/i)).toBeInTheDocument();
    });
    // Should show View Meet button
    expect(screen.getByRole('button', { name: /view meet/i })).toBeInTheDocument();
  });
});

describe('TimeHistory Link Navigation', () => {
  it('renders event names as links to All Times page', async () => {
    render(<TimeHistory courseType="25m" />, { wrapper: createWrapper() });

    // Wait for times to load
    await waitFor(() => {
      expect(screen.getByText('100m Freestyle')).toBeInTheDocument();
    });

    // Check that event name is a link
    const eventLink = screen.getByRole('link', { name: /view all times for 100m freestyle/i });
    expect(eventLink).toHaveAttribute('href', '/all-times?event=100FR');
  });

  it('renders meet names as links to Meet Details page', async () => {
    render(<TimeHistory courseType="25m" />, { wrapper: createWrapper() });

    // Wait for times to load
    await waitFor(() => {
      expect(screen.getByText('Test Championship')).toBeInTheDocument();
    });

    // Check that meet name is a link
    const meetLink = screen.getByRole('link', { name: /view details for test championship/i });
    expect(meetLink).toHaveAttribute('href', `/meets/${mockMeet.id}`);
  });
});
