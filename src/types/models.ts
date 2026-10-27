/**
 * Domain models shared by the API layer, hooks and screens.
 * These mirror the JSON your backend should return — see docs/API.md.
 * Dates are ISO-8601 strings; calendar days are 'YYYY-MM-DD'.
 */

export type ID = string;
export type ISODateTime = string; // e.g. 2026-10-27T07:35:00+05:30
export type ISODate = string; // e.g. 2026-10-27

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Place {
  name: string; // "Home", "Green Valley Public School"
  address: string;
  location: LatLng;
}

/* ---------- People ---------- */

export type Relation = 'mother' | 'father' | 'guardian' | 'grandparent' | 'other';

export interface Parent {
  id: ID;
  name: string;
  phone: string; // E.164, e.g. +919876543210
  altPhone?: string | null;
  email?: string | null;
  relation: Relation;
  avatarUrl?: string | null;
}

export type StudentStatus = 'active' | 'pending_approval' | 'inactive';

export interface Student {
  id: ID;
  name: string;
  grade: string; // "4"
  section: string; // "B"
  schoolName: string;
  avatarUrl?: string | null;
  vehicleLabel: string | null; // "Van 3"
  pickupTime: string | null; // "07:35" (24h, local)
  dropTime: string | null; // "15:20"
  status: StudentStatus;
}

export interface Guardian {
  id: ID;
  name: string;
  relation: Relation;
  phone: string;
  isSelf: boolean;
}

export interface Driver {
  id: ID;
  name: string;
  phone: string;
  avatarUrl?: string | null;
}

export interface Vehicle {
  id: ID;
  label: string; // "Van 3"
  registrationNumber: string; // "TN 09 AB 4521"
  model: string; // "White Traveller"
}

/* ---------- Trips ---------- */

export type TripType = 'pickup' | 'drop';
export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'absent';

export interface Trip {
  id: ID;
  studentId: ID;
  date: ISODate;
  type: TripType;
  status: TripStatus;
  from: Place;
  to: Place;
  scheduledStart: ISODateTime;
  scheduledEnd: ISODateTime;
  actualStart?: ISODateTime | null;
  actualEnd?: ISODateTime | null;
  driver: Driver;
  vehicle: Vehicle;
  absenceNote?: string | null; // "Marked absent by you · 6:02 AM"
}

export type LivePhase = 'to_pickup' | 'onboard' | 'reached';
export type StopState = 'done' | 'current' | 'next';

export interface LiveStop {
  id: ID;
  title: string;
  subtitle: string;
  time: ISODateTime; // actual time when done, estimate otherwise
  state: StopState;
  location: LatLng;
}

export interface LiveTrip {
  tripId: ID;
  type: TripType;
  phase: LivePhase;
  vehicleLocation: LatLng;
  heading?: number | null; // degrees
  etaMinutes: number | null; // to the parent's next relevant stop
  etaTime: ISODateTime | null;
  distanceKm: number | null;
  stopsCompleted: number;
  stopsTotal: number;
  route: LatLng[]; // polyline
  stops: LiveStop[];
  driver: Driver;
  vehicle: Vehicle;
  updatedAt: ISODateTime;
}

export interface AbsenceRequest {
  studentId: ID;
  dates: ISODate[];
  tripTypes: TripType[];
  reason?: string;
  note?: string;
}

export interface Absence extends AbsenceRequest {
  id: ID;
  createdAt: ISODateTime;
}

/* ---------- Chat ---------- */

export type ThreadKind = 'general' | 'trip' | 'announcement';

export interface ChatThread {
  id: ID;
  kind: ThreadKind;
  title: string;
  subtitle?: string | null; // "Driver · Van 3"
  tripId?: ID | null;
  tripType?: TripType | null;
  tripStatus?: TripStatus | null;
  lastMessage: string;
  lastAt: ISODateTime;
  unread: number;
  participant?: Driver | null;
}

export type Sender = 'parent' | 'driver' | 'system';

export interface ChatMessage {
  id: ID;
  threadId: ID;
  sender: Sender;
  text: string;
  createdAt: ISODateTime;
  /** Client-only flag while a send is in flight. */
  pending?: boolean;
}

/* ---------- Payments ---------- */

export type InvoiceStatus = 'overdue' | 'due' | 'upcoming' | 'paid';

export interface Invoice {
  id: ID;
  studentId: ID;
  month: string; // "2026-10"
  amount: number; // in rupees
  currency: 'INR';
  dueDate: ISODate;
  status: InvoiceStatus;
}

export interface Payment {
  id: ID;
  studentId: ID;
  invoiceIds: ID[];
  month: string; // first month covered, "2026-09"
  amount: number;
  currency: 'INR';
  method: string; // "UPI", "Debit card"
  paidAt: ISODateTime;
  receiptUrl: string | null;
}

export interface PaymentOrder {
  orderId: ID;
  amount: number;
  currency: 'INR';
  /** Hosted checkout page from your gateway (Razorpay / Cashfree / PayU…). */
  checkoutUrl: string;
}

export type PaymentOrderStatus = 'created' | 'paid' | 'failed';

/* ---------- Settings ---------- */

export interface StopPoint extends Place {
  landmark?: string | null;
}

export interface PickupLocations {
  studentId: ID;
  pickup: StopPoint;
  drop: StopPoint;
  dropSameAsPickup: boolean;
  approval: 'approved' | 'pending';
}

export interface NotificationPrefs {
  vanApproaching: boolean;
  boardedDropped: boolean;
  chatSounds: boolean;
}
