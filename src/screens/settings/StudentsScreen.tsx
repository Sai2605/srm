import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useActiveStudent } from './../../store/ActiveStudentProvider';
import { useAddGuardian, useGuardians, useLinkStudent } from './../../hooks/queries';
import { errorMessage } from './../../api/client';
import { colors, fonts, radius, spacing } from './../../theme';
import {
  AppText, Avatar, BackHeader, Button, Card, ChoicePill, Chip, Icon, ListRow, Screen, SectionTitle, TextField, tintFor,
} from './../../components/ui';
import { firstName, formatClock, relationLabel } from './../../utils/format';
import type { Relation } from './../../types/models';
import { mockProfile } from '../../data/mockStudents';

export default function StudentsScreen() {
  const { students, activeStudent } = useActiveStudent();
  // const guardians = useGuardians(activeStudent?.id);
  const guardians = mockProfile;
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addGuardianOpen, setAddGuardianOpen] = useState(false);

  return (
    <Screen>
      <BackHeader title="Students" right={<AppText variant="small" color={colors.textMuted}>{students.length} linked</AppText>} />

      <View style={{ gap: 10 }}>
        {students.map((s) => (
          <Card key={s.id} style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Avatar name={s.name} bg={tintFor(s.id)} />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="title">{s.name}</AppText>
                <AppText variant="caption" color={colors.textMuted}>Grade {s.grade} · {s.section} · {s.schoolName}</AppText>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {s.vehicleLabel && (
                <View style={styles.tag}>
                  <Icon name='bus' size={13} />
                  <AppText variant="caption" style={{ fontFamily: fonts.semibold }}>{s.vehicleLabel}</AppText>
                </View>
              )}
              {s.pickupTime && (
                <View style={styles.tag}>
                  <AppText variant="caption" style={{ fontFamily: fonts.semibold }}>{formatClock(s.pickupTime)} · {formatClock(s.dropTime)}</AppText>
                </View>
              )}
              <Chip label={s.status === 'active' ? 'Active' : s.status === 'pending_approval' ? 'Pending approval' : 'Inactive'} tone={s.status === 'active' ? 'success' : 'warning'} />
            </View>
          </Card>
        ))}
      </View>

      <Pressable accessibilityRole="button" onPress={() => setAddStudentOpen(true)} style={styles.addCard}>
        <View style={styles.addIcon}><Icon name='UserRoundPlus' size={20} /></View>
        <View style={{ gap: 2 }}>
          <AppText variant="title">Add a student</AppText>
          <AppText variant="caption" color={colors.textMuted}>Use the student ID from your school</AppText>
        </View>
      </Pressable>

      {activeStudent && (
        <View style={{ gap: spacing.sm }}>
          <SectionTitle right={<AppText variant="small" style={{ fontFamily: fonts.bold }} accessibilityRole="button" onPress={() => setAddGuardianOpen(true)}>+ Add</AppText>}>
            {`Allowed to receive ${firstName(activeStudent.name)}`}
          </SectionTitle>
          <Card padded={false}>
            {(guardians ?? []).map((g, i, arr) => (
              <ListRow
                key={g.id}
                left={<Avatar name={g.name} size={36} bg={g.isSelf ? colors.yellow : colors.greenBg} />}
                title={g.name}
                subtitle={`${relationLabel(g.relation as Relation)}${g.isSelf ? ' (you)' : ''}`}
                divider={i < arr.length - 1}
                chevron={false}
              />
            ))}
          </Card>
        </View>
      )}

      <AddStudentModal visible={addStudentOpen} onClose={() => setAddStudentOpen(false)} />
      {activeStudent && <AddGuardianModal studentId={activeStudent.id} visible={addGuardianOpen} onClose={() => setAddGuardianOpen(false)} />}
    </Screen>
  );
}

function SheetModal({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={styles.modalSheet}>
        <View style={styles.handle} />
        <AppText variant="h2" accessibilityRole="header">{title}</AppText>
        {children}
      </View>
    </Modal>
  );
}

function AddStudentModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [code, setCode] = useState('');
  const link = useLinkStudent();
  return (
    <SheetModal visible={visible} onClose={onClose} title="Add a student">
      <TextField label="Student ID" value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="e.g. GVPS-2026-0412" hint="Printed on the ID card or school fee receipt." />
      <Button
        label="Send link request"
        disabled={code.trim().length < 3}
        loading={link.isPending}
        onPress={() =>
          link.mutate(code.trim(), {
            onSuccess: () => {
              setCode('');
              onClose();
              Alert.alert('Request sent', 'The school will approve the link shortly.');
            },
            onError: (e) => Alert.alert('Couldn’t add student', errorMessage(e)),
          })
        }
      />
    </SheetModal>
  );
}

const GUARDIAN_RELATIONS: Relation[] = ['father', 'mother', 'grandparent', 'other'];

function AddGuardianModal({ studentId, visible, onClose }: { studentId: string; visible: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState<Relation>('grandparent');
  const add = useAddGuardian(studentId);
  const valid = name.trim().length > 1 && /^\+?\d{10,13}$/.test(phone.replace(/\s/g, ''));

  return (
    <SheetModal visible={visible} onClose={onClose} title="Add a guardian">
      <TextField label="Name" value={name} onChangeText={setName} />
      <TextField label="Mobile number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+91" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {GUARDIAN_RELATIONS.map((r) => <ChoicePill key={r} label={relationLabel(r)} selected={relation === r} onPress={() => setRelation(r)} />)}
      </View>
      <Button
        label="Add guardian"
        disabled={!valid}
        loading={add.isPending}
        onPress={() =>
          add.mutate(
            { name: name.trim(), phone: phone.replace(/\s/g, ''), relation },
            {
              onSuccess: () => {
                setName('');
                setPhone('');
                onClose();
              },
              onError: (e) => Alert.alert('Couldn’t add guardian', errorMessage(e)),
            },
          )
        }
      />
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.sm, backgroundColor: colors.bg },
  addCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: 14, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#B9B5A8' },
  addIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.round, borderTopRightRadius: radius.round, padding: spacing.xl, paddingBottom: 40, gap: spacing.lg },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong },
});
