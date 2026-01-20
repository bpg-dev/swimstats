import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersonalBestCard } from '@/components/comparison/PersonalBestCard';
import { PersonalBestGrid } from '@/components/comparison/PersonalBestGrid';
import { NewPBBadge } from '@/components/times/NewPBBadge';
import { PersonalBest } from '@/types/personalbest';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
  );
};

describe('NewPBBadge', () => {
  it('renders correctly', () => {
    render(<NewPBBadge />);
    expect(screen.getByText('PB!')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<NewPBBadge className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('PersonalBestCard', () => {
  const mockPB: PersonalBest = {
    event: '100FR',
    time_ms: 65320,
    time_formatted: '1:05.32',
    time_id: 'time-1',
    meet: 'Test Championship',
    date: '2026-01-15',
  };

  it('renders personal best details', () => {
    renderWithProviders(<PersonalBestCard pb={mockPB} />);

    expect(screen.getByText('100m Freestyle')).toBeInTheDocument();
    expect(screen.getByText('1:05.32')).toBeInTheDocument();
    expect(screen.getByText('Test Championship')).toBeInTheDocument();
    expect(screen.getByText('2026-01-15')).toBeInTheDocument();
  });

  it('handles unknown event codes', () => {
    const unknownPB = { ...mockPB, event: 'UNKNOWN' as PersonalBest['event'] };
    renderWithProviders(<PersonalBestCard pb={unknownPB} />);

    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
    expect(screen.getByText('1:05.32')).toBeInTheDocument();
  });
});

describe('PersonalBestGrid', () => {
  const mockPBs: PersonalBest[] = [
    {
      event: '50FR',
      time_ms: 28500,
      time_formatted: '28.50',
      time_id: 'time-1',
      meet: 'Test Meet 1',
      date: '2026-01-10',
    },
    {
      event: '100FR',
      time_ms: 65320,
      time_formatted: '1:05.32',
      time_id: 'time-2',
      meet: 'Test Meet 2',
      date: '2026-01-15',
    },
    {
      event: '100BK',
      time_ms: 72000,
      time_formatted: '1:12.00',
      time_id: 'time-3',
      meet: 'Test Meet 3',
      date: '2026-01-20',
    },
    {
      event: '200IM',
      time_ms: 180000,
      time_formatted: '3:00.00',
      time_id: 'time-4',
      meet: 'Test Meet 4',
      date: '2026-01-25',
    },
  ];

  it('renders empty state when no personal bests', () => {
    renderWithProviders(<PersonalBestGrid personalBests={[]} />);

    expect(screen.getByText('No Personal Bests Yet')).toBeInTheDocument();
    expect(
      screen.getByText(/Start recording swim times/)
    ).toBeInTheDocument();
  });

  it('groups personal bests by stroke', () => {
    renderWithProviders(<PersonalBestGrid personalBests={mockPBs} />);

    // Check stroke section headers
    expect(screen.getByText('Freestyle')).toBeInTheDocument();
    expect(screen.getByText('Backstroke')).toBeInTheDocument();
    expect(screen.getByText('Individual Medley')).toBeInTheDocument();
  });

  it('displays event count per stroke', () => {
    renderWithProviders(<PersonalBestGrid personalBests={mockPBs} />);

    // Freestyle has 2 events
    expect(screen.getByText('(2 events)')).toBeInTheDocument();

    // Backstroke and IM have 1 event each
    const singleEventLabels = screen.getAllByText('(1 event)');
    expect(singleEventLabels.length).toBe(2);
  });

  it('renders all personal best cards', () => {
    renderWithProviders(<PersonalBestGrid personalBests={mockPBs} />);

    expect(screen.getByText('50m Freestyle')).toBeInTheDocument();
    expect(screen.getByText('100m Freestyle')).toBeInTheDocument();
    expect(screen.getByText('100m Backstroke')).toBeInTheDocument();
    expect(screen.getByText('200m IM')).toBeInTheDocument();
  });

  it('displays times for all personal bests', () => {
    renderWithProviders(<PersonalBestGrid personalBests={mockPBs} />);

    expect(screen.getByText('28.50')).toBeInTheDocument();
    expect(screen.getByText('1:05.32')).toBeInTheDocument();
    expect(screen.getByText('1:12.00')).toBeInTheDocument();
    expect(screen.getByText('3:00.00')).toBeInTheDocument();
  });

  it('sorts events by distance within each stroke', () => {
    const { container } = renderWithProviders(
      <PersonalBestGrid personalBests={mockPBs} />
    );

    // Within Freestyle section, 50FR should come before 100FR
    const freestyleSection = container.querySelector('section');
    expect(freestyleSection).toBeTruthy();

    const cards = freestyleSection!.querySelectorAll('h4');
    const eventNames = Array.from(cards).map((c) => c.textContent);

    // 50m Freestyle should come before 100m Freestyle
    const fr50Index = eventNames.indexOf('50m Freestyle');
    const fr100Index = eventNames.indexOf('100m Freestyle');
    expect(fr50Index).toBeLessThan(fr100Index);
  });
});
