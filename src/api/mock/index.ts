/**
 * Tiny mock backend that answers the same paths as the real API.
 * Lets the whole app run end-to-end without a server.
 */
import { toLocalISO, todayISO } from '@/utils/date';
import * as db from './db';
import { ApiError } from '../errors';
import type { LatLng, LivePhase, LiveTrip, StopState } from '@/types/models';
import type {
  AddGuardianRequest,
  CreatePaymentOrderRequest,
  SendMessageRequest,
  SendOtpRequest,
  UpdatePickupLocationsRequest,
  UpdateProfileRequest,
  VerifyOtpRequest,
} from '@/types/api';
import type { AbsenceRequest, NotificationPrefs } from '@/types/models';

type Params = Record<string, string>;
type Q = Record<string, unknown> | undefined;
type Handler = (p: Params, q: Q, body: any) => unknown;

class MockHttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const routes: [string, string, Handler][] = [
  /* Auth */
  ['POST', '/auth/otp/send', (_p, _q, b: SendOtpRequest) => {
    if (!/^\+\d{10,15}$/.test(b.phone)) throw new MockHttpError(422, 'Enter a valid mobile number');
    return { requestId: 'req_' + Date.now(), resendInSeconds: 30, expiresInSeconds: 300 };
  }],
  ['POST', '/auth/otp/verify', (_p, _q, b: VerifyOtpRequest) => {
    if (b.otp !== db.MOCK_OTP) throw new MockHttpError(400, `Incorrect code. (Demo code is ${db.MOCK_OTP})`);
    return { accessToken: 'mock-access', refreshToken: 'mock-refresh', parent: { ...db.parent, phone: b.phone } };
  }],
  ['POST', '/auth/logout', () => undefined],

  /* Me */
  ['GET', '/me', () => db.parent],
  ['PATCH', '/me', (_p, _q, b: UpdateProfileRequest) => Object.assign(db.parent, b)],
  ['GET', '/me/notification-preferences', () => db.prefs],
  ['PUT', '/me/notification-preferences', (_p, _q, b: NotificationPrefs) => Object.assign(db.prefs, b)],

  /* Students */
  ['GET', '/students', () => db.students],
  ['POST', '/students/link', (_p, _q, b: { studentCode: string }) => {
    const s = { id: 's_' + Date.now(), name: `Student ${b.studentCode}`, grade: '—', section: '—', schoolName: 'Pending school verification', vehicleLabel: null, pickupTime: null, dropTime: null, status: 'pending_approval' as const };
    db.students.push(s);
    return s;
  }],
  ['GET', '/students/:id/guardians', (p) => db.guardians[p.id] ?? []],
  ['POST', '/students/:id/guardians', (p, _q, b: AddGuardianRequest) => {
    const g = { id: 'g_' + Date.now(), ...b, isSelf: false };
    (db.guardians[p.id] ??= []).push(g);
    return g;
  }],
  ['GET', '/students/:id/trips', (p, q) => db.tripsFor(p.id, String(q?.date ?? todayISO()))],
  ['POST', '/students/:id/absences', (p, _q, b: AbsenceRequest) => {
    const a = { ...b, studentId: p.id, id: 'abs_' + Date.now(), createdAt: toLocalISO(new Date()) };
    db.absences.push(a);
    return a;
  }],
  ['GET', '/students/:id/pickup-locations', (p) => db.pickupLocations[p.id]],
  ['PUT', '/students/:id/pickup-locations', (p, _q, b: UpdatePickupLocationsRequest) => {
    const next = { studentId: p.id, pickup: b.pickup, drop: b.dropSameAsPickup ? b.pickup : b.drop ?? b.pickup, dropSameAsPickup: b.dropSameAsPickup, approval: 'pending' as const };
    db.pickupLocations[p.id] = next;
    return next;
  }],
  ['GET', '/students/:id/invoices', (p, q) => {
    const list = db.invoices.filter((i) => i.studentId === p.id);
    return q?.status === 'pending' ? list.filter((i) => i.status !== 'paid') : list;
  }],
  ['GET', '/students/:id/payments', (p) => db.payments.filter((x) => x.studentId === p.id)],

  /* Trips */
  ['GET', '/trips/:id/live', (p) => simulateLive(p.id)],
  ['GET', '/trips/:id/chat', (p) => db.threads.find((t) => t.tripId === p.id) ?? db.threads.find((t) => t.kind === 'general')],

  /* Chats */
  ['GET', '/chats', () => [...db.threads].sort((a, b) => b.lastAt.localeCompare(a.lastAt))],
  ['GET', '/chats/:id/messages', (p) => {
    const t = db.threads.find((x) => x.id === p.id);
    if (t) t.unread = 0;
    return db.messages[p.id] ?? [];
  }],
  ['POST', '/chats/:id/messages', (p, _q, b: SendMessageRequest) => {
    const msg = { id: 'm_' + Date.now(), threadId: p.id, sender: 'parent' as const, text: b.text, createdAt: toLocalISO(new Date()) };
    (db.messages[p.id] ??= []).push(msg);
    const t = db.threads.find((x) => x.id === p.id);
    if (t) Object.assign(t, { lastMessage: 'You: ' + b.text, lastAt: msg.createdAt });
    return msg;
  }],

  /* Payments */
  ['POST', '/payments/orders', (_p, _q, b: CreatePaymentOrderRequest) => {
    const amount = db.invoices.filter((i) => b.invoiceIds.includes(i.id)).reduce((s, i) => s + i.amount, 0);
    return { orderId: 'order_' + Date.now(), amount, currency: 'INR', checkoutUrl: 'https://example.com/checkout' };
  }],
  ['GET', '/payments/orders/:id', () => ({ status: 'created' })],
];

/* ---------- Live trip simulation: van loops depot → home → school every 3 min ---------- */
const CYCLE_MS = 180_000;

function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}
function along(points: LatLng[], t: number): LatLng {
  if (t <= 0) return points[0]!;
  if (t >= 1) return points[points.length - 1]!;
  const seg = (points.length - 1) * t;
  const i = Math.floor(seg);
  return lerp(points[i]!, points[i + 1]!, seg - i);
}

function simulateLive(tripId: string): LiveTrip {
  const p = (Date.now() % CYCLE_MS) / CYCLE_MS; // 0..1
  const toHome = db.routeLine.slice(0, db.homeIndex + 1);
  const toSchool = db.routeLine.slice(db.homeIndex);

  let phase: LivePhase;
  let pos: LatLng;
  let etaMinutes: number | null;
  let distanceKm: number | null;
  if (p < 0.45) {
    phase = 'to_pickup';
    const t = p / 0.45;
    pos = along(toHome, t);
    etaMinutes = Math.max(1, Math.round((1 - t) * 10));
    distanceKm = +((1 - t) * 2.6).toFixed(1);
  } else if (p < 0.9) {
    phase = 'onboard';
    const t = (p - 0.45) / 0.45;
    pos = along(toSchool, t);
    etaMinutes = Math.max(1, Math.round((1 - t) * 22));
    distanceKm = +((1 - t) * 6.4).toFixed(1);
  } else {
    phase = 'reached';
    pos = db.school.location;
    etaMinutes = null;
    distanceKm = null;
  }

  const now = Date.now();
  const iso = (offsetMin: number) => toLocalISO(new Date(now + offsetMin * 60000));
  const st = (i: number): StopState => {
    const idx = { to_pickup: 0, onboard: 1, reached: 2 }[phase];
    return i <= idx ? 'done' : i === idx + 1 ? 'current' : 'next';
  };

  return {
    tripId,
    type: 'pickup',
    phase,
    vehicleLocation: pos,
    heading: null,
    etaMinutes,
    etaTime: etaMinutes != null ? iso(etaMinutes) : null,
    distanceKm,
    stopsCompleted: phase === 'to_pickup' ? 3 : phase === 'onboard' ? 4 : 7,
    stopsTotal: 7,
    route: db.routeLine,
    stops: [
      { id: 'st_start', title: 'Trip started', subtitle: 'Depot · 3 students picked so far', time: iso(-20), state: st(0), location: db.depot },
      { id: 'st_home', title: 'Pickup at your stop', subtitle: db.home.address, time: iso(phase === 'to_pickup' ? etaMinutes ?? 0 : -5), state: st(1), location: db.home.location },
      { id: 'st_school', title: 'Arrive at school', subtitle: db.school.address, time: iso(phase === 'reached' ? -1 : (etaMinutes ?? 0) + (phase === 'to_pickup' ? 22 : 0)), state: st(2), location: db.school.location },
    ],
    driver: db.driver,
    vehicle: db.vehicle,
    updatedAt: toLocalISO(new Date()),
  };
}

/* ---------- Router ---------- */
function match(pattern: string, path: string): Params | null {
  const a = pattern.split('/');
  const b = path.split('/');
  if (a.length !== b.length) return null;
  const params: Params = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i]!.startsWith(':')) params[a[i]!.slice(1)] = decodeURIComponent(b[i]!);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockRequest<T>(method: string, path: string, query?: Q, body?: unknown): Promise<T> {
  await delay(250 + Math.random() * 350);
  for (const [m, pattern, handler] of routes) {
    if (m !== method) continue;
    const params = match(pattern, path);
    if (!params) continue;
    try {
      // Deep copy so callers can't mutate the mock db by accident.
      const out = handler(params, query, body);
      return (out === undefined ? undefined : JSON.parse(JSON.stringify(out))) as T;
    } catch (e) {
      if (e instanceof MockHttpError) {
        throw new ApiError(e.status, e.message);
      }
      throw e;
    }
  }
  throw new ApiError(404, `[mock] No handler for ${method} ${path}`);
}
