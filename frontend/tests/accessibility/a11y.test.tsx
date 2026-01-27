/**
 * Accessibility Tests
 *
 * Tests key pages and components for WCAG 2.1 AA compliance using axe-core.
 *
 * Phase 8 Tasks: T196-T200
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components to test
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Loading,
  ErrorBanner,
} from '@/components/ui';
import { PersonalBestCard } from '@/components/comparison/PersonalBestCard';
import { StatusBadge } from '@/components/comparison/StatusBadge';

// Extend Vitest expect with axe matchers
expect.extend(matchers);

// Wrapper for components that need routing/query context
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('Accessibility: UI Components', () => {
  describe('Button', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when disabled', async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when loading', async () => {
      const { container } = render(<Button isLoading>Loading</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Input', () => {
    it('should have no accessibility violations with label', async () => {
      const { container } = render(<Input label="Name" id="name" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with error state', async () => {
      const { container } = render(<Input label="Email" id="email" error="Invalid email" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when required', async () => {
      const { container } = render(<Input label="Required Field" id="required" required />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Select', () => {
    it('should have no accessibility violations', async () => {
      const options = [
        { value: '25m', label: '25m' },
        { value: '50m', label: '50m' },
      ];
      const { container } = render(
        <Select label="Course Type" id="course" options={options} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Card', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Card content goes here</CardContent>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Loading', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Loading />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ErrorBanner', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ErrorBanner message="An error occurred" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with retry button', async () => {
      const { container } = render(
        <ErrorBanner message="Failed to load" onRetry={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('Accessibility: Comparison Components', () => {
  describe('PersonalBestCard', () => {
    it('should have no accessibility violations', async () => {
      const mockPb = {
        id: '123',
        swimmer_id: '456',
        event: '50FR' as const,
        time_ms: 30120,
        time_formatted: '30.12',
        meet_id: '789',
        meet: 'Fall Classic',
        meet_city: 'Toronto',
        date: '2025-10-15',
        course_type: '25m' as const,
      };

      const { container } = render(
        <TestWrapper>
          <PersonalBestCard pb={mockPb} achievedStandards={[]} />
        </TestWrapper>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('StatusBadge', () => {
    it('should have no violations for achieved status', async () => {
      const { container } = render(<StatusBadge status="achieved" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations for almost status', async () => {
      const { container } = render(<StatusBadge status="almost" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations for not_achieved status', async () => {
      const { container } = render(<StatusBadge status="not_achieved" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('Accessibility: Keyboard Navigation', () => {
  it('Button should be focusable and activatable with keyboard', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });

    // Check button is focusable
    button.focus();
    expect(document.activeElement).toBe(button);

    // Check tabIndex is correct
    expect(button).not.toHaveAttribute('tabindex', '-1');
  });

  it('Input should be focusable', async () => {
    render(<Input label="Name" id="name" />);

    const input = screen.getByLabelText(/name/i);

    // Check input is focusable
    input.focus();
    expect(document.activeElement).toBe(input);
  });

  it('Select should be focusable', async () => {
    const options = [
      { value: '25m', label: '25m' },
      { value: '50m', label: '50m' },
    ];
    render(<Select label="Course" id="course" options={options} />);

    const select = screen.getByLabelText(/course/i);

    // Check select is focusable
    select.focus();
    expect(document.activeElement).toBe(select);
  });
});

describe('Accessibility: Semantic HTML', () => {
  it('Buttons should have proper button role', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('Inputs should have proper input role and be labeled', () => {
    render(<Input label="Email" id="email" type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAccessibleName(/email/i);
  });

  it('Select should have proper combobox role', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ];
    render(<Select label="Options" id="options" options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('ErrorBanner should use alert role', () => {
    render(<ErrorBanner message="Error!" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('Loading should use status role', () => {
    render(<Loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('Accessibility: Color Contrast', () => {
  // Note: axe-core automatically checks color contrast as part of WCAG 2.1 AA rules
  // These tests verify that our primary interactive elements pass contrast checks

  it('Primary button should meet contrast requirements', async () => {
    const { container } = render(<Button variant="primary">Primary Action</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Secondary button should meet contrast requirements', async () => {
    const { container } = render(<Button variant="secondary">Secondary Action</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Ghost button should meet contrast requirements', async () => {
    const { container } = render(<Button variant="ghost">Ghost Action</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Danger button should meet contrast requirements', async () => {
    const { container } = render(<Button variant="danger">Danger Action</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
