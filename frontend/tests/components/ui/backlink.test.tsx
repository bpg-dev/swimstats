import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BackLink } from '@/components/ui/BackLink';

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: BrowserRouter });
}

describe('BackLink', () => {
  it('renders with destination text', () => {
    renderWithRouter(<BackLink to="/meets" label="Meets" />);
    const link = screen.getByRole('link', { name: /back to meets/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/meets');
    expect(link).toHaveTextContent('Back to Meets');
  });

  it('uses cyan color scheme', () => {
    renderWithRouter(<BackLink to="/standards" label="Standards" />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('text-cyan-600');
  });

  it('includes left arrow', () => {
    renderWithRouter(<BackLink to="/meets" label="Meets" />);
    expect(screen.getByText('←')).toBeInTheDocument();
  });
});
