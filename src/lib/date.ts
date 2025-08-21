ts
// src/lib/date.ts
export function formatDateUTC(input: Date | number | string) {
  const d =
    input instanceof Date ? input :
    typeof input === 'number' ? new Date(input) :
    new Date(input);

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}