
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import type { NativeStackScreenProps } from
  '@react-navigation/native-stack';
import { Mail } from 'lucide-react-native';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import type { AuthStackParamList } from '../../types/auth.type';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'ForgotPassword'
>;

export default function ForgotPasswordScreen({
  navigation,
}: Props) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    if (!identifier.trim()) {
      Alert.alert('Required', 'Enter your registered email or phone.');
      return;
    }

    setLoading(true);
    try {
      // Ask your backend to send a password-reset OTP.
      // Navigate only when the backend confirms the request.
      Alert.alert(
        'API not connected',
        'Connect your password recovery endpoint here.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your registered email or phone number to receive a verification code."
    >
      <Mail
        size={32}
        color={colors.primary}
        style={styles.icon}
      />

      <AuthInput
        label="Email or phone number"
        placeholder="Enter registered email or phone"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="username"
      />

      <AuthButton
        title="Send verification code"
        onPress={requestOtp}
        loading={loading}
      />

      <Pressable
        style={styles.bottom}
        onPress={() => navigation.navigate('SignIn')}
      >
        <Text style={styles.link}>Back to sign in</Text>
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  bottom: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
