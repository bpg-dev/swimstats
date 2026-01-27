/**
 * Format time in milliseconds to display format.
 * @param ms - Time in milliseconds
 * @returns Formatted time string (e.g., "28.45" or "1:05.32")
 */
export function formatTime(ms: number): string {
  if (ms <= 0) return '0.00';

  const totalSeconds = Math.floor(ms / 1000);
  const hundredths = Math.floor((ms % 1000) / 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}.${hundredths.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

/**
 * Parse display format time string to milliseconds.
 * @param timeStr - Time string (e.g., "28.45" or "1:05.32")
 * @returns Time in milliseconds, or null if invalid
 */
export function parseTime(timeStr: string): number | null {
  const trimmed = timeStr.trim();
  if (!trimmed) return null;

  // Pattern for MM:SS.ss or SS.ss
  const withMinutesMatch = trimmed.match(/^(\d+):(\d{1,2})\.(\d{1,2})$/);
  const withoutMinutesMatch = trimmed.match(/^(\d+)\.(\d{1,2})$/);

  let minutes = 0;
  let seconds = 0;
  let hundredths = 0;

  if (withMinutesMatch) {
    minutes = parseInt(withMinutesMatch[1], 10);
    seconds = parseInt(withMinutesMatch[2], 10);
    hundredths = parseHundredths(withMinutesMatch[3]);
  } else if (withoutMinutesMatch) {
    seconds = parseInt(withoutMinutesMatch[1], 10);
    hundredths = parseHundredths(withoutMinutesMatch[2]);
  } else {
    return null;
  }

  // Validate ranges
  if (minutes > 0 && seconds >= 60) return null;
  if (hundredths > 99) return null;

  const totalMs = (minutes * 60 + seconds) * 1000 + hundredths * 10;
  return totalMs > 0 ? totalMs : null;
}

function parseHundredths(str: string): number {
  const val = parseInt(str, 10);
  // If single digit, multiply by 10 (e.g., "5" means 0.50)
  return str.length === 1 ? val * 10 : val;
}

/**
 * Calculate the difference between two times.
 * @param time1Ms - First time in milliseconds
 * @param time2Ms - Second time in milliseconds
 * @returns Formatted difference string with +/- prefix
 */
export function timeDifference(time1Ms: number, time2Ms: number): string {
  const diff = time1Ms - time2Ms;
  if (diff === 0) return '0.00';

  const prefix = diff > 0 ? '+' : '-';
  return prefix + formatTime(Math.abs(diff));
}

/**
 * Calculate the percentage difference between two times.
 * @param time1Ms - First time in milliseconds
 * @param time2Ms - Second time in milliseconds (reference)
 * @returns Percentage difference (positive = slower)
 */
export function timeDifferencePercent(time1Ms: number, time2Ms: number): number {
  if (time2Ms === 0) return 0;
  return ((time1Ms - time2Ms) / time2Ms) * 100;
}

/**
 * Check if a time string is valid.
 * @param timeStr - Time string to validate
 * @returns true if the time string is valid
 */
export function isValidTimeString(timeStr: string): boolean {
  return parseTime(timeStr) !== null;
}

/**
 * Parse time string to milliseconds, returning 0 for invalid inputs.
 * @param timeStr - Time string (e.g., "28.45" or "1:05.32")
 * @returns Time in milliseconds, or 0 if invalid
 */
export function parseTimeToMs(timeStr: string): number {
  return parseTime(timeStr) ?? 0;
}

/**
 * Format a date string for display in YYYY-MM-DD format.
 * @param dateStr - Date string (YYYY-MM-DD or ISO format)
 * @returns Formatted date (e.g., "2013-01-22") or empty string if invalid
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) {
    return '';
  }
  // Already in YYYY-MM-DD format, just return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  // Handle ISO format (e.g., "2025-01-22T00:00:00Z")
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  // Try parsing as a date
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().split('T')[0];
}

/**
 * Format a meet date range for display in YYYY-MM-DD format.
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 * @returns Formatted date range (e.g., "2026-01-15" or "2026-01-15 to 2026-01-17")
 */
export function formatDateRange(startDate: string, endDate: string): string {
  // Single day meet
  if (startDate === endDate) {
    return startDate;
  }

  // Multi-day meet
  return `${startDate} to ${endDate}`;
}

/**
 * Get an array of dates between start and end (inclusive).
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 * @returns Array of date strings
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
