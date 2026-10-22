
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from
  '@react-navigation/native-stack';
import { ShieldCheck } from 'lucide-react-native';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthButton from '../../components/auth/AuthButton';
import type { AuthStackParamList } from '../../types/auth.type';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export default function OtpScreen({ route }: Props) {
  const { identifier, purpose } = route.params;
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setTimeout(() => {
      setSeconds(value => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Enter all six digits.');
      return;
    }

    setLoading(true);
    try {
      // Send identifier, OTP and purpose to your backend.
      Alert.alert(
        'API not connected',
        'Connect your OTP verification endpoint here.',
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (seconds > 0 || loading) return;

    setLoading(true);
    try {
      // Request a fresh OTP from your backend.
      // Restart the countdown only after a successful response.
      Alert.alert(
        'API not connected',
        'Connect your resend OTP endpoint here.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your account"
      subtitle={`Enter the 6-digit code sent to ${identifier}.`}
    >
      <View style={styles.iconWrap}>
        <ShieldCheck size={30} color={colors.primary} />
      </View>

      <Text style={styles.otpLabel}>Verification code</Text>

      <TextInput
        value={otp}
        onChangeText={value =>
          setOtp(value.replace(/\D/g, '').slice(0, 6))
        }
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        accessibilityLabel="Six digit verification code"
        style={styles.otpInput}
        placeholder="• • • • • •"
        placeholderTextColor={colors.textMuted}
      />

      <AuthButton
        title="Verify OTP"
        onPress={verifyOtp}
        loading={loading}
      />

      <View style={styles.resendRow}>
        <Text style={styles.muted}>Didn't receive the code? </Text>

        <Pressable
          onPress={resendOtp}
          disabled={seconds > 0 || loading}
        >
          <Text
            style={[
              styles.link,
              seconds > 0 && styles.disabledLink,
            ]}
          >
            {seconds > 0 ? `Resend in ${seconds}s` : 'Resend OTP'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.purpose}>
        {purpose === 'signup'
          ? 'Account verification'
          : 'Password recovery'}
      </Text>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  otpLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  otpInput: {
    height: 64,
    borderWidth: 1,
    borderColor: colors.borderFocused,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.xl,
  },
  muted: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  link: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
  },
  disabledLink: {
    color: colors.textMuted,
  },
  purpose: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
