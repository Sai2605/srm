/** Trip-related components used on Dashboard, Trips and Live Trip. */
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
// import { router } from 'expo-router';
import { colors, fonts, radius, spacing } from './../theme';
import { AppText, Avatar, Button, Card, Chip, Icon, IconButton, type Tone } from './../components/ui';
import { formatDayShort, formatTime } from './../utils/format';
import { addDays, toISODate } from './../utils/date';
import type { Driver, LiveStop, LiveTrip, Trip, TripStatus, TripType, Vehicle } from './../types/models';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/MainNavigator';

/* ---------- Labels ---------- */
export const tripName = (type: TripType) => (type === 'pickup' ? 'Morning pickup' : 'Afternoon drop');

export const statusChip: Record<TripStatus, { label: string; tone: Tone }> = {
  scheduled: { label: 'Scheduled', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'success' },
  completed: { label: 'Completed', tone: 'info' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  absent: { label: 'Absent', tone: 'warning' },
};

export const phaseCopy: Record<LiveTrip['phase'], { chip: string; etaLabel: string }> = {
  to_pickup: { chip: 'On the way to your stop', etaLabel: 'Arriving at your stop in' },
  onboard: { chip: 'On board', etaLabel: 'Reaching destination in' },
  reached: { chip: 'Trip completed', etaLabel: 'Reached at' },
};

/* ---------- Date strip ---------- */
export function DateStrip({ value, onChange, days = 14 }: { value: string; onChange: (d: string) => void; days?: number }) {
  const today = toISODate(new Date());
  // Past dates up to today (newest on the right).
  const list = Array.from({ length: days }, (_, i) => toISODate(addDays(new Date(), i - (days - 1))));
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6 }}
      ref={(r) => r?.scrollToEnd({ animated: false })}
      accessibilityRole="tablist"
    >
      {list.map((d) => {
        const on = d === value;
        const { dow, num } = formatDayShort(d);
        return (
          <Pressable
            key={d}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${dow} ${num}${d === today ? ', today' : ''}`}
            onPress={() => onChange(d)}
            style={[styles.day, on && { backgroundColor: colors.navy, borderColor: colors.navy }]}
          >
            <AppText variant="caption" color={on ? colors.textOnDark : colors.text}>{dow}</AppText>
            <AppText variant="h3" style={{ fontSize: 18 }} color={on ? colors.textOnDark : colors.text}>{num}</AppText>
            <AppText style={{ fontSize: 9, fontFamily: fonts.bold, letterSpacing: 1 }} color={on ? colors.yellow : colors.textMuted}>
              {d === today ? 'TODAY' : ' '}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ---------- Driver row ---------- */
export function DriverRow({ driver, vehicle, compact, onChat, dark }: { driver: Driver; vehicle: Vehicle; compact?: boolean; onChat?: () => void; dark?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Avatar name={driver.name} size={compact ? 34 : 44} bg={dark ? colors.navySoft : colors.blueBg} color={dark ? colors.textOnDark : colors.text} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText variant={compact ? 'bodyStrong' : 'title'} color={dark ? colors.textOnDark : colors.text} numberOfLines={1}>{driver.name}</AppText>
        <AppText variant="caption" color={dark ? colors.textOnDarkMuted : colors.textMuted} numberOfLines={1}>
          {vehicle.label} · {vehicle.registrationNumber}
        </AppText>
      </View>
      {onChat && <IconButton name='MessageCircleMore' label="Message driver" onPress={onChat} />}
      {!compact && <IconButton name='search' label="Call driver" variant="dark" onPress={() => Linking.openURL(`tel:${driver.phone}`)} />}
    </View>
  );
}

/* ---------- Trip card (Trips list & dashboard) ---------- */
export function TripCard({ trip }: { trip: Trip }) {
  const chip = statusChip[trip.status];
  const startTime = trip.actualStart ?? trip.scheduledStart;
  const endTime = trip.actualEnd ?? trip.scheduledEnd;
  const est = trip.status === 'scheduled' || trip.status === 'in_progress';
  const absent = trip.status === 'absent';
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <AppText variant="h3" style={{ flex: 1, fontSize: 15 }}>{tripName(trip.type)}</AppText>
        <Chip label={chip.label} tone={chip.tone} />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={styles.rail} accessibilityElementsHidden>
          <View style={styles.railStart} />
          <View style={styles.railLine} />
          <View style={styles.railEnd} />
        </View>
        <View style={{ flex: 1, gap: spacing.md }}>
          <PlaceLine title={trip.from.name} sub={absent && trip.absenceNote ? trip.absenceNote : trip.from.address} time={absent ? '—' : `${est ? 'Est. ' : ''}${formatTime(startTime)}`} />
          <PlaceLine title={trip.to.name} sub={trip.to.address} time={absent ? '—' : `${est ? 'Est. ' : ''}${formatTime(endTime)}`} />
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={{ flex: 1 }}>
          <DriverRow driver={trip.driver} vehicle={trip.vehicle} compact />
        </View>
        {trip.status === 'scheduled' && (
          <Button label="Absent" size="sm" variant="secondary"
          // onPress={() => router.push({ pathname: '/mark-absent', params: { date: trip.date, type: trip.type } })} 
          />
        )}
        <Button label="Chat" size="sm" variant="secondary"
        //  onPress={() => router.push({ pathname: '/chat/trip/[tripId]', params: { tripId: trip.id } })} 
        />
        {trip.status === 'in_progress' && (
          <Button label="Track" size="sm" variant="accent"
            onPress={() => navigation.navigate('LiveTrip', { tripId: trip.id })}
          />
        )}
      </View>
    </Card>
  );
}

function PlaceLine({ title, sub, time }: { title: string; sub: string; time: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="caption" color={colors.textMuted}>{sub}</AppText>
      </View>
      <AppText variant="small" style={{ fontFamily: fonts.bold }}>{time}</AppText>
    </View>
  );
}

/* ---------- Compact row for dashboard ---------- */
export function TripRow({ trip, last }: { trip: Trip; last?: boolean }) {
  const chip = statusChip[trip.status];
  return (
    <Pressable
      accessibilityRole="button"
      // onPress={() =>
      //   trip.status === 'in_progress'
      //     ? router.push({ pathname: '/live-trip/[tripId]', params: { tripId: trip.id } })
      //     : router.push('/trips')
      // }
      style={[styles.tripRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}
    >
      <View style={[styles.tripIcon, { backgroundColor: trip.type === 'pickup' ? colors.yellowSoft : colors.infoBg }]}>
        <Icon name={trip.type === 'pickup' ? 'Sun' : 'home'} size={20} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong">
          {trip.type === 'pickup' ? 'Pickup' : 'Drop'} · {formatTime(trip.scheduledStart)}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>{trip?.from?.name} → {trip?.to?.name}</AppText>
      </View>
      <Chip label={chip.label} tone={chip.tone} />
    </Pressable>
  );
}

/* ---------- Progress segments ---------- */
export function StopProgress({ done, total }: { done: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel={`${done} of ${total} stops completed`}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < done ? colors.yellow : colors.navyMuted }} />
      ))}
    </View>
  );
}

/* ---------- Stop timeline (Live Trip) ---------- */
export function StopTimeline({ stops }: { stops: LiveStop[] }) {
  return (
    <View accessibilityRole="list">
      {stops.map((s, i) => {
        const last = i === stops.length - 1;
        return (
          <View key={s.id} style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ alignItems: 'center', width: 18 }}>
              <View
                style={[
                  styles.dot,
                  s.state === 'done' && { backgroundColor: colors.success, borderColor: colors.success },
                  s.state === 'current' && { backgroundColor: colors.yellow, borderColor: colors.navy, borderWidth: 3 },
                ]}
              />
              {!last && <View style={[styles.dotLine, { backgroundColor: s.state === 'done' ? colors.success : colors.borderStrong }]} />}
            </View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingBottom: last ? 0 : spacing.md }}>
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">{s.title}</AppText>
                <AppText variant="caption" color={colors.textMuted}>{s.subtitle}</AppText>
              </View>
              <AppText variant="caption" style={{ fontFamily: fonts.bold }}>
                {s.state === 'done' ? formatTime(s.time) : `Est. ${formatTime(s.time)}`}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  day: {
    width: 60,
    alignItems: 'center',
    gap: 2,
    // paddingHorizontal:20,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rail: { alignItems: 'center', paddingTop: 5, width: 12 },
  railStart: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.navy },
  railLine: { flex: 1, width: 2, backgroundColor: colors.borderStrong, marginVertical: 3 },
  railEnd: { width: 10, height: 10, borderRadius: 2, backgroundColor: colors.navy },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.divider },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md + 2 },
  tripIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#B9B5A8', backgroundColor: colors.surface },
  dotLine: { flex: 1, width: 2, minHeight: 18 },
});
