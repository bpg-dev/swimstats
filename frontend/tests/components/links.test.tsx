import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EventLink } from '@/components/ui/EventLink';
import { MeetLink } from '@/components/ui/MeetLink';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('EventLink', () => {
  it('renders with resolved event name', () => {
    renderWithRouter(<EventLink event="50FR" />);

    expect(screen.getByRole('link')).toHaveTextContent('50m Freestyle');
  });

  it('navigates to all-times with event filter', () => {
    renderWithRouter(<EventLink event="100BK" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/all-times?event=100BK');
  });

  it('renders custom children when provided', () => {
    renderWithRouter(<EventLink event="50FR">Custom Event Text</EventLink>);

    expect(screen.getByRole('link')).toHaveTextContent('Custom Event Text');
    expect(screen.queryByText('50m Freestyle')).not.toBeInTheDocument();
  });

  it('falls back to event code for unknown events', () => {
    // Type assertion to test unknown event behavior
    renderWithRouter(<EventLink event={'UNKNOWN' as never} />);

    expect(screen.getByRole('link')).toHaveTextContent('UNKNOWN');
  });

  it('merges custom className with defaults', () => {
    renderWithRouter(<EventLink event="50FR" className="custom-class" />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('custom-class');
    expect(link).toHaveClass('font-medium'); // default class
  });

  it('has correct aria-label for accessibility', () => {
    renderWithRouter(<EventLink event="200IM" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'View all times for 200m IM');
  });

  it('renders different events correctly', () => {
    const { rerender } = renderWithRouter(<EventLink event="50FR" />);
    expect(screen.getByRole('link')).toHaveTextContent('50m Freestyle');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/all-times?event=50FR');

    rerender(<BrowserRouter><EventLink event="100BR" /></BrowserRouter>);
    expect(screen.getByRole('link')).toHaveTextContent('100m Breaststroke');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/all-times?event=100BR');

    rerender(<BrowserRouter><EventLink event="400IM" /></BrowserRouter>);
    expect(screen.getByRole('link')).toHaveTextContent('400m IM');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/all-times?event=400IM');
  });
});

describe('MeetLink', () => {
  it('renders with meet name', () => {
    renderWithRouter(<MeetLink meetId="123" meetName="Ontario Championships" />);

    expect(screen.getByRole('link')).toHaveTextContent('Ontario Championships');
  });

  it('navigates to meet details page', () => {
    renderWithRouter(<MeetLink meetId="abc-123" meetName="Test Meet" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/meets/abc-123');
  });

  it('merges custom className with defaults', () => {
    renderWithRouter(<MeetLink meetId="123" meetName="Test Meet" className="my-custom-class" />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('my-custom-class');
    expect(link).toHaveClass('font-medium'); // default class
  });

  it('has correct aria-label for accessibility', () => {
    renderWithRouter(<MeetLink meetId="123" meetName="Provincial Championships" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'View details for Provincial Championships');
  });

  it('handles special characters in meet name', () => {
    renderWithRouter(<MeetLink meetId="123" meetName="Meet's Name & More!" />);

    expect(screen.getByRole('link')).toHaveTextContent("Meet's Name & More!");
  });

  it('handles UUID meet IDs', () => {
    const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    renderWithRouter(<MeetLink meetId={uuid} meetName="Test Meet" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/meets/${uuid}`);
  });
});
