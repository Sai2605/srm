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

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const C = {
  yellow: '#FFC42E',
  sun: '#FFD97A',
  road: 'rgba(170, 120, 10, 0.22)',
  dash: 'rgba(255, 255, 255, 0.75)',
  navy: '#14213D',
  bg: '#F5F3EE',
  muted: '#6B7280',
  border: '#E5E1D8',
  white: '#FFFFFF',
};

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
        <View style={[styles.header, { height: height * 0.3 }]}>
          {/* Sun */}
          <View style={styles.sun} />

          {/* Road (pure Views) */}
          <View style={styles.road}>
            <View style={styles.dashRow}>
              {Array.from({ length: DASH_COUNT }).map((_, i) => (
                <View key={i} style={styles.dash} />
              ))}
            </View>
          </View>

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

          <Text style={styles.headerLabel}>SafeRide · Parent</Text>
        </View>

        {/* ───────── Body ───────── */}
        <View style={styles.body}>
          <Text style={styles.title}>Welcome, parent</Text>
          <Text style={styles.subtitle}>
            Sign in with the mobile number registered with your child's school.
          </Text>

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
              <ActivityIndicator color={C.white} />
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
  flex: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    // height: 250,
    backgroundColor: C.yellow,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  sun: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.sun,
  },
  road: {
    position: 'absolute',
    left: -40,
    right: -40,
    bottom: 56,
    height: 44,
    backgroundColor: C.road,
    transform: [{ rotate: '-5deg' }],
    justifyContent: 'center',
  },
  dashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  dash: {
    width: 14,
    height: 2.5,
    marginRight: 9,
    borderRadius: 2,
    backgroundColor: C.dash,
  },

  /* Logo tile */
  logo: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busBody: {
    width: 20,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.8,
    borderColor: C.yellow,
    alignItems: 'center',
    paddingTop: 2,
  },
  busWindow: {
    width: 12,
    height: 5,
    borderRadius: 1,
    borderWidth: 1.4,
    borderColor: C.yellow,
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
    backgroundColor: C.yellow,
  },
  headerLabel: {
    position: 'absolute',
    left: 24,
    bottom: 20,
    fontSize: 14,
    fontWeight: '600',
    color: C.navy,
  },

  /* Body */
  body: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: C.navy,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 21,
    color: C.muted,
  },
  label: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: C.navy,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  codeBox: {
    width: 66,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  codeText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.navy,
  },
  chevron: {
    width: 7,
    height: 7,
    borderRightWidth: 1.6,
    borderBottomWidth: 1.6,
    borderColor: C.navy,
    transform: [{ rotate: '45deg' }, { translateY: -2 }],
  },
  phoneInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.navy,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1,
    color: C.navy,
  },
  helper: {
    marginTop: 8,
    fontSize: 11.5,
    color: C.muted,
  },
  button: {
    marginTop: 24,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { opacity: 0.9 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: C.white,
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
    color: C.muted,
    textAlign: 'center',
  },
  footerLink: {
    color: C.navy,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});