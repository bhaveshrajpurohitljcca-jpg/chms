/**
 * Formats a date string or Date object into Indian Standard Time (IST).
 * Example output: "05 Aug 2026" or "05 Aug 2026, 03:30 PM IST"
 */
export function formatISTDate(dateInput?: string | Date | null, includeTime = false): string {
  if (!dateInput) return 'TBD';
  const normalised = typeof dateInput === 'string' && !/(Z|[+-]\d{2}:\d{2})$/i.test(dateInput)
    ? `${dateInput}Z`
    : dateInput;
  const d = new Date(normalised);
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

/** Converts a stored UTC timestamp into a datetime-local value in IST. */
export function toISTDateTimeInput(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  const normalised = typeof dateInput === 'string' && !/(Z|[+-]\d{2}:\d{2})$/i.test(dateInput)
    ? `${dateInput}Z`
    : dateInput;
  const date = new Date(normalised);
  if (isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).reduce<Record<string, string>>((values, part) => {
    values[part.type] = part.value;
    return values;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** Treats the datetime-local fields as IST, regardless of the browser timezone. */
export function istInputToISOString(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}:00+05:30`);
  return isNaN(date.getTime()) ? undefined : date.toISOString();
}
