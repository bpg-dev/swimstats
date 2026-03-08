import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders message text', () => {
    render(<EmptyState message="No times recorded yet." />);
    expect(screen.getByText('No times recorded yet.')).toBeInTheDocument();
  });

  it('renders detail text when provided', () => {
    render(<EmptyState message="No data" detail="Try adding something." />);
    expect(screen.getByText('Try adding something.')).toBeInTheDocument();
  });

  it('renders an SVG icon by default', () => {
    const { container } = render(<EmptyState message="Empty" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.classList.toString()).toContain('text-slate-400');
  });

  it('does not render emoji', () => {
    const { container } = render(<EmptyState message="Empty" />);
    expect(container.textContent).not.toContain('🏊');
  });

  it('uses consistent padding', () => {
    const { container } = render(<EmptyState message="Empty" />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('py-12');
    expect(wrapper?.className).toContain('text-center');
  });
});
