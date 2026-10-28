import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
// import { router } from 'expo-router';
import { useProfile, useUpdateProfile } from './../../hooks/queries';
import { errorMessage } from './../../api/client';
import { colors, fonts, spacing } from './../../theme';
import { AppText, Avatar, BackHeader, Button, ChoicePill, Icon, IconButton, LoadingState, Screen, TextField } from './../../components/ui';
import { formatPhone } from './../../utils/format';
import type { Relation } from './../../types/models';
import { useNavigation } from '@react-navigation/native';

const RELATIONS: { value: Relation; label: string }[] = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'guardian', label: 'Guardian' },
];

const isEmail = (s: string) => !s || /^\S+@\S+\.\S+$/.test(s);

export default function EditProfileScreen() {
  const { data: parent, isLoading } = useProfile();
  const update = useUpdateProfile();

  const [name, setName] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relation, setRelation] = useState<Relation>('mother');
  const navigation = useNavigation();

  useEffect(() => {
    if (!parent) return;
    setName(parent.name);
    setAltPhone(parent.altPhone ?? '');
    setEmail(parent.email ?? '');
    setRelation(parent.relation);
  }, [parent]);

  const emailError = isEmail(email) ? null : 'Enter a valid email';
  const canSave = name.trim().length > 1 && !emailError;

  const save = () =>
    update.mutate(
      { name: name.trim(), altPhone: altPhone.trim() || null, email: email.trim() || null, relation },
      { onSuccess: () => navigation.goBack(), onError: (e) => Alert.alert('Couldn’t save', errorMessage(e)) },
    );

  if (isLoading || !parent) return <Screen><LoadingState /></Screen>;

  return (
    <Screen keyboard footer={<Button label="Save changes" onPress={save} disabled={!canSave} loading={update.isPending} />}>
      <BackHeader title="Edit profile" />

      <View style={{ alignItems: 'center' }}>
        <View>
          <Avatar name={name || parent.name} size={88} bg={colors.yellow} />
          {/* TODO: expo-image-picker → upload → PATCH /me { avatarUrl } */}
          <View style={{ position: 'absolute', right: -4, bottom: -4 }}>
            <IconButton name='SwitchCamera' label="Change photo" variant="dark" size={38} />
          </View>
        </View>
      </View>

      <TextField label="Full name" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />

      <TextField
        label="Mobile number"
        value={formatPhone(parent.phone)}
        editable={false}
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name='MessageCircleMore' size={14} color={colors.success} />
            <AppText variant="caption" color={colors.success} style={{ fontFamily: fonts.bold }}>Verified</AppText>
          </View>
        }
        hint="Changing your login number needs a new OTP."
      />

      <TextField label="Alternate mobile (driver can call)" value={altPhone} onChangeText={setAltPhone} keyboardType="phone-pad" placeholder="+91" />
      <TextField
        label="Email (for receipts)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={emailError}
      />

      <View style={{ gap: 6 }}>
        <AppText variant="small" style={{ fontFamily: fonts.semibold }}>Relationship to student</AppText>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {RELATIONS.map((r) => (
            <ChoicePill key={r.value} label={r.label} selected={relation === r.value} onPress={() => setRelation(r.value)} style={{ flex: 1, alignItems: 'center', borderRadius: 12, height: 44 }} />
          ))}
        </View>
      </View>
    </Screen>
  );
}
