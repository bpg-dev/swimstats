import { describe, it, expect } from 'vitest';
import { formatDate, formatDateRange } from '@/utils/timeFormat';

describe('formatDate', () => {
  it('returns date in YYYY-MM-DD format when already formatted', () => {
    expect(formatDate('2025-01-22')).toBe('2025-01-22');
    expect(formatDate('2013-06-15')).toBe('2013-06-15');
  });

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatDate('')).toBe('');
  });

  it('returns empty string for invalid date string', () => {
    expect(formatDate('invalid')).toBe('');
    expect(formatDate('not-a-date')).toBe('');
  });

  it('reformats ISO date strings to YYYY-MM-DD', () => {
    expect(formatDate('2025-01-22T10:30:00Z')).toBe('2025-01-22');
  });
});

describe('formatDateRange', () => {
  it('returns single date for same start and end', () => {
    expect(formatDateRange('2025-01-22', '2025-01-22')).toBe('2025-01-22');
  });

  it('returns date range for different start and end', () => {
    expect(formatDateRange('2025-01-22', '2025-01-24')).toBe('2025-01-22 to 2025-01-24');
  });
});
