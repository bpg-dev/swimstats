import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TableHeader, TableHeaderRow, TableHead } from '@/components/ui/Table';

describe('TableHeader', () => {
  it('includes bg-slate-50 by default', () => {
    const { container } = render(
      <table>
        <TableHeader>
          <TableHeaderRow>
            <TableHead>Col</TableHead>
          </TableHeaderRow>
        </TableHeader>
      </table>
    );
    const thead = container.querySelector('thead');
    expect(thead?.className).toContain('bg-slate-50');
  });

  it('allows overriding background class', () => {
    const { container } = render(
      <table>
        <TableHeader className="bg-red-100">
          <TableHeaderRow>
            <TableHead>Col</TableHead>
          </TableHeaderRow>
        </TableHeader>
      </table>
    );
    const thead = container.querySelector('thead');
    expect(thead?.className).toContain('bg-red-100');
    expect(thead?.className).not.toContain('bg-slate-50');
  });
});
