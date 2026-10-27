import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';
// import { router, useLocalSearchParams } from 'expo-router';
// import { useMutation } from '@tanstack/react-query';
// import { authService } from '@/api/services';
// import { errorMessage } from '@/api/client';
// import { USE_MOCKS } from '@/api/config';
// import { useAuth } from '@/store/AuthProvider';
import { colors, fonts, radius, spacing } from './../../theme';
import { AppText, BackHeader, Button, Screen } from './../../components/ui';
import { formatPhone } from './../../utils/format';

const LENGTH = 6;

export default function OtpScreen() {
  // const params = useLocalSearchParams<{ phone: string; requestId: string; resendIn?: string }>();
  // const { signIn } = useAuth();
  const inputRef = useRef<TextInputInstance>(null);
  const [code, setCode] = useState('');
  const [requestId, setRequestId] = useState();
  const [seconds, setSeconds] = useState(Number(30));

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  // const verify = useMutation({
  //   mutationFn: (otp: string) => authService.verifyOtp(requestId, params.phone, otp),
  //   onSuccess: async (res) => {
  //     await signIn(res); // Stack.Protected then swaps to the app
  //   },
  //   onError: () => setCode(''),
  // });

  // const resend = useMutation({
  //   mutationFn: () => authService.sendOtp(params.phone),
  //   onSuccess: (res) => {
  //     setRequestId(res.requestId);
  //     setSeconds(res.resendInSeconds);
  //   },
  // });

  const onChange = (t: string) => {
    const next = t.replace(/\D/g, '').slice(0, LENGTH);
    setCode(next);
    // if (next.length === LENGTH) verify.mutate(next);
  };

  return (
    <Screen keyboard gap={spacing.xxl + 4}>
      <BackHeader />
      <View style={{ gap: 10 }}>
        <AppText variant="h1" accessibilityRole="header">Verify your number</AppText>
        <AppText variant="body" color={colors.textMuted}>
          Enter the 6-digit code sent to{' '}
          <AppText variant="body" style={{ fontFamily: fonts.bold }}>{}</AppText>.{' '}
          <AppText variant="body" style={{ fontFamily: fonts.bold }}
          //  onPress={() => router.back()}
           >Edit</AppText>
        </AppText>
      </View>

      <View style={{ gap: spacing.md }}>
        <AppText variant="small" style={{ fontFamily: fonts.semibold }}>One-time password</AppText>
        <Pressable onPress={() => inputRef.current?.focus()} style={styles.boxes} accessibilityLabel="One-time password" accessibilityHint="Double tap to type the code">
          {Array.from({ length: LENGTH }, (_, i) => {
            const active = i === code.length
            //  && !verify.isPending;
            return (
              <View key={i} style={[styles.box, active && styles.boxActive
                // , verify.isError
               && styles.boxError]}>
                <AppText variant="display">{code[i] ?? ''}</AppText>
              </View>
            );
          })}
        </Pressable>
        {/* One hidden input drives all boxes — supports SMS autofill on iOS & Android. */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={onChange}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={LENGTH}
          autoFocus
          style={styles.hidden}
        />
        {/* {verify.isError ? (
          <AppText variant="caption" color={colors.danger}>{errorMessage(verify.error)}</AppText>
        ) : USE_MOCKS ? (
          <AppText variant="caption" color={colors.textMuted}>Demo mode: use code 123456</AppText>
        ) : null} */}
      </View>

      <Button label="Verify & continue"
      //  onPress={() => verify.mutate(code)}
        disabled={code.length !== LENGTH}
        //  loading={verify.isPending}
          />

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        <AppText variant="small" color={colors.textMuted}>Didn’t get it?</AppText>
        {seconds > 0 ? (
          <AppText variant="small" style={{ fontFamily: fonts.bold }}>Resend in 00:{String(seconds).padStart(2, '0')}</AppText>
        ) : (
          <AppText variant="small" style={{ fontFamily: fonts.bold }} accessibilityRole="button"
          //  onPress={() => resend.mutate()}
           >
            {/* {resend.isPending ? 'Sending…' : 'Resend code'} */}
          </AppText>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  boxes: { flexDirection: 'row', gap: 10 },
  box: {
    flex: 1,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderWidth: 2, borderColor: colors.navy, shadowColor: colors.yellow, shadowOpacity: 0.6, shadowRadius: 4, shadowOffset: { width: 0, height: 0 },elevation:1 },
  boxError: { borderColor: colors.danger },
  hidden: { position: 'absolute', opacity: 0, height: 1, width: 1 },
});
