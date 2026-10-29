import React, { useEffect, useMemo, useState } from 'react';

import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    View,
} from 'react-native';

import type { TripType } from '../types/models';

import { useActiveStudent } from '../store/ActiveStudentProvider';
import { useMarkAbsent } from '../hooks/queries';
import { errorMessage } from '../api/client';

import { colors, fonts, radius, spacing } from '../theme';

import {
    AppText,
    Button,
    ChoicePill,
    Notice,
    SelectRow,
    SheetHeader,
    TextField,
} from '../components/ui';

import { tripName } from '../components/trip';
import { addDays, toISODate } from '../utils/date';
import {
    firstName,
    formatClock,
    formatDayLong,
    formatDayShort,
} from '../utils/format';

type MarkAbsentSheetProps = {
    visible: boolean;
    onClose: () => void;
    date?: string;
    type?: TripType;
};

const REASONS = ['Sick', 'Family travel', 'Parent dropping', 'Other'];

type DateMode = 'today' | 'tomorrow' | 'pick';

export default function MarkAbsentSheet({
    visible,
    onClose,
    date,
    type,
}: MarkAbsentSheetProps) {
    const { activeStudent } = useActiveStudent();
    const markAbsent = useMarkAbsent();

    const today = toISODate(new Date());
    const tomorrow = toISODate(addDays(new Date(), 1));
    useEffect(() => {

        console.log('123')
    }, [])

    const upcoming = useMemo(
        () =>
            Array.from({ length: 10 }, (_, i) =>
                toISODate(addDays(new Date(), i)),
            ),
        [],
    );

    const getInitialMode = (): DateMode =>
        !date || date === tomorrow
            ? 'tomorrow'
            : date === today
                ? 'today'
                : 'pick';

    const [mode, setMode] = useState<DateMode>(getInitialMode);

    const [picked, setPicked] = useState<string[]>(
        date && getInitialMode() === 'pick' ? [date] : [],
    );

    const [types, setTypes] = useState<TripType[]>(
        type ? [type] : ['pickup', 'drop'],
    );

    const [reason, setReason] = useState('Sick');
    const [note, setNote] = useState('');

    // Reset the form whenever the sheet opens with new parameters.
    useEffect(() => {
        if (!visible) return;

        const initialMode = getInitialMode();

        setMode(initialMode);
        setPicked(date && initialMode === 'pick' ? [date] : []);
        setTypes(type ? [type] : ['pickup', 'drop']);
        setReason('Sick');
        setNote('');
    }, [visible, date, type]);

    const dates =
        mode === 'today'
            ? [today]
            : mode === 'tomorrow'
                ? [tomorrow]
                : picked;

    const canSubmit =
        !!activeStudent && dates.length > 0 && types.length > 0;

    const toggle = <T,>(list: T[], value: T): T[] =>
        list.includes(value)
            ? list.filter((item) => item !== value)
            : [...list, value];

    const submit = () => {
        if (!activeStudent || !canSubmit) return;

        markAbsent.mutate(
            {
                studentId: activeStudent.id,
                dates,
                tripTypes: types,
                reason,
                note: note.trim() || undefined,
            },
            {
                onSuccess: () => {
                    onClose();

                    Alert.alert(
                        'Absence sent',
                        'The driver and transport desk have been notified.',
                    );
                },
                onError: (error) => {
                    Alert.alert(
                        'Couldn’t mark absent',
                        errorMessage(error),
                    );
                },
            },
        );
    };

    const name = activeStudent
        ? firstName(activeStudent.name)
        : 'student';

    const count = types.length * dates.length;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                }}
            >
                {/* Dark backdrop */}
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close absence form"
                    onPress={onClose}
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        backgroundColor: 'rgba(0,0,0,0.45)',
                    }}
                />

                {/* Bottom sheet */}
                <View
                    style={{
                        maxHeight: '90%',
                        backgroundColor: colors.surface,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        overflow: 'hidden',
                    }}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <ScrollView
                            contentContainerStyle={{
                                padding: spacing.xl,
                                gap: 18,
                                paddingBottom: spacing.xl + 12,
                            }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <SheetHeader
                                title={`Mark ${name} absent`}
                                subtitle="The driver won’t wait at your stop."
                                onClose={onClose}
                            />

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

                            {/* Keep your existing Date selection UI here. */}

                            {/* Keep your existing Which trips? UI here. */}

                            {/* Keep your existing Reason and Note UI here. */}

                            <Notice text="The driver and the transport desk get notified instantly. You can undo this until the trip starts." />

                            <Button
                                label={
                                    !canSubmit
                                        ? 'Select a date and trip'
                                        : `Confirm absence · ${count} ${count === 1 ? 'trip' : 'trips'
                                        }`
                                }
                                disabled={!canSubmit}
                                loading={markAbsent.isPending}
                                onPress={submit}
                            />

                            <Pressable
                                onPress={onClose}
                                style={{ alignItems: 'center', paddingVertical: 8 }}
                            >
                                <AppText variant="bodyStrong" color={colors.textMuted}>
                                    Cancel
                                </AppText>
                            </Pressable>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </View>
        </Modal>
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