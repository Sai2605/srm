import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/auth.type';
import { colors, spacing } from '../../theme';
import { AppText } from '../../components/ui';
import WaveSvg from '../../components/ui/WaveSvg';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const DASH_COUNT = 28;

/** Formats digits as "98765 43210" */
const formatPhone = (digits: string) =>
  digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;

export default function SignInScreen({ navigation }: Props) {
  const [countryCode] = useState('+91');
  const [phone, setPhone] = useState(''); // digits only
  const [loading, setLoading] = useState(false);
  const { width, height } = useWindowDimensions()
  const onChangePhone = (text: string) =>
    setPhone(text.replace(/\D/g, '').slice(0, 10));

  const sendOtp = async () => {
    // if (phone.length !== 10) {
    //   Alert.alert('Required', 'Enter a valid 10-digit mobile number.');
    //   return;
    // }
    navigation.navigate('OTP')
    setLoading(true);
    try {
      // Connect your "send OTP" API here, e.g.
      // await api.post('/auth/parent/send-otp', { phone: countryCode + phone });
      // navigation.navigate('VerifyOtp', { phone: countryCode + phone });
      Alert.alert('API not connected', 'Connect your Express send-OTP endpoint here.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* <StatusBar barStyle="dark-content" backgroundColor={C.yellow} /> */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ───────── Header ───────── */}
        <View style={[styles.header, { height: height * 0.35, paddingTop: height * 0.08 }]}>

          <View style={styles.rowAlign}>

            {/* Logo tile with bus icon */}
            <View style={styles.logo}>
              <View style={styles.busBody}>
                <View style={styles.busWindow} />
                <View style={styles.busLights}>
                  <View style={styles.busLight} />
                  <View style={styles.busLight} />
                </View>
              </View>
            </View>
            {/* Sun */}
            <View style={styles.sun} />

          </View>
          {/* Road (pure Views) */}
          {/* <View style={styles.road}>
            <View style={styles.dashRow}>
              {Array.from({ length: DASH_COUNT }).map((_, i) => (
                <View key={i} style={styles.dash} />
              ))}
            </View>
          </View> */}
          <WaveSvg />

          <Text style={styles.headerLabel}>SafeRide · Parent</Text>
        </View>

        {/* ───────── Body ───────── */}
        <View style={styles.body}>
          {/* <Text style={styles.title}>Welcome, parent</Text> */}
          <AppText variant="h0" accessibilityRole="header">Welcome, parent</AppText>
          <AppText variant='body' style={styles.subtitle}>
            Sign in with the mobile number registered with your child's school.
          </AppText>

          <Text style={styles.label}>Mobile number</Text>
          <View style={styles.phoneRow}>
            <Pressable style={styles.codeBox}>
              <Text style={styles.codeText}>{countryCode}</Text>
              <View style={styles.chevron} />
            </Pressable>

            <TextInput
              style={styles.phoneInput}
              value={formatPhone(phone)}
              onChangeText={onChangePhone}
              placeholder="98765 43210"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={11}
              autoComplete="tel"
              textContentType="telephoneNumber"
            />
          </View>
          <Text style={styles.helper}>We'll send a 6-digit code by SMS.</Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={sendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </Pressable>
        </View>

        {/* ───────── Footer ───────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing you agree to our{' '}
            <Text style={styles.footerLink}>Terms</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>.
          </Text>
          <Text style={styles.footerText}>
            Number not registered?{' '}
            <Text style={styles.footerLink}>Contact your school</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, backgroundColor: colors.bg },

  /* Header */
  header: {
    // height: 250,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  sun: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFD97A',
  },
  dashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.huge
  },

  /* Logo tile */
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busBody: {
    width: 20,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.8,
    borderColor: colors.primary,
    alignItems: 'center',
    paddingTop: 2,
  },
  busWindow: {
    width: 12,
    height: 5,
    borderRadius: 1,
    borderWidth: 1.4,
    borderColor: colors.primary,
  },
  busLights: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 12,
    marginTop: 3,
  },
  busLight: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: colors.primary,
  },
  headerLabel: {
    position: 'absolute',
    left: 24,
    bottom: 20,
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryDark,
  },

  /* Body */
  body: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  subtitle: {
    marginTop: 6,
    lineHeight: 21,
    color: colors.primaryLight,
  },
  label: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  codeBox: {
    width: 66,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  codeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  chevron: {
    width: 7,
    height: 7,
    borderRightWidth: 1.6,
    borderBottomWidth: 1.6,
    borderColor: colors.primaryDark,
    transform: [{ rotate: '45deg' }, { translateY: -2 }],
  },
  phoneInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.primaryDark,
  },
  helper: {
    marginTop: 8,
    fontSize: 11.5,
    color: colors.primaryLight,
  },
  button: {
    marginTop: 24,
    // height: 48,
    paddingVertical: spacing.lg,
    borderRadius: 14,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { opacity: 0.9 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  /* Footer */
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 2,
  },
  footerText: {
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.primaryLight,
    textAlign: 'center',
  },
  footerLink: {
    color: colors.primaryDark,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});