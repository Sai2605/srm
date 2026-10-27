import { fromISODate } from './date';
import type { Relation } from './../types/models';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** ₹2,400 (Indian grouping). */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** ISO datetime → '7:35 AM' */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}

/** '15:20' → '3:20 PM' */
export function formatClock(hhmm: string | null | undefined): string {
  if (!hhmm) return '—';
  const [hRaw, m] = hhmm.split(':').map(Number);
  const ap = hRaw >= 12 ? 'PM' : 'AM';
  const h = hRaw % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}

/** 'YYYY-MM-DD' → 'Mon, 26 Oct' */
export function formatDayLong(day: string): string {
  const d = fromISODate(day);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatDayShort(day: string) {
  const d = fromISODate(day);
  return { dow: DAYS[d.getDay()], num: d.getDate(), month: MONTHS[d.getMonth()] };
}

/** 'YYYY-MM-DD' or ISO datetime → '8 Sep' */
export function formatDayMonth(isoOrDay: string): string {
  const d = fromISODate(isoOrDay.slice(0, 10));
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** '2026-10' → 'October 2026' */
export function formatMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS_LONG[m - 1]} ${y}`;
}

export function formatMonthYear(day: string): string {
  const d = fromISODate(day);
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/** Chat list timestamp: time if today, weekday if this week, else date. */
export function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays <= 0) return formatTime(iso);
  if (diffDays < 7) return DAYS[d.getDay()];
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** '+919876543210' → '+91 98765 43210' */
export function formatPhone(e164: string): string {
  const m = e164.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : e164;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

export function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

export function relationLabel(r: Relation): string {
  return { mother: 'Mother', father: 'Father', guardian: 'Guardian', grandparent: 'Grandparent', other: 'Other' }[r];
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
