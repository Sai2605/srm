/**
 * React Query hooks — the only way screens talk to the backend.
 * Caching, loading/error state, refetch and invalidation live here.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LIVE_POLL_MS } from '@/api/config';
import { chatService, paymentService, profileService, studentService, tripService } from '@/api/services';
import { toLocalISO } from '@/utils/date';
import type { AbsenceRequest, ChatMessage, NotificationPrefs, Trip } from '@/types/models';
import type { AddGuardianRequest, UpdatePickupLocationsRequest, UpdateProfileRequest } from '@/types/api';

export const qk = {
  me: ['me'] as const,
  prefs: ['me', 'prefs'] as const,
  students: ['students'] as const,
  guardians: (sid: string) => ['students', sid, 'guardians'] as const,
  pickup: (sid: string) => ['students', sid, 'pickup'] as const,
  trips: (sid: string, date: string) => ['students', sid, 'trips', date] as const,
  tripsAll: (sid: string) => ['students', sid, 'trips'] as const,
  live: (tripId: string) => ['trips', tripId, 'live'] as const,
  threads: ['chats'] as const,
  tripThread: (tripId: string) => ['trips', tripId, 'chat'] as const,
  messages: (threadId: string) => ['chats', threadId, 'messages'] as const,
  invoices: (sid: string) => ['students', sid, 'invoices'] as const,
  payments: (sid: string) => ['students', sid, 'payments'] as const,
};

/* ---------- Profile ---------- */
export const useProfile = () => useQuery({ queryKey: qk.me, queryFn: profileService.get });

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => profileService.update(body),
    onSuccess: (parent) => qc.setQueryData(qk.me, parent),
  });
}

export const useNotificationPrefs = () => useQuery({ queryKey: qk.prefs, queryFn: profileService.getPrefs });

export function useUpdateNotificationPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NotificationPrefs) => profileService.updatePrefs(body),
    onMutate: async (body) => {
      const prev = qc.getQueryData<NotificationPrefs>(qk.prefs);
      qc.setQueryData(qk.prefs, body); // optimistic
      return { prev };
    },
    onError: (_e, _b, ctx) => ctx?.prev && qc.setQueryData(qk.prefs, ctx.prev),
  });
}

/* ---------- Students ---------- */
export const useStudents = () => useQuery({ queryKey: qk.students, queryFn: studentService.list });

export function useLinkStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentCode: string) => studentService.link({ studentCode }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.students }),
  });
}

export const useGuardians = (sid?: string) =>
  useQuery({ queryKey: qk.guardians(sid ?? ''), queryFn: () => studentService.guardians(sid!), enabled: !!sid });

export function useAddGuardian(sid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddGuardianRequest) => studentService.addGuardian(sid, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.guardians(sid) }),
  });
}

export const usePickupLocations = (sid?: string) =>
  useQuery({ queryKey: qk.pickup(sid ?? ''), queryFn: () => studentService.getPickupLocations(sid!), enabled: !!sid });

export function useUpdatePickupLocations(sid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePickupLocationsRequest) => studentService.updatePickupLocations(sid, body),
    onSuccess: (data) => qc.setQueryData(qk.pickup(sid), data),
  });
}

/* ---------- Trips ---------- */
export const useTrips = (sid: string | undefined, date: string) =>
  useQuery({ queryKey: qk.trips(sid ?? '', date), queryFn: () => tripService.byDate(sid!, date), enabled: !!sid });

/** Today's trip that is currently running, if any. */
export function useActiveTrip(trips: Trip[] | undefined) {
  return trips?.find((t) => t.status === 'in_progress') ?? null;
}

/**
 * Live position / ETA. Polls every LIVE_POLL_MS while the screen is mounted.
 * To switch to WebSockets later: keep this hook's return shape and
 * push socket updates with queryClient.setQueryData(qk.live(tripId), data).
 */
export const useLiveTrip = (tripId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: qk.live(tripId ?? ''),
    queryFn: () => tripService.live(tripId!),
    enabled: !!tripId && enabled,
    refetchInterval: (q) => (q.state.data?.phase === 'reached' ? false : LIVE_POLL_MS),
    refetchIntervalInBackground: false,
  });

export function useMarkAbsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AbsenceRequest) => tripService.markAbsent(body),
    onSuccess: (_d, body) => qc.invalidateQueries({ queryKey: qk.tripsAll(body.studentId) }),
  });
}

/* ---------- Chat ---------- */
export const useThreads = () => useQuery({ queryKey: qk.threads, queryFn: chatService.threads });

export const useTripThread = (tripId?: string) =>
  useQuery({ queryKey: qk.tripThread(tripId ?? ''), queryFn: () => chatService.threadForTrip(tripId!), enabled: !!tripId });

export const useMessages = (threadId?: string) =>
  useQuery({
    queryKey: qk.messages(threadId ?? ''),
    queryFn: () => chatService.messages(threadId!),
    enabled: !!threadId,
    refetchInterval: 10_000, // replace with socket push when available
  });

export function useSendMessage(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => chatService.send(threadId, text),
    onMutate: async (text) => {
      await qc.cancelQueries({ queryKey: qk.messages(threadId) });
      const prev = qc.getQueryData<ChatMessage[]>(qk.messages(threadId)) ?? [];
      const temp: ChatMessage = {
        id: `tmp_${Date.now()}`,
        threadId,
        sender: 'parent',
        text,
        createdAt: toLocalISO(new Date()),
        pending: true,
      };
      qc.setQueryData(qk.messages(threadId), [...prev, temp]);
      return { prev };
    },
    onError: (_e, _t, ctx) => ctx && qc.setQueryData(qk.messages(threadId), ctx.prev),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.messages(threadId) });
      qc.invalidateQueries({ queryKey: qk.threads });
    },
  });
}

/* ---------- Payments ---------- */
export const usePendingInvoices = (sid?: string) =>
  useQuery({ queryKey: qk.invoices(sid ?? ''), queryFn: () => paymentService.pendingInvoices(sid!), enabled: !!sid });

export const usePaymentHistory = (sid?: string) =>
  useQuery({ queryKey: qk.payments(sid ?? ''), queryFn: () => paymentService.history(sid!), enabled: !!sid });

export function useCreatePaymentOrder() {
  return useMutation({ mutationFn: paymentService.createOrder });
}

export function useRefreshPayments(sid?: string) {
  const qc = useQueryClient();
  return () => {
    if (!sid) return;
    qc.invalidateQueries({ queryKey: qk.invoices(sid) });
    qc.invalidateQueries({ queryKey: qk.payments(sid) });
  };
}
