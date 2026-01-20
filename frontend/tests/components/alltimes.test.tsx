import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EventFilter } from '@/components/times/EventFilter';
import { SortToggle } from '@/components/times/SortToggle';
import { AllTimesList } from '@/components/times/AllTimesList';
import { TimeRecord } from '@/types/time';

// Test helper to render with React Query provider
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('EventFilter', () => {
  it('renders with event options (no "All Events" option)', () => {
    const onChange = vi.fn();
    render(<EventFilter value="50FR" onChange={onChange} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    // Should have event options, not "All Events"
    expect(screen.getByText('50m Freestyle')).toBeInTheDocument();
    expect(screen.queryByText('All Events')).not.toBeInTheDocument();
  });

  it('renders stroke groups', () => {
    const onChange = vi.fn();
    render(<EventFilter value="" onChange={onChange} />);
    
    expect(screen.getByRole('group', { name: 'Freestyle' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Backstroke' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Breaststroke' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Butterfly' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Individual Medley' })).toBeInTheDocument();
  });

  it('calls onChange when event is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EventFilter value="" onChange={onChange} />);
    
    await user.selectOptions(screen.getByRole('combobox'), '100FR');
    expect(onChange).toHaveBeenCalledWith('100FR');
  });
});

describe('SortToggle', () => {
  it('renders both sort options', () => {
    const onChange = vi.fn();
    render(<SortToggle value="date" onChange={onChange} />);
    
    expect(screen.getByText(/Newest/)).toBeInTheDocument();
    expect(screen.getByText(/Fastest/)).toBeInTheDocument();
  });

  it('highlights the selected option', () => {
    const onChange = vi.fn();
    const { rerender } = render(<SortToggle value="date" onChange={onChange} />);
    
    const newestButton = screen.getByText(/Newest/).closest('button');
    expect(newestButton).toHaveClass('bg-white');
    
    rerender(<SortToggle value="time" onChange={onChange} />);
    const fastestButton = screen.getByText(/Fastest/).closest('button');
    expect(fastestButton).toHaveClass('bg-white');
  });

  it('calls onChange when clicking sort option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortToggle value="date" onChange={onChange} />);
    
    await user.click(screen.getByText(/Fastest/));
    expect(onChange).toHaveBeenCalledWith('time');
  });
});

describe('AllTimesList', () => {
  const mockTimes: TimeRecord[] = [
    {
      id: '1',
      meet_id: 'meet-1',
      event: '100FR',
      time_ms: 62450, // 1:02.45
      time_formatted: '1:02.45',
      notes: 'Finals',
      meet: {
        id: 'meet-1',
        name: 'Winter Champs',
        city: 'Vancouver',
        country: 'Canada',
        date: '2026-01-15',
        course_type: '25m',
      },
    },
    {
      id: '2',
      meet_id: 'meet-2',
      event: '100FR',
      time_ms: 63120, // 1:03.12
      time_formatted: '1:03.12',
      meet: {
        id: 'meet-2',
        name: 'Fall Classic',
        city: 'Calgary',
        country: 'Canada',
        date: '2025-10-20',
        course_type: '25m',
      },
    },
    {
      id: '3',
      meet_id: 'meet-3',
      event: '100FR',
      time_ms: 61500, // 1:01.50 - PB
      time_formatted: '1:01.50',
      notes: 'Best swim',
      meet: {
        id: 'meet-3',
        name: 'Spring Meet',
        city: 'Toronto',
        country: 'Canada',
        date: '2025-05-10',
        course_type: '25m',
      },
    },
  ];

  it('renders empty state when no times', () => {
    renderWithProviders(<AllTimesList times={[]} sortBy="date" />);
    
    expect(screen.getByText(/No times recorded yet/)).toBeInTheDocument();
  });

  it('renders times with meet info', () => {
    renderWithProviders(<AllTimesList times={mockTimes} sortBy="date" />);
    
    expect(screen.getByText('1:02.45')).toBeInTheDocument();
    expect(screen.getByText('1:03.12')).toBeInTheDocument();
    expect(screen.getByText('1:01.50')).toBeInTheDocument();
    expect(screen.getByText('Winter Champs')).toBeInTheDocument();
    expect(screen.getByText('Fall Classic')).toBeInTheDocument();
    expect(screen.getByText('Spring Meet')).toBeInTheDocument();
  });

  it('highlights PB time with badge', () => {
    renderWithProviders(
      <AllTimesList times={mockTimes} pbTimeId="3" sortBy="date" />
    );
    
    // PB badge should appear (component uses "PB", not "PB!")
    expect(screen.getByText('PB')).toBeInTheDocument();
  });

  it('sorts by date (newest first) when sortBy is date', () => {
    renderWithProviders(<AllTimesList times={mockTimes} sortBy="date" />);
    
    const timeCards = screen.getAllByText(/1:0\d\.\d{2}/);
    // Newest date is 2026-01-15 (time: 1:02.45)
    expect(timeCards[0]).toHaveTextContent('1:02.45');
  });

  it('sorts by time (fastest first) when sortBy is time', () => {
    renderWithProviders(<AllTimesList times={mockTimes} sortBy="time" />);
    
    const timeCards = screen.getAllByText(/1:0\d\.\d{2}/);
    // Fastest is 1:01.50
    expect(timeCards[0]).toHaveTextContent('1:01.50');
  });

  it('shows rank badges when sorting by time', () => {
    renderWithProviders(<AllTimesList times={mockTimes} sortBy="time" />);
    
    // Ranks should appear
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays notes when present', () => {
    renderWithProviders(<AllTimesList times={mockTimes} sortBy="date" />);
    
    expect(screen.getByText('Finals')).toBeInTheDocument();
  });
});
