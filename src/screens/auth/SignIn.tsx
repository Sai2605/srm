import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/auth.type';
import Logo from './../../assets/images/Logo1.png';
import { AppText } from '../../components/ui';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

/* Colours taken from the design */
const C = {
  yellow: '#FFC400',
  yellowSoft: '#FFD54A',
  navy: '#111B34',
  white: '#FFFFFF',
  muted: '#6B7280',
  placeholder: '#9CA3AF',
  border: '#111B34',
};

/** Formats digits as "98765 43210" */
const formatPhone = (digits: string) =>
  digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;

/* ───────── Small pieces ───────── */

const GlobeIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9.5} stroke={C.navy} strokeWidth={1.8} />
    <Ellipse cx={12} cy={12} rx={4} ry={9.5} stroke={C.navy} strokeWidth={1.8} />
    <Path d="M2.5 12h19" stroke={C.navy} strokeWidth={1.8} />
  </Svg>
);

const IndiaFlag = () => (
  <View style={styles.flag}>
    <View style={{ flex: 1, backgroundColor: '#FF9933' }} />
    <View style={styles.flagMid}>
      <View style={styles.flagWheel} />
    </View>
    <View style={{ flex: 1, backgroundColor: '#138808' }} />
  </View>
);

/** Yellow hill + dashed road with pin, car and school */
const RoadScene = ({ width }: { width: number }) => {
  const h = 70;
  return (
    <Svg width={width} height={h} viewBox="0 0 360 55">
      {/* soft hill */}
      <Path
        d="M0 30 C 60 10, 120 36, 180 26 C 240 16, 300 8, 360 24 L360 70 L0 70 Z"
        fill={C.yellowSoft}
      />
      {/* dashed road */}
      <Path
        d="M0 42 C 60 30, 120 56, 180 44 C 240 32, 300 28, 360 40"
        stroke={C.navy}
        strokeWidth={1.6}
        strokeDasharray="5 5"
        fill="none"
      />

      {/* location pin */}
      <G>
        <Path
          d="M44 14 a11 11 0 0 1 11 11 c0 8 -11 18 -11 18 s-11 -10 -11 -18 a11 11 0 0 1 11 -11 z"
          fill={C.navy}
        />
        <Path d="M38.5 27 v-6 l5.5 -4 l5.5 4 v6 z" fill={C.yellow} />
        <Rect x={42} y={23} width={4} height={4} fill={C.navy} />
      </G>

      {/* car */}
      <G transform="translate(118 30)">
        <Path
          d="M2 16 v-5 c0 -2 1 -3 3 -3.5 l4 -5.5 c1 -1.2 2 -1.5 3.5 -1.5 h9 c1.5 0 2.5 0.4 3.5 1.5 l4 5.5 c2 0.5 3 1.5 3 3.5 v5 z"
          fill={C.navy}
        />
        <Path d="M12 7 h10 l3 4 h-16 z" fill={C.yellow} />
        <Circle cx={10} cy={17} r={4} fill={C.navy} stroke={C.yellowSoft} strokeWidth={1.2} />
        <Circle cx={28} cy={17} r={4} fill={C.navy} stroke={C.yellowSoft} strokeWidth={1.2} />
      </G>

      {/* school */}
      <G transform="translate(300 8)">
        <Rect x={11} y={0} width={1.6} height={8} fill={C.navy} />
        <Path d="M12.6 0 l8 2 l-8 2 z" fill={C.navy} />
        <Path d="M0 18 l17 -9 l17 9 v18 h-34 z" fill={C.navy} />
        <Rect x={13} y={24} width={8} height={12} fill={C.yellow} />
        <Rect x={5} y={20} width={5} height={5} fill={C.yellow} />
        <Rect x={24} y={20} width={5} height={5} fill={C.yellow} />
      </G>
    </Svg>
  );
};

/* ───────── Screen ───────── */

export default function SignInScreen({ navigation }: Props) {
  const [countryCode] = useState('+91');
  const [phone, setPhone] = useState(''); // digits only
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();

  const onChangePhone = (text: string) =>
    setPhone(text.replace(/\D/g, '').slice(0, 10));

  const sendOtp = async () => {
    // if (phone.length !== 10) {
    //   Alert.alert('Required', 'Enter a valid 10-digit mobile number.');
    //   return;
    // }
    navigation.navigate('OTP');
    setLoading(true);
    try {
      // await api.post('/auth/parent/send-otp', { phone: countryCode + phone });
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
        {/* ───────── Yellow hero ───────── */}
        <View style={styles.hero}>
          <Pressable style={styles.langPill} accessibilityRole="button">
            <GlobeIcon />
            <Text style={styles.langText}>English</Text>
          </Pressable>

          <Image source={Logo} style={styles.logo} resizeMode="contain" />

          <AppText variant='h0' style={styles.head}>
            Kid2Campus
          </AppText>
          <AppText variant='h1' style={styles.headline}>
            Your child’s school ride,{'\n'}tracked live.
          </AppText>

          <View style={styles.scene}>
            <RoadScene width={width} />
          </View>
        </View>

        {/* ───────── White card ───────── */}
        <View style={styles.card}>
          <AppText variant='body' style={styles.title}>Let’s get started</AppText>
          <Text style={styles.subtitle}>
            Enter the mobile number registered with your school.
          </Text>

          <Text style={styles.label}>Mobile number</Text>
          <View style={styles.phoneBox}>
            <Pressable style={styles.codeBox}>
              <IndiaFlag />
              <Text style={styles.codeText}>{countryCode}</Text>
            </Pressable>
            <View style={styles.divider} />
            <TextInput
              style={styles.phoneInput}
              value={formatPhone(phone)}
              onChangeText={onChangePhone}
              placeholder="98765 43210"
              placeholderTextColor={C.placeholder}
              keyboardType="number-pad"
              maxLength={11}
              autoComplete="tel"
              textContentType="telephoneNumber"
            />
          </View>

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
              <Text style={styles.buttonText}>Continue  →</Text>
            )}
          </Pressable>

          <Text style={styles.footerText}>
            By continuing you agree to the{' '}
            <Text style={styles.footerLink}>Terms</Text> &{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
          <Text style={styles.footerText}>Powered by Shiv Nxt Gen</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.yellow },
  scroll: { flexGrow: 1, backgroundColor: C.yellow },

  /* Hero */
  hero: {
    flex: 1,
    backgroundColor: C.yellow,
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight ?? 24) + 12,
    minHeight: 330,
  },
  langPill: {
    alignSelf: 'flex-end',
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: C.navy,
  },
  langText: { fontSize: 12, fontWeight: '600', color: C.navy },
  logo: { width: 200, height: 200, marginTop: 28 },
  head: {
    fontSize: 32,
    // marginBottom:20,
    // lineHeight: 28,
    fontWeight: '900',
    textAlign: 'center',
    color: C.navy,
  },
  headline: {
    marginTop: 30,
    // fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: C.navy,
  },
  scene: { marginTop: 'auto', width: '100%' },

  /* Card */
  card: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    marginTop: -2,
  },
  title: { fontSize: 18, fontWeight: '800', color: C.navy },
  subtitle: { marginTop: 6, fontSize: 12.5, lineHeight: 18, color: C.muted },
  label: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
    color: C.navy,
  },

  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    overflow: 'hidden',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: '100%',
  },
  codeText: { fontSize: 15, fontWeight: '700', color: C.navy },
  divider: { width: 1, height: 28, backgroundColor: '#D1D5DB' },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '500',
    color: C.navy,
  },

  flag: {
    width: 20,
    height: 14,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D5DB',
  },
  flagMid: {
    flex: 1,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagWheel: {
    width: 4,
    height: 4,
    borderRadius: 2,
    borderWidth: 0.8,
    borderColor: '#000080',
  },

  button: {
    marginTop: 18,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { opacity: 0.9 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: C.white, fontSize: 15, fontWeight: '700' },

  footerText: {
    marginTop: 14,
    fontSize: 10.5,
    lineHeight: 15,
    color: C.muted,
    textAlign: 'center',
  },
  footerLink: {
    color: C.navy,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});