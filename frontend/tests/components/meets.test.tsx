import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { MeetList } from '@/components/meets/MeetList';
import { MeetForm } from '@/components/meets/MeetForm';
import { MeetSelector } from '@/components/meets/MeetSelector';
import { MeetTimesList } from '@/components/meets/MeetTimesList';
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

describe('MeetList', () => {
  it('renders meets after loading', async () => {
    render(<MeetList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Championship')).toBeInTheDocument();
    });

    // Check course type badge
    expect(screen.getByText('25m')).toBeInTheDocument();
  });

  it('calls onSelectMeet when a meet is clicked', async () => {
    const user = userEvent.setup();
    const onSelectMeet = vi.fn();

    render(<MeetList onSelectMeet={onSelectMeet} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Championship')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Test Championship'));

    expect(onSelectMeet).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockMeet.id,
        name: mockMeet.name,
      })
    );
  });

  it('shows time count badge when times exist', async () => {
    render(<MeetList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('5 times')).toBeInTheDocument();
    });
  });

  it('displays header with title', async () => {
    render(<MeetList showHeader />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Recent Meets')).toBeInTheDocument();
    });
  });
});

describe('MeetForm', () => {
  it('renders form fields', () => {
    render(<MeetForm />, { wrapper: createWrapper() });

    expect(screen.getByText('Meet Name')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Course Type')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(<MeetForm onSuccess={onSuccess} />, { wrapper: createWrapper() });

    // Fill in the form
    const inputs = screen.getAllByRole('textbox');
    await user.clear(inputs[0]); // Clear name
    await user.type(inputs[0], 'New Meet');
    await user.clear(inputs[1]); // Clear city
    await user.type(inputs[1], 'Ottawa');

    const submitButton = screen.getByRole('button', { name: /add meet/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<MeetForm onCancel={onCancel} />, { wrapper: createWrapper() });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('shows save changes button when editing', () => {
    render(
      <MeetForm initialData={mockMeet} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('pre-fills form when editing existing meet', () => {
    render(
      <MeetForm initialData={mockMeet} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByDisplayValue('Test Championship')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Toronto')).toBeInTheDocument();
  });
});

describe('MeetSelector', () => {
  it('renders select with meets after loading', async () => {
    render(<MeetSelector />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('shows label when provided', async () => {
    render(<MeetSelector label="Select Meet" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Select Meet')).toBeInTheDocument();
    });
  });

  it('calls onChange when a meet is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MeetSelector onChange={onChange} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, mockMeet.id);

    expect(onChange).toHaveBeenCalled();
  });
});

describe('MeetList with linkToDetails', () => {
  it('renders links to meet details page when linkToDetails is true', async () => {
    render(<MeetList linkToDetails />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Championship')).toBeInTheDocument();
    });

    // Check that the meet item is a link
    const link = screen.getByRole('link', { name: /test championship/i });
    expect(link).toHaveAttribute('href', `/meets/${mockMeet.id}`);
  });
});

describe('MeetTimesList', () => {
  it('renders times for a meet', async () => {
    render(<MeetTimesList meetId={mockMeet.id} courseType="25m" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('100m Freestyle')).toBeInTheDocument();
    });

    // Check time is displayed
    expect(screen.getByText('1:05.32')).toBeInTheDocument();
  });

  it('shows empty state when no times', async () => {
    render(<MeetTimesList meetId="no-times-meet" courseType="25m" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/no times recorded/i)).toBeInTheDocument();
    });
  });

  it('marks personal best times with PB badge', async () => {
    render(<MeetTimesList meetId={mockMeet.id} courseType="25m" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('1:05.32')).toBeInTheDocument();
    });

    // PB badge should be present
    expect(screen.getByText('PB')).toBeInTheDocument();
  });

  it('shows delete button for each time entry', async () => {
    render(<MeetTimesList meetId={mockMeet.id} courseType="25m" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('100m Freestyle')).toBeInTheDocument();
    });

    // Delete button should be present
    const deleteButton = screen.getByRole('button', { name: /delete 100m freestyle time/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('shows inline confirmation when delete is clicked', async () => {
    const user = userEvent.setup();

    render(<MeetTimesList meetId={mockMeet.id} courseType="25m" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('100m Freestyle')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete 100m freestyle time/i });
    await user.click(deleteButton);

    // Should show inline confirmation buttons
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel delete/i })).toBeInTheDocument();
  });

  it('cancels delete when cancel is clicked', async () => {
    const user = userEvent.setup();

    render(<MeetTimesList meetId={mockMeet.id} courseType="25m" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('100m Freestyle')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete 100m freestyle time/i });
    await user.click(deleteButton);

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel delete/i });
    await user.click(cancelButton);

    // Should be back to showing the delete button
    expect(screen.getByRole('button', { name: /delete 100m freestyle time/i })).toBeInTheDocument();
  });

  it('deletes time entry when confirmed', async () => {
    const user = userEvent.setup();

    render(<MeetTimesList meetId={mockMeet.id} courseType="25m" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('100m Freestyle')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete 100m freestyle time/i });
    await user.click(deleteButton);

    // Click confirm
    const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
    await user.click(confirmButton);

    // The delete should have been triggered (mutation called)
    // The confirmation buttons should no longer be visible
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /confirm delete/i })).not.toBeInTheDocument();
    });
  });
});
