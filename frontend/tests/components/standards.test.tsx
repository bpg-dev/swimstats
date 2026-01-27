import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { StandardList } from '@/components/standards/StandardList';
import { StandardForm } from '@/components/standards/StandardForm';
import { StandardTimesEditor } from '@/components/standards/StandardTimesEditor';
import { mockStandard, mockStandardWithTimes } from '../mocks/handlers';

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

describe('StandardList', () => {
  it('renders standards after loading', async () => {
    render(<StandardList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Standard')).toBeInTheDocument();
    });

    // Check course type badge
    expect(screen.getByText('25m')).toBeInTheDocument();
    // Check gender badge
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('calls onSelectStandard when a standard is clicked', async () => {
    const user = userEvent.setup();
    const onSelectStandard = vi.fn();

    render(<StandardList onSelectStandard={onSelectStandard} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Standard')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Test Standard'));

    expect(onSelectStandard).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockStandard.id,
        name: mockStandard.name,
      })
    );
  });

  it('displays header with title', async () => {
    render(<StandardList showHeader />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Standards')).toBeInTheDocument();
    });
  });

  it('renders links to standard details page when linkToDetails is true', async () => {
    render(<StandardList linkToDetails />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Standard')).toBeInTheDocument();
    });

    // Check that the standard item is a link
    const link = screen.getByRole('link', { name: /test standard/i });
    expect(link).toHaveAttribute('href', `/standards/${mockStandard.id}`);
  });
});

describe('StandardForm', () => {
  it('renders form fields', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(<StandardForm onSubmit={onSubmit} onCancel={onCancel} />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/course type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(<StandardForm onSubmit={onSubmit} onCancel={onCancel} />, { wrapper: createWrapper() });

    // Fill in the name
    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, 'New Standard');

    const submitButton = screen.getByRole('button', { name: /create standard/i });
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Standard',
        course_type: '25m',
        gender: 'female',
      })
    );
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(<StandardForm onSubmit={onSubmit} onCancel={onCancel} />, { wrapper: createWrapper() });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('shows update button when editing', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <StandardForm standard={mockStandard} onSubmit={onSubmit} onCancel={onCancel} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /update standard/i })).toBeInTheDocument();
  });

  it('pre-fills form when editing existing standard', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <StandardForm standard={mockStandard} onSubmit={onSubmit} onCancel={onCancel} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByDisplayValue('Test Standard')).toBeInTheDocument();
  });
});

describe('StandardTimesEditor', () => {
  it('renders time input fields', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <StandardTimesEditor times={[]} onSave={onSave} onCancel={onCancel} />,
      { wrapper: createWrapper() }
    );

    // Check for some event names
    expect(screen.getByText('50 Free')).toBeInTheDocument();
    expect(screen.getByText('100 Free')).toBeInTheDocument();
    expect(screen.getByText('200 IM')).toBeInTheDocument();
  });

  it('pre-fills times when provided', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <StandardTimesEditor times={mockStandardWithTimes.times} onSave={onSave} onCancel={onCancel} />,
      { wrapper: createWrapper() }
    );

    // Check for pre-filled values
    expect(screen.getByDisplayValue('28.50')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1:02.00')).toBeInTheDocument();
  });

  it('calls onSave with entered times', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <StandardTimesEditor times={[]} onSave={onSave} onCancel={onCancel} />,
      { wrapper: createWrapper() }
    );

    // Find and fill a time input (50 Free, 13-14)
    const inputs = screen.getAllByPlaceholderText('--');
    // The third input should be 50 Free, 13-14 (after 10U and 11-12)
    await user.type(inputs[2], '28.50');

    const saveButton = screen.getByRole('button', { name: /save times/i });
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          event: '50FR',
          age_group: '13-14',
          time_ms: 28500,
        }),
      ])
    );
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <StandardTimesEditor times={[]} onSave={onSave} onCancel={onCancel} />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });
});
