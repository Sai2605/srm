/**
 * In-memory mock database. Only used when EXPO_PUBLIC_USE_MOCKS=true.
 * Safe to delete once the real backend is live (remove the import in client.ts).
 */
import { addDays, atTime, toISODate, toLocalISO } from './../../utils/date';
import type {
  Absence,
  ChatMessage,
  ChatThread,
  Driver,
  Guardian,
  Invoice,
  LatLng,
  NotificationPrefs,
  Parent,
  Payment,
  PickupLocations,
  Place,
  Student,
  Trip,
  TripStatus,
  TripType,
  Vehicle,
} from './../../types/models';

export const MOCK_OTP = '123456';

export const parent: Parent = {
  id: 'p_1',
  name: 'Priya Raman',
  phone: '+919876543210',
  altPhone: '+919123456780',
  email: 'priya.raman@example.com',
  relation: 'mother',
};

export const prefs: NotificationPrefs = { vanApproaching: true, boardedDropped: true, chatSounds: false };

export const students: Student[] = [
  { id: 's_aarav', name: 'Aarav Raman', grade: '4', section: 'B', schoolName: 'Green Valley Public School', vehicleLabel: 'Van 3', pickupTime: '07:35', dropTime: '15:20', status: 'active' },
  { id: 's_diya', name: 'Diya Raman', grade: '1', section: 'A', schoolName: 'Green Valley Public School', vehicleLabel: 'Van 3', pickupTime: '07:35', dropTime: '12:40', status: 'active' },
  { id: 's_kabir', name: 'Kabir Raman', grade: '8', section: 'C', schoolName: 'St. Mary’s Senior School', vehicleLabel: 'Van 7', pickupTime: '07:10', dropTime: '16:05', status: 'pending_approval' },
];

export const guardians: Record<string, Guardian[]> = Object.fromEntries(
  students.map((s) => [
    s.id,
    [
      { id: 'g_self', name: parent.name, relation: 'mother', phone: parent.phone, isSelf: true },
      { id: 'g_2', name: 'S. Raghavan', relation: 'grandparent', phone: '+919000011111', isSelf: false },
    ] as Guardian[],
  ]),
);

export const driver: Driver = { id: 'd_1', name: 'Ramesh Kumar', phone: '+919845012345' };
export const vehicle: Vehicle = { id: 'v_3', label: 'Van 3', registrationNumber: 'TN 09 AB 4521', model: 'White Traveller' };

/* Geography (Chennai-ish sample coordinates) */
export const depot: LatLng = { lat: 13.0569, lng: 80.2425 };
export const home: Place = { name: 'Home', address: 'Lakeview Apartments, Gate 2', location: { lat: 13.0418, lng: 80.2341 } };
export const school: Place = { name: 'School', address: 'Green Valley Public School', location: { lat: 13.0108, lng: 80.2206 } };

/** Polyline depot → home → school. `homeIndex` is where the home stop sits. */
export const routeLine: LatLng[] = [
  depot,
  { lat: 13.0532, lng: 80.2418 },
  { lat: 13.0497, lng: 80.2389 },
  { lat: 13.0462, lng: 80.2372 },
  home.location,
  { lat: 13.0365, lng: 80.2318 },
  { lat: 13.0298, lng: 80.2284 },
  { lat: 13.0221, lng: 80.2251 },
  { lat: 13.0160, lng: 80.2228 },
  school.location,
];
export const homeIndex = 4;

export const pickupLocations: Record<string, PickupLocations> = Object.fromEntries(
  students.map((s) => [
    s.id,
    {
      studentId: s.id,
      pickup: { ...home, landmark: 'Opposite the bakery, near the security cabin' },
      drop: { ...home, landmark: 'Opposite the bakery, near the security cabin' },
      dropSameAsPickup: true,
      approval: 'approved',
    } as PickupLocations,
  ]),
);

export const absences: Absence[] = [];

const shift = (iso: string, mins: number) => toLocalISO(new Date(new Date(iso).getTime() + mins * 60000));

/** Trips are generated per day so the date strip always has data. */
export function tripsFor(studentId: string, day: string): Trip[] {
  const st = students.find((s) => s.id === studentId);
  if (!st || st.status !== 'active') return [];
  const d = new Date(day + 'T00:00:00');
  const dow = d.getDay();
  if (dow === 0) return []; // Sunday: no service

  const today = toISODate(new Date());
  const isPast = day < today;
  const isToday = day === today;

  const absent = absences.find((a) => a.studentId === studentId && a.dates.includes(day));
  // Sample: an absence three days ago so the UI shows that state.
  const sampleAbsent = day === toISODate(addDays(new Date(), -3));

  const make = (type: TripType, start: string, end: string): Trip => {
    let status: TripStatus = isPast ? 'completed' : 'scheduled';
    if (isToday && type === 'pickup') status = 'in_progress';
    const markedAbsent = (absent && absent.tripTypes.includes(type)) || (sampleAbsent && isPast);
    if (markedAbsent) status = 'absent';
    const [from, to] = type === 'pickup' ? [home, school] : [school, home];
    return {
      id: `t_${studentId}_${day}_${type}`,
      studentId,
      date: day,
      type,
      status,
      from,
      to,
      scheduledStart: atTime(day, start),
      scheduledEnd: atTime(day, end),
      actualStart: status === 'completed' ? shift(atTime(day, start), 1) : null,
      actualEnd: status === 'completed' ? shift(atTime(day, end), 3) : null,
      driver,
      vehicle,
      absenceNote: markedAbsent ? 'Marked absent by you' : null,
    };
  };

  return [make('pickup', st.pickupTime ?? '07:35', '08:05'), make('drop', st.dropTime ?? '15:20', '15:55')];
}

/* ---------- Chat ---------- */
const now = new Date();
const minsAgo = (m: number) => toLocalISO(new Date(now.getTime() - m * 60000));
const daysAgo = (d: number, hhmm: string) => atTime(toISODate(addDays(now, -d)), hhmm);
const todayPickupTripId = `t_s_aarav_${toISODate(now)}_pickup`;

export const threads: ChatThread[] = [
  { id: 'th_general', kind: 'general', title: driver.name, subtitle: 'Driver · Van 3', lastMessage: '5 min late today, traffic near the signal', lastAt: minsAgo(6), unread: 1, participant: driver },
  { id: 'th_trip_today', kind: 'trip', title: 'Morning pickup · Today', tripId: todayPickupTripId, tripType: 'pickup', tripStatus: 'in_progress', lastMessage: 'You: Okay, Aarav will be at Gate 2', lastAt: minsAgo(20), unread: 0, participant: driver },
  { id: 'th_trip_old', kind: 'trip', title: 'Afternoon drop · Last week', tripType: 'drop', tripStatus: 'completed', lastMessage: 'Ramesh: Handed over to grandfather at gate', lastAt: daysAgo(5, '15:58'), unread: 0, participant: driver },
  { id: 'th_announce', kind: 'announcement', title: 'Transport desk', lastMessage: 'Diwali holidays: no van service from 9 to 11 Nov. Regular trips resume 12 Nov.', lastAt: daysAgo(2, '10:00'), unread: 0 },
];

export const messages: Record<string, ChatMessage[]> = {
  th_general: [
    { id: 'm1', threadId: 'th_general', sender: 'driver', text: 'Noted madam, get well soon to Aarav.', createdAt: daysAgo(3, '06:10') },
    { id: 'm2', threadId: 'th_general', sender: 'parent', text: 'Thank you! From Monday my father may pick him up sometimes.', createdAt: daysAgo(2, '09:42') },
    { id: 'm3', threadId: 'th_general', sender: 'driver', text: 'Okay. Please add him as a guardian in the app so I can verify.', createdAt: daysAgo(2, '09:50') },
    { id: 'm4', threadId: 'th_general', sender: 'driver', text: '5 min late today, traffic near the signal', createdAt: minsAgo(6) },
  ],
  th_trip_today: [
    { id: 'm5', threadId: 'th_trip_today', sender: 'system', text: 'Trip started', createdAt: minsAgo(25) },
    { id: 'm6', threadId: 'th_trip_today', sender: 'driver', text: 'Good morning! Starting from the depot now.', createdAt: minsAgo(25) },
    { id: 'm7', threadId: 'th_trip_today', sender: 'parent', text: 'Okay, Aarav will be at Gate 2.', createdAt: minsAgo(20) },
  ],
  th_trip_old: [
    { id: 'm8', threadId: 'th_trip_old', sender: 'system', text: 'Trip completed', createdAt: daysAgo(5, '15:58') },
    { id: 'm9', threadId: 'th_trip_old', sender: 'driver', text: 'Handed over to grandfather at gate', createdAt: daysAgo(5, '15:58') },
  ],
  th_announce: [
    { id: 'm10', threadId: 'th_announce', sender: 'system', text: 'Diwali holidays: no van service from 9 to 11 Nov. Regular trips resume 12 Nov.', createdAt: daysAgo(2, '10:00') },
  ],
};

/* ---------- Payments ---------- */
const ym = (offset: number) => {
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const invoices: Invoice[] = students.flatMap((s) => [
  { id: `inv_${s.id}_${ym(0)}`, studentId: s.id, month: ym(0), amount: 2400, currency: 'INR' as const, dueDate: `${ym(0)}-10`, status: 'overdue' as const },
  { id: `inv_${s.id}_${ym(1)}`, studentId: s.id, month: ym(1), amount: 2400, currency: 'INR' as const, dueDate: `${ym(1)}-10`, status: 'upcoming' as const },
]);

export const payments: Payment[] = students.flatMap((s) =>
  [1, 2, 3, 4].map((back, i) => ({
    id: `pay_${s.id}_${back}`,
    studentId: s.id,
    invoiceIds: [`inv_${s.id}_${ym(-back)}`],
    month: ym(-back),
    amount: 2400,
    currency: 'INR' as const,
    method: ['UPI', 'Debit card', 'UPI', 'Net banking'][i]!,
    paidAt: `${ym(-back)}-0${[8, 9, 5, 9][i]}T10:15:00+05:30`,
    receiptUrl: 'https://example.com/receipt.pdf',
  })),
);
