/** Presented as a modal sheet. Optional params: date (YYYY-MM-DD), type (pickup|drop). */
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
// import { router, useLocalSearchParams } from 'expo-router';
import { useActiveStudent } from './../../store/ActiveStudentProvider';
import { useMarkAbsent } from './../../hooks/queries';
import { errorMessage } from './../../api/client';
import { colors, fonts, radius, spacing } from './../../theme';
import { AppText, Button, ChoicePill, Notice, SelectRow, SheetHeader, TextField } from './../../components/ui';
import { tripName } from './../../components/trip';
import { addDays, toISODate } from './../../utils/date';
import { firstName, formatClock, formatDayLong, formatDayShort } from './../../utils/format';
import type { TripType } from './../../types/models';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';

const REASONS = ['Sick', 'Family travel', 'Parent dropping', 'Other'];
type DateMode = 'today' | 'tomorrow' | 'pick';

export default function MarkAbsentScreen() {
  // const params = useLocalSearchParams<{ date?: string; type?: TripType }>();
  // const params = useRoute<RouteProp<MainStackParamList, 'LiveTrip'>>();
  const route = useRoute<RouteProp<MainStackParamList, 'MarkAbsent'>>();
  const navigation = useNavigation()
  const params = (route.params ?? {}) as { date?: string; type?: TripType };

  const { activeStudent } = useActiveStudent();
  const markAbsent = useMarkAbsent();

  const today = toISODate(new Date());
  const tomorrow = toISODate(addDays(new Date(), 1));
  const upcoming = useMemo(() => Array.from({ length: 10 }, (_, i) => toISODate(addDays(new Date(), i))), []);

  const initialMode: DateMode = !params.date || params.date === tomorrow ? 'tomorrow' : params.date === today ? 'today' : 'pick';
  const [mode, setMode] = useState<DateMode>(initialMode);
  const [picked, setPicked] = useState<string[]>(params.date && initialMode === 'pick' ? [params.date] : []);
  const [types, setTypes] = useState<TripType[]>(params.type ? [params.type] : ['pickup', 'drop']);
  const [reason, setReason] = useState('Sick');
  const [note, setNote] = useState('');

  const dates = mode === 'today' ? [today] : mode === 'tomorrow' ? [tomorrow] : picked;
  const canSubmit = !!activeStudent && dates.length > 0 && types.length > 0;

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const submit = () => {
    if (!activeStudent) return;
    markAbsent.mutate(
      { studentId: activeStudent.id, dates, tripTypes: types, reason, note: note.trim() || undefined },
      {
        onSuccess: () => {
          navigation.goBack();
          Alert.alert('Absence sent', 'The driver and transport desk have been notified.');
        },
        onError: (e) => Alert.alert('Couldn’t mark absent', errorMessage(e)),
      },
    );
  };

  const name = activeStudent ? firstName(activeStudent.name) : 'student';
  const n = types.length * dates.length;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: 18 }} keyboardShouldPersistTaps="handled">
        <SheetHeader title={`Mark ${name} absent`} subtitle="The driver won’t wait at your stop." />

        <View style={{ gap: spacing.sm }}>
          <AppText variant="small" style={{ fontFamily: fonts.bold }}>Date</AppText>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {([
              ['today', 'Today', formatDayLong(today)],
              ['tomorrow', 'Tomorrow', formatDayLong(tomorrow)],
              ['pick', 'Pick dates', picked.length ? `${picked.length} selected` : 'Choose'],
            ] as const).map(([m, label, sub]) => (
              <SelectDateCard key={m} label={label} sub={sub} selected={mode === m} onPress={() => setMode(m)} />
            ))}
          </View>
          {mode === 'pick' && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: 4 }}>
              {upcoming.map((d) => {
                const { dow, num } = formatDayShort(d);
                return <ChoicePill key={d} label={`${dow} ${num}`} selected={picked.includes(d)} onPress={() => setPicked((p) => toggle(p, d))} />;
              })}
            </View>
          )}
        </View>

        <View style={{ gap: spacing.sm }}>
          <AppText variant="small" style={{ fontFamily: fonts.bold }}>Which trips?</AppText>
          {(['pickup', 'drop'] as const).map((t) => (
            <SelectRow key={t} selected={types.includes(t)} onPress={() => setTypes((x) => toggle(x, t))}>
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">{tripName(t)}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {t === 'pickup' ? `Home → School · ${formatClock(activeStudent?.pickupTime)}` : `School → Home · ${formatClock(activeStudent?.dropTime)}`}
                </AppText>
              </View>
            </SelectRow>
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <AppText variant="small" style={{ fontFamily: fonts.bold }}>
            Reason <AppText variant="small" color={colors.textMuted}>(optional)</AppText>
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {REASONS.map((r) => <ChoicePill key={r} label={r} selected={reason === r} onPress={() => setReason(r)} />)}
          </View>
          <TextField placeholder="Note to driver (optional)" value={note} onChangeText={setNote} multiline accessibilityLabel="Note to driver" />
        </View>

        <Notice text="The driver and the transport desk get notified instantly. You can undo this until the trip starts." />

        <Button
          label={!canSubmit ? 'Select a date and trip' : `Confirm absence · ${n} ${n === 1 ? 'trip' : 'trips'}`}
          disabled={!canSubmit}
          loading={markAbsent.isPending}
          onPress={submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SelectDateCard({ label, sub, selected, onPress }: { label: string; sub: string; selected: boolean; onPress: () => void }) {
  const fg = selected ? colors.textOnDark : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        gap: 2,
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: selected ? colors.navy : colors.borderStrong,
        backgroundColor: selected ? colors.navy : colors.surface,
      }}
    >
      <AppText variant="bodyStrong" color={fg}>{label}</AppText>
      <AppText variant="caption" color={selected ? colors.textOnDarkMuted : colors.textMuted} style={{ fontSize: 11 }}>{sub}</AppText>
    </Pressable>
  );
}
