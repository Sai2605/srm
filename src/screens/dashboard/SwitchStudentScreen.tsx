/** Presented as a bottom sheet (see app/_layout.tsx → presentation: 'formSheet'). */
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
// import { router } from 'expo-router';
import { useActiveStudent } from './../../store/ActiveStudentProvider';
import { colors, spacing } from './../../theme';
import { AppText, Avatar, Button, Chip, SelectRow, SheetHeader, tintFor } from './../../components/ui';
import { firstName, formatClock } from './../../utils/format';
import { useNavigation } from '@react-navigation/native';

type SwitchStudentScreenProps = {
  onClose: () => void;
};


export default function SwitchStudentScreen({
  onClose,
}: SwitchStudentScreenProps) {
  const { students, activeStudent, setActiveStudentId } = useActiveStudent();
  const [picked, setPicked] = useState(activeStudent?.id);
  const pickedStudent = students.find((s) => s.id === picked);
  const navigation = useNavigation<any>();

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: 18, backgroundColor: colors.surface }}>
      <SheetHeader title="Switch student" />

      <View style={{ gap: 10 }} accessibilityRole="radiogroup">
        {students.map((s) => (
          <SelectRow key={s.id} kind="radio" selected={picked === s.id} onPress={() => setPicked(s.id)}>
            <Avatar name={s.name} bg={tintFor(s.id)} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="title">{s.name}</AppText>
              <AppText variant="caption" color={colors.textMuted}>Grade {s.grade} · {s.section} · {s.schoolName}</AppText>
              {s.status === 'active' ? (
                <AppText variant="caption" color={colors.textMuted}>
                  {s.vehicleLabel} · Pickup {formatClock(s.pickupTime)} · Drop {formatClock(s.dropTime)}
                </AppText>
              ) : (
                <Chip label="Pending approval" tone="warning" style={{ marginTop: 4 }} />
              )}
            </View>
          </SelectRow>
        ))}
      </View>

      <Button label="Add or manage students" variant="dashed" icon='UserRoundPlus' size="md"
      // onPress={() => router.replace('/students')}
      />
      <Button
        label={
          pickedStudent
            ? `Show ${firstName(pickedStudent.name)}’s dashboard`
            : 'Choose a student'
        }
        disabled={!pickedStudent}
        onPress={() => {
          if (!pickedStudent) return;

          setActiveStudentId(pickedStudent.id);
          onClose();
        }}
      />
    </ScrollView>
  );
}
