import { Modal, Pressable, StyleSheet, View } from 'react-native';
// import { router } from 'expo-router';
import { useActiveStudent } from './../../store/ActiveStudentProvider';
import { useLiveTrip, usePendingInvoices, useProfile, useTrips } from './../../hooks/queries';
// import { errorMessage } from '@/api/client';
import { colors, fonts, radius, spacing } from './../../theme';
import {
  AppText, Avatar, Button, Card, EmptyState, ErrorState, Icon, IconButton, LoadingState, Screen, tintFor, type IconName,
} from './../../components/ui';
import { DriverRow, StopProgress, TripRow, phaseCopy, tripName } from './../../components/trip';
import { firstName, formatCurrency, formatDayLong, formatMonth, formatTime, greeting } from './../../utils/format';
import { todayISO } from './../../utils/date';
import type { LivePhase, Student, Trip } from './../../types/models';
import {
  mockStudents,
  mockTrips,
  mockInvoices,
  mockProfile,
  mockLiveTrip,
} from './../../data/mockStudents';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import SwitchStudentScreen from './SwitchStudentScreen';

const USE_MOCK_DATA = true;
export default function Dashboard() {
  const [showSwitchStudent, setShowSwitchStudent] = useState(false);
  // const today = todayISO();
  // const { activeStudent, isLoading: loadingStudents } = useActiveStudent();
  // const profile = useProfile();
  // const trips = useTrips(activeStudent?.id, today);
  // const invoices = usePendingInvoices(activeStudent?.id);

  const today = todayISO();

  const {
    activeStudent: realStudent,
    isLoading: loadingStudents,
  } = useActiveStudent();

  const realProfile = useProfile();
  const realTrips = useTrips(realStudent?.id, today);
  const realInvoices = usePendingInvoices(realStudent?.id);

  // const activeStudent = USE_MOCK_DATA
  //   ? mockStudents
  //   : realStudent;

  const activeStudent = USE_MOCK_DATA
    ? mockStudents[0] ?? null
    : Array.isArray(realStudent)
      ? realStudent[0] ?? null
      : realStudent;

  const profile = USE_MOCK_DATA
    ? { data: mockProfile }
    : realProfile;

  const trips = USE_MOCK_DATA
    ? {
      data: mockTrips,
      isLoading: false,
      isRefetching: false,
      refetch: async () => { },
    }
    : realTrips;

  const invoices = USE_MOCK_DATA
    ? {
      data: mockInvoices,
      refetch: async () => { },
    }
    : realInvoices;

  const isLoadingStudents = USE_MOCK_DATA
    ? false
    : loadingStudents;

  const activeTrip = trips.data?.find((t: any) => t.status === 'in_progress') ?? null;
  const overdue = invoices.data?.find((i: any) => i.status === 'overdue');

  const refresh = () => {
    trips.refetch();
    invoices.refetch();
  };



  return (
    <Screen onRefresh={refresh} refreshing={trips.isRefetching}>
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="small" color={colors.textMuted}>{formatDayLong(today)}</AppText>
          <AppText variant="h2" accessibilityRole="header">
            {greeting()}{profile.data ? `, ${firstName(profile?.data && 'sai')}` : ''}
          </AppText>
        </View>
        {/* TODO: route to a notifications screen once the backend has a feed */}
        <IconButton name="notification" label="Notifications" badge />
      </View>

      {isLoadingStudents ? (
        <LoadingState />
      ) : !activeStudent ? (
        <EmptyState icon="users" title="No students linked yet" message="Add your child using the student ID from school." />
      ) : (
        <>
          {/* <StudentSwitcher student={activeStudent} /> */}
          <StudentSwitcher
            student={activeStudent}
            onPress={() => setShowSwitchStudent(true)}
          />

          <Modal
            visible={showSwitchStudent}
            animationType="slide"
            transparent
            statusBarTranslucent
            onRequestClose={() => setShowSwitchStudent(false)}
          >
            <View style={styles.modalOverlay}>
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setShowSwitchStudent(false)}
              />

              <View style={styles.modalContent}>
                <SwitchStudentScreen
                  onClose={() => setShowSwitchStudent(false)}
                />
              </View>
            </View>
          </Modal>
          {activeTrip ? <LiveTripCard trip={activeTrip} /> : null}

          <QuickActions />

          {overdue && (
            <Pressable accessibilityRole="button"
              // onPress={() => router.push('/payments')}
              style={styles.overdue}>
              <Icon name="CircleAlert" size={18} color={colors.warning} />
              <AppText variant="small" color={colors.warning} style={{ flex: 1, fontFamily: fonts.semibold }}>
                {formatMonth(overdue.month).split(' ')[0]} fee {formatCurrency(overdue.amount)} is overdue
              </AppText>
              <AppText variant="small" color={colors.warning} style={{ fontFamily: fonts.extraBold }}>Pay now</AppText>
            </Pressable>
          )}

          <View style={{ gap: 10 }}>
            <View style={styles.sectionHead}>
              <AppText variant="h3">Today’s trips</AppText>
              <AppText variant="small" style={{ fontFamily: fonts.bold }} accessibilityRole="link"
              //  onPress={() => router.push('/trips')}
              >
                See all
              </AppText>
            </View>
            {trips.isLoading ? (
              <LoadingState />
              // ) : trips.isError ? (
              //   <ErrorState message={errorMessage(trips.error)} onRetry={trips.refetch} />
            ) : !trips.data?.length ? (
              <EmptyState icon='Calendar' title="No trips today" message="School holiday or weekend." />
            ) : (
              <Card padded={false}>
                {trips.data.map((t: any, i: any) => (
                  <TripRow key={t.id} trip={t} last={i === trips.data!.length - 1} />
                ))}
              </Card>
            )}
          </View>
        </>
      )}
    </Screen>
  );
}

function StudentSwitcher({ student, onPress }: { student: Student; onPress: () => void; }) {
  const navigation = useNavigation<any>();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${student.name}. Switch student`}
      onPress={onPress}
    >
      <Card style={styles.switcher}>
        <Avatar name={student.name} bg={tintFor(student.id)} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="title" style={{ fontSize: 16 }}>{student.name}</AppText>
          <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
            Grade {student.grade} · {student.section} · {student.schoolName}
          </AppText>
        </View>
        <View style={styles.switchPill}>
          <AppText variant="small" style={{ fontFamily: fonts.bold }}>Switch</AppText>
          <Icon name='ChevronDown' size={16} />
        </View>
      </Card>
    </Pressable>
  );
}

function LiveTripCard({ trip }: { trip: Trip }) {
  const live = useLiveTrip(trip.id);

  const d = USE_MOCK_DATA
    ? mockLiveTrip
    : live.data;

  const copy = d
    ? phaseCopy[d.phase as LivePhase]
    : null;

  return (
    <View style={styles.live} accessibilityLabel="Live trip">
      <View style={styles.rowBetween}>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <AppText variant="caption" color={colors.textOnDark} style={{ fontFamily: fonts.bold }}>
            LIVE · {copy?.chip ?? 'Connecting…'}
          </AppText>
        </View>
        <AppText variant="caption" color={colors.textOnDarkMuted}>{tripName(trip.type)}</AppText>
      </View>

      <View style={[styles.rowBetween, { alignItems: 'flex-end' }]}>
        <View style={{ gap: 2 }}>
          <AppText variant="caption" color={colors.textOnDarkMuted}>{copy?.etaLabel ?? 'Arriving in'}</AppText>
          <AppText variant="display" color={colors.textOnDark}>
            {d ? (d.etaMinutes != null ? `${d.etaMinutes} min` : formatTime(d.updatedAt)) : '—'}
          </AppText>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <AppText variant="small" color={colors.textOnDark} style={{ fontFamily: fonts.bold }}>
            {d?.distanceKm != null ? `${d.distanceKm} km away` : ''}
          </AppText>
          <AppText variant="small" color={colors.textOnDarkMuted}>{d?.etaTime ? `ETA ${formatTime(d.etaTime)}` : ''}</AppText>
        </View>
      </View>

      {d && <StopProgress done={d.stopsCompleted} total={d.stopsTotal} />}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <DriverRow driver={trip.driver} vehicle={trip.vehicle} compact dark />
        </View>
        <Button
          label="Track live"
          variant="accent"
          size="md"
          style={{ height: 44 }}
        // onPress={() => router.push({ pathname: '/live-trip/[tripId]', params: { tripId: trip.id } })}
        />
      </View>
    </View>
  );
}

const ACTIONS: { label: string; icon: IconName; color: string; href: '/mark-absent' | '/chats' | '/payments' | '/pickup-location' }[] = [
  { label: 'Mark absent', icon: 'UserRoundX', color: '#B4540A', href: '/mark-absent' },
  { label: 'Message', icon: 'MessageCircleMore', color: '#2563A8', href: '/chats' },
  { label: 'Pay fees', icon: 'CreditCard', color: '#1E7A4F', href: '/payments' },
  { label: 'Pickup point', icon: 'MapPin', color: colors.purple, href: '/pickup-location' },
];

function QuickActions() {
  return (
    <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-evenly' }} accessibilityLabel="Quick actions">
      {ACTIONS.map((a) => (
        <Pressable key={a.label} accessibilityRole="button"
          // onPress={() => router.push(a.href)}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.8 }]}
        >
          <Icon name={a.icon} size={22} color={a.color} />
          <AppText variant="caption" align="center" style={{ fontFamily: fonts.semibold }}>{a.label}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switcher: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  switchPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.bg },
  live: { backgroundColor: colors.navy, borderRadius: radius.xl, padding: 18, gap: 14 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.md, backgroundColor: colors.navySoft },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    paddingHorizontal: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg - 2,
  },
  overdue: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.warningBg },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    maxHeight: '75%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
});
