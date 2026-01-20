import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProgressChart } from '@/components/charts/ProgressChart';
import { ProgressDataPoint } from '@/types/progress';

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

describe('ProgressChart', () => {
  const mockProgressData: ProgressDataPoint[] = [
    {
      id: 'time-1',
      time_ms: 29200,
      time_formatted: '29.20',
      date: '2026-01-10',
      meet_name: 'Test Meet 1',
      event: '50FR',
      is_pb: false,
    },
    {
      id: 'time-2',
      time_ms: 28850,
      time_formatted: '28.85',
      date: '2026-01-15',
      meet_name: 'Test Meet 2',
      event: '50FR',
      is_pb: true,
    },
    {
      id: 'time-3',
      time_ms: 28600,
      time_formatted: '28.60',
      date: '2026-01-20',
      meet_name: 'Test Championship',
      event: '50FR',
      is_pb: true,
    },
  ];

  it('renders empty state when no data', () => {
    renderWithProviders(<ProgressChart data={[]} />);

    expect(screen.getByText('No times recorded yet for this event.')).toBeInTheDocument();
    expect(screen.getByText('Add some times to see your progress!')).toBeInTheDocument();
  });

  it('renders chart with progress data', () => {
    renderWithProviders(<ProgressChart data={mockProgressData} />);

    // Recharts renders the data, but we can't easily test SVG content
    // We can verify that the component renders without errors
    const container = screen.getByRole('region', { hidden: true });
    expect(container).toBeInTheDocument();
  });

  it('renders with standard reference line', () => {
    const standardTime = 27000; // 27.00 seconds
    const standardName = 'Swimming Canada Junior';

    renderWithProviders(
      <ProgressChart
        data={mockProgressData}
        standardTime={standardTime}
        standardName={standardName}
      />
    );

    // Chart should render
    const container = screen.getByRole('region', { hidden: true });
    expect(container).toBeInTheDocument();
  });

  it('handles single data point', () => {
    const singlePoint = [mockProgressData[0]];

    renderWithProviders(<ProgressChart data={singlePoint} />);

    const container = screen.getByRole('region', { hidden: true });
    expect(container).toBeInTheDocument();
  });

  it('renders correctly with PB markers', () => {
    // All data points in mockProgressData include is_pb flags
    renderWithProviders(<ProgressChart data={mockProgressData} />);

    const container = screen.getByRole('region', { hidden: true });
    expect(container).toBeInTheDocument();
  });
});
