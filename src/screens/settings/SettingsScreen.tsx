import { Alert, Linking, Pressable, View } from 'react-native';
// import { router } from 'expo-router';
import { useAuth } from './../../store/AuthProvider';
import { useActiveStudent } from './../../store/ActiveStudentProvider';
import { useNotificationPrefs, usePickupLocations, useProfile, useUpdateNotificationPrefs } from './../../hooks/queries';
import { colors, fonts, radius, spacing } from './../../theme';
import { AppText, Avatar, Card, ListRow, Screen, SectionTitle, TabHeader, Toggle } from './../../components/ui';
import { firstName, formatPhone, relationLabel } from './../../utils/format';
import type { NotificationPrefs } from './../../types/models';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../navigation/SettingsNavigator';
import { MOCK_PICKUP_LOCATIONS } from '../../data/mockStudents';

const PREF_ROWS: { key: keyof NotificationPrefs; label: string; sub: string }[] = [
  { key: 'vanApproaching', label: 'Van approaching', sub: 'Alert when the van is 1 km away' },
  { key: 'boardedDropped', label: 'Boarded & dropped', sub: 'When your child gets on or off' },
  { key: 'chatSounds', label: 'Chat sounds', sub: 'Play a sound for new messages' },
];

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { students, activeStudent } = useActiveStudent();
  const profile = useProfile();
  // const pickup = usePickupLocations(activeStudent?.id);
  const pickup = MOCK_PICKUP_LOCATIONS;
  const prefs = useNotificationPrefs();
  const updatePrefs = useUpdateNotificationPrefs();
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamList>>(); const p = profile.data;

  return (
    <Screen>
      <TabHeader title="Settings" />

      <Pressable accessibilityRole="button" accessibilityLabel="Edit profile"
        onPress={() => navigation.navigate('EditSettings')}
      >
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={p?.name ?? '?'} size={56} bg={colors.yellow} />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="h3" style={{ fontSize: 17 }}>{p?.name ?? '—'}</AppText>
            <AppText variant="small" color={colors.textMuted}>
              {p ? `${formatPhone(p.phone)} · ${relationLabel(p.relation)}` : ''}
            </AppText>
          </View>
          <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.bg }}>
            <AppText variant="small" style={{ fontFamily: fonts.bold }}>Edit</AppText>
          </View>
        </Card>
      </Pressable>

      <View style={{ gap: spacing.sm }}>
        <SectionTitle>Transport</SectionTitle>
        <Card padded={false}>
          <ListRow
            icon='location'
            iconBg={colors.purpleBg}
            iconColor={colors.purple}
            title="Pickup & drop location"
            subtitle={pickup ? `${pickup.pickup.address}${pickup.approval === 'pending' ? ' · Pending approval' : ''}` : activeStudent ? 'Loading…' : 'No student selected'}
            onPress={() => navigation.navigate('LocationSettings')}
            divider
          />
          <ListRow
            icon="users"
            iconBg={colors.blueBg}
            iconColor={colors.info}
            title="Students"
            subtitle={`${students.length} linked · ${students.map((s) => firstName(s.name)).join(', ')}`}
            onPress={() => navigation.navigate('StudentsSettings')}
          />
        </Card>
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionTitle>Notifications</SectionTitle>
        <Card padded={false}>
          {PREF_ROWS.map((r, i) => (
            <ListRow
              key={r.key}
              title={r.label}
              subtitle={r.sub}
              divider={i < PREF_ROWS.length - 1}
              right={
                <Toggle
                  label={r.label}
                  value={!!prefs.data?.[r.key]}
                  onChange={(v) => prefs.data && updatePrefs.mutate({ ...prefs.data, [r.key]: v })}
                />
              }
            />
          ))}
        </Card>
      </View>

      <Card padded={false}>
        {/* TODO: language picker (i18n) */}
        <ListRow title="Language" right={<AppText variant="small" color={colors.textMuted}>English</AppText>} chevron={false} divider />
        <ListRow title="Help & transport desk" onPress={() => Linking.openURL('tel:+910000000000')} divider />
        <ListRow
          title="Log out"
          titleColor={colors.danger}
          chevron={false}
          onPress={() =>
            Alert.alert('Log out?', 'You’ll need an OTP to sign in again.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log out', style: 'destructive', onPress: () => void signOut() },
            ])
          }
        />
      </Card>
    </Screen>
  );
}
