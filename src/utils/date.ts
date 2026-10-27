/** Small date helpers (no extra dependency). All in the device's local time. */

const pad = (n: number) => String(n).padStart(2, '0');

/** Date → 'YYYY-MM-DD' (local). */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 'YYYY-MM-DD' → Date at local midnight. */
export function fromISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Date → ISO string with local offset, e.g. 2026-10-27T07:35:00+05:30 */
export function toLocalISO(d: Date): string {
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const abs = Math.abs(off);
  return (
    `${toISODate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

/** Combine a calendar day and 'HH:mm' into a local ISO datetime. */
export function atTime(day: string, hhmm: string): string {
  const d = fromISODate(day);
  const [h, m] = hhmm.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return toLocalISO(d);
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function isSameDay(a: string, b: string) {
  return a === b;
}
