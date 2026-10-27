/**
 * Typed service functions — one per backend call.
 * Screens never call `api` directly; they use the React Query hooks in src/hooks,
 * which call these.
 */
import { api } from './client';
import { endpoints as e } from './endpoints';
import type {
  Absence,
  AbsenceRequest,
  ChatMessage,
  ChatThread,
  Guardian,
  Invoice,
  LiveTrip,
  NotificationPrefs,
  Parent,
  Payment,
  PaymentOrder,
  PaymentOrderStatus,
  PickupLocations,
  Student,
  Trip,
} from '@/types/models';
import type {
  AddGuardianRequest,
  CreatePaymentOrderRequest,
  LinkStudentRequest,
  SendOtpResponse,
  UpdatePickupLocationsRequest,
  UpdateProfileRequest,
  VerifyOtpResponse,
} from '@/types/api';

export const authService = {
  sendOtp: (phone: string) => api.post<SendOtpResponse>(e.auth.sendOtp, { phone }, { auth: false }),
  verifyOtp: (requestId: string, phone: string, otp: string) =>
    api.post<VerifyOtpResponse>(e.auth.verifyOtp, { requestId, phone, otp }, { auth: false }),
  logout: () => api.post<void>(e.auth.logout),
};

export const profileService = {
  get: () => api.get<Parent>(e.me.profile),
  update: (body: UpdateProfileRequest) => api.patch<Parent>(e.me.profile, body),
  getPrefs: () => api.get<NotificationPrefs>(e.me.notificationPrefs),
  updatePrefs: (body: NotificationPrefs) => api.put<NotificationPrefs>(e.me.notificationPrefs, body),
};

export const studentService = {
  list: () => api.get<Student[]>(e.students.list),
  link: (body: LinkStudentRequest) => api.post<Student>(e.students.link, body),
  guardians: (studentId: string) => api.get<Guardian[]>(e.students.guardians(studentId)),
  addGuardian: (studentId: string, body: AddGuardianRequest) =>
    api.post<Guardian>(e.students.guardians(studentId), body),
  getPickupLocations: (studentId: string) => api.get<PickupLocations>(e.students.pickupLocations(studentId)),
  updatePickupLocations: (studentId: string, body: UpdatePickupLocationsRequest) =>
    api.put<PickupLocations>(e.students.pickupLocations(studentId), body),
};

export const tripService = {
  /** Trips for one student on one day (YYYY-MM-DD). */
  byDate: (studentId: string, date: string) => api.get<Trip[]>(e.students.trips(studentId), { query: { date } }),
  live: (tripId: string) => api.get<LiveTrip>(e.trips.live(tripId)),
  markAbsent: (body: AbsenceRequest) => api.post<Absence>(e.students.absences(body.studentId), body),
};

export const chatService = {
  threads: () => api.get<ChatThread[]>(e.chats.list),
  threadForTrip: (tripId: string) => api.get<ChatThread>(e.trips.chat(tripId)),
  messages: (threadId: string) => api.get<ChatMessage[]>(e.chats.messages(threadId)),
  send: (threadId: string, text: string) => api.post<ChatMessage>(e.chats.messages(threadId), { text }),
};

export const paymentService = {
  pendingInvoices: (studentId: string) =>
    api.get<Invoice[]>(e.students.invoices(studentId), { query: { status: 'pending' } }),
  history: (studentId: string) => api.get<Payment[]>(e.students.payments(studentId)),
  createOrder: (body: CreatePaymentOrderRequest) => api.post<PaymentOrder>(e.payments.createOrder, body),
  orderStatus: (orderId: string) => api.get<{ status: PaymentOrderStatus }>(e.payments.orderStatus(orderId)),
};
