/**
 * Formats a date string or Date object into Indian Standard Time (IST).
 * Example output: "05 Aug 2026" or "05 Aug 2026, 03:30 PM IST"
 */
export function formatISTDate(dateInput?: string | Date | null, includeTime = false): string {
  if (!dateInput) return 'TBD';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'TBD';

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
    return d.toLocaleString('en-IN', options) + ' IST';
  }

  return d.toLocaleDateString('en-IN', options);
}
