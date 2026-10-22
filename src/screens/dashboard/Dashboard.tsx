import React from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native';

import {
  BusFront,
  MapPin,
  Clock3,
  Users,
  Route,
  CalendarDays,
  ClipboardCheck,
  ChevronRight,
  Navigation,
  CircleCheck,
  ArrowUpRight,
} from 'lucide-react-native';

import DynamicHeader from '../../components/common/DynamicHeader';
import { colors } from '../../theme';

// --------------------------------------------------
// Mock dashboard data
// Replace with your backend API data later.
// --------------------------------------------------

const dashboardStats = [
  {
    label: 'Total Trips',
    value: '04',
    icon: Route,
    color: colors.primary,
    background: colors.surfaceSecondary,
  },
  {
    label: 'Students',
    value: '32',
    icon: Users,
    color: colors.success,
    background: colors.successBackground,
  },
];

const pickupStudents = [
  {
    id: '1',
    name: 'Arun Kumar',
    className: 'Class 5 - A',
    pickupTime: '07:15 AM',
    status: 'Picked up',
    initials: 'AK',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    className: 'Class 3 - B',
    pickupTime: '07:25 AM',
    status: 'Waiting',
    initials: 'PS',
  },
  {
    id: '3',
    name: 'Rahul Kumar',
    className: 'Class 7 - A',
    pickupTime: '07:35 AM',
    status: 'Waiting',
    initials: 'RK',
  },
];

// --------------------------------------------------
// Reusable small components
// --------------------------------------------------

function SectionHeading({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={styles.sectionAction}
          accessibilityRole="button"
        >
          <Text style={styles.sectionActionText}>
            {actionLabel}
          </Text>
          <ChevronRight size={16} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  background,
}: (typeof dashboardStats)[number]) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTopRow}>
        <View style={[styles.statIcon, { backgroundColor: background }]}>
          <Icon size={20} color={color} strokeWidth={2.2} />
        </View>

        <ArrowUpRight size={17} color={colors.textMuted} />
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// --------------------------------------------------
// Dashboard screen
// --------------------------------------------------

export default function Dashboard() {
  const handleNotifications = () => {
    Alert.alert('Notifications', 'Connect your notifications screen here.');
  };

  const handleStartTrip = () => {
    Alert.alert(
      'Start trip',
      'Connect this action to your trip API and GPS tracking.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' },
      ],
    );
  };

  const handleQuickAction = (action: string) => {
    Alert.alert(action, `Connect the ${action} screen here.`);
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        // backgrou={colors.background}
      />
      <DynamicHeader
        title="Driver Tracking"
        subtitle="Let's make today's journey safe."
        variant="greeting"
        avatarInitials="SS"
        showNotification
        onNotificationPress={handleNotifications}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Date and duty status */}
        <View style={styles.dutyRow}>
          <View style={styles.dateContainer}>
            <CalendarDays size={16} color={colors.textSecondary} />
            <Text style={styles.dateText}>Today's overview</Text>
          </View>

          <View style={styles.dutyBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.dutyText}>On duty</Text>
          </View>
        </View>

        {/* Active trip card */}
        <View style={styles.activeTripCard}>
          <View style={styles.activeTripTop}>
            <View style={styles.activeTripTitleContainer}>
              <View style={styles.busIconBox}>
                <BusFront size={23} color="#FFFFFF" />
              </View>

              <View style={styles.activeTripHeading}>
                <Text style={styles.activeTripEyebrow}>
                  CURRENT ASSIGNMENT
                </Text>
                <Text style={styles.activeTripTitle}>
                  Morning Pickup
                </Text>
              </View>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.tripDivider} />

          <View style={styles.busDetailsRow}>
            <View style={styles.busDetail}>
              <Text style={styles.detailLabel}>BUS NUMBER</Text>
              <Text style={styles.detailValue}>TN 01 AB 1010</Text>
            </View>

            <View style={styles.busDetail}>
              <Text style={styles.detailLabel}>ROUTE</Text>
              <Text style={styles.detailValue}>Route 01</Text>
            </View>
          </View>

          <View style={styles.routePreview}>
            <View style={styles.routeLineContainer}>
              <View style={styles.routeStartDot} />
              <View style={styles.routeLine} />
              <View style={styles.routeEndDot} />
            </View>

            <View style={styles.routeLocations}>
              <View style={styles.routeLocation}>
                <Text style={styles.locationLabel}>START POINT</Text>
                <Text style={styles.locationName}>School Depot</Text>
              </View>

              <View style={[styles.routeLocation, styles.destination]}>
                <Text style={styles.locationLabel}>DESTINATION</Text>
                <Text style={styles.locationName}>School Campus</Text>
              </View>
            </View>
          </View>

          <View style={styles.tripFooter}>
            <View style={styles.tripFooterInfo}>
              <Clock3 size={16} color="#DCE7FF" />
              <Text style={styles.tripFooterText}>
                Scheduled · 07:00 AM
              </Text>
            </View>

            <Pressable
              onPress={handleStartTrip}
              style={({ pressed }) => [
                styles.startTripButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.startTripText}>View trip</Text>
              <Navigation size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Statistics */}
        <SectionHeading title="Today's activity" />

        <View style={styles.statsGrid}>
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </View>

        {/* Quick actions */}
        <SectionHeading title="Quick actions" />

        <View style={styles.quickActions}>
          <Pressable
            onPress={() => handleQuickAction('My Trips')}
            style={({ pressed }) => [
              styles.quickActionCard,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <Route size={22} color={colors.primary} />
            </View>
            <Text style={styles.quickActionTitle}>My Trips</Text>
            <Text style={styles.quickActionSubtitle}>View schedule</Text>
          </Pressable>

          <Pressable
            onPress={() => handleQuickAction('Students')}
            style={({ pressed }) => [
              styles.quickActionCard,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.successBackground }]}>
              <Users size={22} color={colors.success} />
            </View>
            <Text style={styles.quickActionTitle}>Students</Text>
            <Text style={styles.quickActionSubtitle}>View passenger list</Text>
          </Pressable>

          <Pressable
            onPress={() => handleQuickAction('Attendance')}
            style={({ pressed }) => [
              styles.quickActionCard,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.warningBackground }]}>
              <ClipboardCheck size={22} color={colors.warning} />
            </View>
            <Text style={styles.quickActionTitle}>Attendance</Text>
            <Text style={styles.quickActionSubtitle}>Check students</Text>
          </Pressable>
        </View>

        {/* Pickup list */}
        <SectionHeading
          title="Student pickups"
          actionLabel="View all"
          onAction={() => handleQuickAction('All students')}
        />

        <View style={styles.pickupCard}>
          <View style={styles.pickupCardHeader}>
            <View style={styles.pickupHeaderLeft}>
              <View style={styles.pickupHeaderIcon}>
                <MapPin size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.pickupTitle}>Morning route</Text>
                <Text style={styles.pickupSubtitle}>
                  3 sample students
                </Text>
              </View>
            </View>

            <View style={styles.pickupCount}>
              <Text style={styles.pickupCountText}>1/3</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>

          {pickupStudents.map((student, index) => {
            const pickedUp = student.status === 'Picked up';

            return (
              <View
                key={student.id}
                style={[
                  styles.studentRow,
                  index === pickupStudents.length - 1 &&
                    styles.lastStudentRow,
                ]}
              >
                <View
                  style={[
                    styles.studentAvatar,
                    pickedUp && styles.studentAvatarPickedUp,
                  ]}
                >
                  <Text
                    style={[
                      styles.studentInitials,
                      pickedUp && styles.studentInitialsPickedUp,
                    ]}
                  >
                    {student.initials}
                  </Text>
                </View>

                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {student.name}
                  </Text>
                  <Text style={styles.studentClass}>
                    {student.className} · {student.pickupTime}
                  </Text>
                </View>

                {pickedUp ? (
                  <View style={styles.pickedUpBadge}>
                    <CircleCheck size={14} color={colors.success} />
                    <Text style={styles.pickedUpText}>Picked up</Text>
                  </View>
                ) : (
                  <View style={styles.waitingBadge}>
                    <Text style={styles.waitingText}>Waiting</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Safety reminder */}
        <View style={styles.safetyBanner}>
          <View style={styles.safetyIcon}>
            <CircleCheck size={21} color={colors.success} />
          </View>

          <View style={styles.safetyTextContainer}>
            <Text style={styles.safetyTitle}>Safety comes first</Text>
            <Text style={styles.safetyDescription}>
              Verify student attendance and follow your assigned route.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// --------------------------------------------------
// Styles
// --------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 120,
  },

  // Duty status

  dutyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  dutyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.successBackground,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },

  dutyText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },

  // Active trip

  activeTripCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 24,
    padding: 18,
    marginBottom: 28,
    overflow: 'hidden',
  },

  activeTripTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activeTripTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  busIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  activeTripHeading: {
    flex: 1,
    gap: 5,
  },

  activeTripEyebrow: {
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: '#AFC7FF',
  },

  activeTripTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(22,163,74,0.18)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },

  liveText: {
    color: '#86EFAC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  tripDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.13)',
    marginVertical: 18,
  },

  busDetailsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },

  busDetail: {
    flex: 1,
    gap: 6,
  },

  detailLabel: {
    color: '#AFC7FF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  routePreview: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  routeLineContainer: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 5,
    width: 14,
  },

  routeStartDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#60A5FA',
    borderWidth: 2,
    borderColor: '#DCE7FF',
  },

  routeLine: {
    width: 2,
    flex: 1,
    minHeight: 26,
    backgroundColor: 'rgba(255,255,255,0.28)',
    marginVertical: 3,
  },

  routeEndDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#4ADE80',
  },

  routeLocations: {
    flex: 1,
    gap: 15,
  },

  routeLocation: {
    gap: 4,
  },

  destination: {
    marginTop: 0,
  },

  locationLabel: {
    color: '#AFC7FF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  locationName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  tripFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.13)',
  },

  tripFooterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },

  tripFooterText: {
    color: '#DCE7FF',
    fontSize: 11,
    fontWeight: '500',
  },

  startTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },

  startTripText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  // Section headings

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },

  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  // Statistics

  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    minHeight: 142,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
  },

  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.7,
  },

  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 3,
  },

  // Quick actions

  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },

  quickActionCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 13,
  },

  quickActionIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  quickActionTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },

  quickActionSubtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  // Student pickup list

  pickupCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },

  pickupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  pickupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  pickupHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pickupTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },

  pickupSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  pickupCount: {
    backgroundColor: colors.successBackground,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  pickupCountText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
  },

  progressTrack: {
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },

  progressFill: {
    width: '33.33%',
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 5,
  },

  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  lastStudentRow: {
    borderBottomWidth: 0,
  },

  studentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  studentAvatarPickedUp: {
    backgroundColor: colors.successBackground,
  },

  studentInitials: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  studentInitialsPickedUp: {
    color: colors.success,
  },

  studentInfo: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },

  studentName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },

  studentClass: {
    color: colors.textSecondary,
    fontSize: 10,
  },

  pickedUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  pickedUpText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },

  waitingBadge: {
    backgroundColor: colors.warningBackground,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },

  waitingText: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '700',
  },

  // Safety reminder

  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.successBackground,
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
  },

  safetyIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  safetyTextContainer: {
    flex: 1,
    gap: 4,
  },

  safetyTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },

  safetyDescription: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },

  buttonPressed: {
    opacity: 0.8,
  },
});
