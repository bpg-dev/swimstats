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
});
