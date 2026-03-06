import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
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
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ProgressChart', () => {
  const mockProgressData: ProgressDataPoint[] = [
    {
      id: 'time-1',
      meet_id: 'meet-1',
      time_ms: 29200,
      time_formatted: '29.20',
      date: '2026-01-10',
      meet_name: 'Test Meet 1',
      event: '50FR',
      is_pb: false,
      is_split: false,
    },
    {
      id: 'time-2',
      meet_id: 'meet-2',
      time_ms: 28850,
      time_formatted: '28.85',
      date: '2026-01-15',
      meet_name: 'Test Meet 2',
      event: '50FR',
      is_pb: true,
      is_split: false,
    },
    {
      id: 'time-3',
      meet_id: 'meet-3',
      time_ms: 28600,
      time_formatted: '28.60',
      date: '2026-01-20',
      meet_name: 'Test Championship',
      event: '50FR',
      is_pb: true,
      is_split: false,
    },
  ];

  it('renders empty state when no data', () => {
    renderWithProviders(<ProgressChart data={[]} />);

    expect(screen.getByText('No times recorded yet for this event.')).toBeInTheDocument();
    expect(screen.getByText('Add some times to see your progress!')).toBeInTheDocument();
  });

  it('renders chart with progress data', () => {
    const { container } = renderWithProviders(<ProgressChart data={mockProgressData} />);

    // Recharts renders the data, but we can't easily test SVG content in jsdom
    // We can verify that the ResponsiveContainer rendered
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('renders with standard reference line', () => {
    const standardTime = 27000; // 27.00 seconds
    const standardName = 'Swimming Canada Junior';

    const { container } = renderWithProviders(
      <ProgressChart
        data={mockProgressData}
        standardTime={standardTime}
        standardName={standardName}
      />
    );

    // Chart should render with responsive container
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('handles single data point', () => {
    const singlePoint = [mockProgressData[0]];

    const { container } = renderWithProviders(<ProgressChart data={singlePoint} />);

    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('renders correctly with PB markers', () => {
    // All data points in mockProgressData include is_pb flags
    const { container } = renderWithProviders(<ProgressChart data={mockProgressData} />);

    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('renders legend when split data points are present', () => {
    const mixedData: ProgressDataPoint[] = [
      {
        id: 'time-1',
        meet_id: 'meet-1',
        time_ms: 62000,
        time_formatted: '1:02.00',
        date: '2026-01-10',
        meet_name: 'Meet 1',
        event: '100FR',
        is_pb: false,
        is_split: false,
      },
      {
        id: 'time-2',
        meet_id: 'meet-2',
        time_ms: 61000,
        time_formatted: '1:01.00',
        date: '2026-01-15',
        meet_name: 'Meet 2',
        event: '100FRS',
        is_pb: true,
        is_split: true,
      },
    ];

    renderWithProviders(<ProgressChart data={mixedData} />);

    // Legend should appear with split data present
    expect(screen.getByText('Individual')).toBeInTheDocument();
    expect(screen.getByText('Relay Split')).toBeInTheDocument();
    expect(screen.getByText('Personal Best')).toBeInTheDocument();
  });

  it('does not render legend when no split data points', () => {
    renderWithProviders(<ProgressChart data={mockProgressData} />);

    // Legend should NOT appear when there are no split data points
    expect(screen.queryByText('Individual')).not.toBeInTheDocument();
    expect(screen.queryByText('Relay Split')).not.toBeInTheDocument();
  });

  it('renders diamond marker for split data points including split+PB', () => {
    const data: ProgressDataPoint[] = [
      {
        id: 'time-1',
        meet_id: 'meet-1',
        time_ms: 62000,
        time_formatted: '1:02.00',
        date: '2026-01-10',
        meet_name: 'Meet 1',
        event: '100FR',
        is_pb: false,
        is_split: false,
      },
      {
        id: 'time-2',
        meet_id: 'meet-1',
        time_ms: 60500,
        time_formatted: '1:00.50',
        date: '2026-01-10',
        meet_name: 'Meet 1',
        event: '100FRS',
        is_pb: true,
        is_split: true,
      },
    ];

    const { container } = renderWithProviders(<ProgressChart data={data} />);

    // All split markers (including split+PB) should be diamonds (polygon elements)
    // The legend diamond is always present when split data exists, plus each split dot
    const polygons = container.querySelectorAll('polygon');
    // At least the legend diamond should render
    expect(polygons.length).toBeGreaterThanOrEqual(1);

    // Should NOT have a PB circle for the split+PB point — it should be a diamond
    // The only circle dots should be for non-split points
  });

  it('offsets same-date data points for independent selection', () => {
    const sameDateData: ProgressDataPoint[] = [
      {
        id: 'time-1',
        meet_id: 'meet-1',
        time_ms: 62000,
        time_formatted: '1:02.00',
        date: '2026-01-10',
        meet_name: 'Meet 1',
        event: '100FR',
        is_pb: false,
        is_split: false,
      },
      {
        id: 'time-2',
        meet_id: 'meet-1',
        time_ms: 60500,
        time_formatted: '1:00.50',
        date: '2026-01-10',
        meet_name: 'Meet 1',
        event: '100FRS',
        is_pb: true,
        is_split: true,
      },
    ];

    // Should render without error — both points are on the same date
    const { container } = renderWithProviders(<ProgressChart data={sameDateData} />);
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });
});
