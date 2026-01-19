import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { TimeEntryForm } from '@/components/times/TimeEntryForm';
import { QuickEntryForm } from '@/components/times/QuickEntryForm';
import { EventSelector } from '@/components/times/EventSelector';
import { mockMeet, mockTime } from '../mocks/handlers';

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

    // Select event
    const eventSelect = screen.getByRole('combobox');
    await user.selectOptions(eventSelect, '100FR');

    // Enter time
    const timeInput = screen.getByPlaceholderText(/28\.45/i);
    await user.type(timeInput, '1:05.32');

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
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '100FR');

    // Fill in time
    const timeInputs = screen.getAllByPlaceholderText(/SS\.ss/i);
    await user.type(timeInputs[0], '1:05.32');

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

    // Fill in entry
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '100FR');

    const timeInputs = screen.getAllByPlaceholderText(/SS\.ss/i);
    await user.type(timeInputs[0], '1:05.32');

    // Submit
    const submitButton = screen.getByRole('button', { name: /save all times/i });
    await user.click(submitButton);

    // The mock returns 100FR as a new PB
    await waitFor(() => {
      expect(screen.getByText(/new personal bests/i)).toBeInTheDocument();
    });
  });
});

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

    // Find and fill in event selector
    // The selects are: meet selector, event selector
    const allSelects = screen.getAllByRole('combobox');
    // Find the event selector (not the meet one, has 100FR option)
    for (const select of allSelects) {
      const options = select.querySelectorAll('option');
      const has100FR = Array.from(options).some(opt => opt.value === '100FR');
      if (has100FR) {
        await user.selectOptions(select, '100FR');
        break;
      }
    }

    // Fill in time
    const timeInputs = screen.getAllByPlaceholderText(/SS\.ss/i);
    await user.type(timeInputs[0], '1:05.32');

    // Submit
    const submitButton = screen.getByRole('button', { name: /save all times/i });
    await user.click(submitButton);

    // Should succeed and show PB notification
    await waitFor(() => {
      expect(screen.getByText(/new personal bests/i)).toBeInTheDocument();
    });
  });
});
