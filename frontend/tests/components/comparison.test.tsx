import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { StatusBadge } from '@/components/comparison/StatusBadge';
import { ComparisonSummary } from '@/components/comparison/ComparisonSummary';
import { ComparisonTable } from '@/components/comparison/ComparisonTable';
import { StandardSelector } from '@/components/comparison/StandardSelector';
import { Compare } from '@/pages/Compare';

// Mock the course filter store
vi.mock('@/stores/courseFilterStore', () => ({
  useCourseType: () => '25m',
  useCourseFilterStore: vi.fn(() => ({ courseType: '25m' })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
};

describe('StatusBadge', () => {
  it('renders achieved status correctly', () => {
    render(<StatusBadge status="achieved" />);
    expect(screen.getByText('Achieved')).toBeInTheDocument();
  });

  it('renders almost status correctly', () => {
    render(<StatusBadge status="almost" />);
    expect(screen.getByText('Almost')).toBeInTheDocument();
  });

  it('renders not_achieved status correctly', () => {
    render(<StatusBadge status="not_achieved" />);
    expect(screen.getByText('Not Yet')).toBeInTheDocument();
  });

  it('renders no_time status correctly', () => {
    render(<StatusBadge status="no_time" />);
    expect(screen.getByText('No Time')).toBeInTheDocument();
  });

  it('renders no_standard status correctly', () => {
    render(<StatusBadge status="no_standard" />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});

describe('ComparisonSummary', () => {
  const mockSummary = {
    total_events: 17,
    achieved: 3,
    almost: 2,
    not_achieved: 5,
    no_time: 7,
  };

  it('renders summary statistics correctly', () => {
    render(<ComparisonSummary summary={mockSummary} thresholdPercent={3.0} />);

    expect(screen.getByText('3')).toBeInTheDocument(); // Achieved
    expect(screen.getByText('2')).toBeInTheDocument(); // Almost
    expect(screen.getByText('5')).toBeInTheDocument(); // Not Yet
    expect(screen.getByText('10')).toBeInTheDocument(); // Events Tracked (17 - 7)
  });

  it('shows threshold percentage', () => {
    render(<ComparisonSummary summary={mockSummary} thresholdPercent={3.0} />);
    expect(screen.getByText(/3%/)).toBeInTheDocument();
  });
});

describe('ComparisonTable', () => {
  const mockComparisons = [
    {
      event: '50FR',
      status: 'achieved' as const,
      swimmer_time_ms: 28000,
      swimmer_time_formatted: '28.00',
      standard_time_ms: 28500,
      standard_time_formatted: '28.50',
      difference_ms: -500,
      difference_formatted: '-0.50',
      difference_percent: -1.75,
      age_group: '13-14',
      meet_name: 'Test Meet',
      date: '2026-01-15',
    },
    {
      event: '100FR',
      status: 'almost' as const,
      swimmer_time_ms: 63500,
      swimmer_time_formatted: '1:03.50',
      standard_time_ms: 62000,
      standard_time_formatted: '1:02.00',
      difference_ms: 1500,
      difference_formatted: '+1.50',
      difference_percent: 2.4,
      age_group: '13-14',
      meet_name: 'Test Meet',
      date: '2026-01-15',
    },
    {
      event: '50BK',
      status: 'no_time' as const,
      swimmer_time_ms: null,
      swimmer_time_formatted: null,
      standard_time_ms: 32000,
      standard_time_formatted: '32.00',
      difference_ms: null,
      difference_formatted: null,
      difference_percent: null,
      age_group: '13-14',
      meet_name: null,
      date: null,
    },
  ];

  it('renders comparison rows', () => {
    render(<ComparisonTable comparisons={mockComparisons} />, { wrapper: createWrapper() });

    expect(screen.getByText('50m Free')).toBeInTheDocument();
    expect(screen.getByText('100m Free')).toBeInTheDocument();
    expect(screen.getByText('28.00')).toBeInTheDocument();
    expect(screen.getByText('1:03.50')).toBeInTheDocument();
  });

  it('hides events without times by default', () => {
    render(<ComparisonTable comparisons={mockComparisons} />, { wrapper: createWrapper() });

    // 50BK has no_time status and should be hidden
    expect(screen.queryByText('50m Back')).not.toBeInTheDocument();
  });

  it('shows events without times when showNoTime is true', () => {
    render(<ComparisonTable comparisons={mockComparisons} showNoTime />, { wrapper: createWrapper() });

    expect(screen.getByText('50m Back')).toBeInTheDocument();
  });

  it('shows status badges', () => {
    render(<ComparisonTable comparisons={mockComparisons} />, { wrapper: createWrapper() });

    expect(screen.getByText('Achieved')).toBeInTheDocument();
    expect(screen.getByText('Almost')).toBeInTheDocument();
  });

  it('shows time differences beneath standard times', () => {
    render(<ComparisonTable comparisons={mockComparisons} />, { wrapper: createWrapper() });

    // Differences are now shown inline with percentage beneath standard time
    expect(screen.getByText(/-0\.50/)).toBeInTheDocument();
    expect(screen.getByText(/\+1\.50/)).toBeInTheDocument();
  });

  it('shows meet names', () => {
    render(<ComparisonTable comparisons={mockComparisons} />, { wrapper: createWrapper() });

    expect(screen.getAllByText('Test Meet')).toHaveLength(2);
  });

  it('groups events by stroke', () => {
    render(<ComparisonTable comparisons={mockComparisons} />, { wrapper: createWrapper() });

    expect(screen.getByText('Freestyle')).toBeInTheDocument();
  });

  it('renders event names as clickable links to All Times page', () => {
    render(<ComparisonTable comparisons={mockComparisons} />, { wrapper: createWrapper() });

    // Check that event name is a link
    const eventLink = screen.getByRole('link', { name: /view all times for 50m freestyle/i });
    expect(eventLink).toHaveAttribute('href', '/all-times?event=50FR');
  });
});

describe('StandardSelector', () => {
  it('renders select dropdown', async () => {
    const onChange = vi.fn();

    render(<StandardSelector value="" onChange={onChange} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('calls onChange when selection changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<StandardSelector value="" onChange={onChange} />, {
      wrapper: createWrapper(),
    });

    // Wait for standards to load (check for option with actual standard name)
    await waitFor(() => {
      expect(screen.getByText('Test Standard')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'standard-1');

    expect(onChange).toHaveBeenCalledWith('standard-1');
  });
});

describe('Compare Page', () => {
  it('renders page title', async () => {
    render(<Compare />, { wrapper: createWrapper() });

    expect(screen.getByText('Compare')).toBeInTheDocument();
    expect(
      screen.getByText('Compare your personal bests against time standards.')
    ).toBeInTheDocument();
  });

  it('shows empty state when no standard selected', async () => {
    render(<Compare />, { wrapper: createWrapper() });

    expect(
      screen.getByText('Select a time standard above to see how your times compare.')
    ).toBeInTheDocument();
  });

  it('shows comparison results when standard is selected', async () => {
    const user = userEvent.setup();

    render(<Compare />, { wrapper: createWrapper() });

    // Wait for standards to load (check for option with actual standard name)
    await waitFor(() => {
      expect(screen.getByText('Test Standard')).toBeInTheDocument();
    });

    // Select a standard
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'standard-1');

    // Wait for comparison to load - standard name appears as card title
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Standard' })).toBeInTheDocument();
    });

    // Check summary counts are displayed in header
    expect(screen.getAllByText('Achieved').length).toBeGreaterThan(0);
  });

  it('has toggle to show events without times', async () => {
    const user = userEvent.setup();

    render(<Compare />, { wrapper: createWrapper() });

    // Wait for standards to load (check for option with actual standard name)
    await waitFor(() => {
      expect(screen.getByText('Test Standard')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'standard-1');

    // Wait for comparison to load - standard name appears as card title
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Standard' })).toBeInTheDocument();
    });

    // Find the checkbox
    const checkbox = screen.getByRole('checkbox', {
      name: /show events without times/i,
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });
});
