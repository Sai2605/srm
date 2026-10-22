
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from
  '@react-navigation/native-stack';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import type { AuthStackParamList } from '../../types/auth.type';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert('Required', 'Enter your email/phone and password.');
      return;
    }

    // Connect your login API here.
    setLoading(true);
    try {
      Alert.alert(
        'API not connected',
        'Connect your Express login endpoint here.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your assigned bus and trips."
    >
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
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureToggle
        autoComplete="current-password"
      />

      <Pressable
        style={styles.forgot}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>

      <AuthButton
        title="Sign In"
        onPress={signIn}
        loading={loading}
      />

      <View style={styles.bottom}>
        <Text style={styles.caption}>New driver?</Text>
        <Pressable onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}> Create account</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.xl,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
