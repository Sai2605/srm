
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import type { NativeStackScreenProps } from
  '@react-navigation/native-stack';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { colors, spacing } from '../../theme';
import type { AuthStackParamList } from '../../types/auth.type';


type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    if (!name.trim() || !identifier.trim() || !password) {
      Alert.alert('Required', 'Please complete all required fields.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak password', 'Use at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Your passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Register with your backend, then request an OTP.
      // Navigate only after the backend confirms OTP was sent.
      Alert.alert(
        'API not connected',
        'Connect your registration endpoint here.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Register your details to get started as a driver."
    >
      <AuthInput
        label="Full name"
        placeholder="Enter your full name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
      />

      <AuthInput
        label="Email or phone number"
        placeholder="Enter email or phone"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="username"
      />

      <AuthInput
        label="Password"
        placeholder="Minimum 8 characters"
        value={password}
        onChangeText={setPassword}
        secureToggle
        autoComplete="new-password"
      />

      <AuthInput
        label="Confirm password"
        placeholder="Re-enter password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureToggle
        autoComplete="new-password"
      />

      <AuthButton
        title="Create account"
        onPress={signUp}
        loading={loading}
      />

      <Pressable
        style={styles.bottom}
        onPress={() => navigation.navigate('SignIn')}
      >
        <Text style={styles.caption}>Already have an account? </Text>
        <Text style={styles.link}>Sign in</Text>
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  bottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  link: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
