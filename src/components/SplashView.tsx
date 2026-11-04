/** Branded splash shown while fonts load and the session is restored. */
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Feather from '@expo/vector-icons/Feather';
import { colors } from './../theme';
import { AppText, Icon } from './../components/ui';
import Logo from './../assets/images/logo.png'
import Splash from './../assets/images/splash.png'

export function SplashView({ fontsReady = true }: { fontsReady?: boolean }) {
  // Before fonts load, fall back to system font so the splash still renders.
  const fam = fontsReady ? undefined : { fontFamily: undefined };
  return (
    <SafeAreaView style={styles.root}>
      <View />
      <Image source={Splash} style={{ width: '100%', height: '100%' }} resizeMode='contain' />

      {/* <View style={{ alignItems: 'center', gap: 22 }}>
        <View style={styles.logo}>
          <Image source={Logo} style={{width:130,height:130}} resizeMode='contain'/>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <AppText variant="h1" color={colors.textOnDark} style={[{ fontSize: 36, lineHeight: 42 }, fam]}>Kid2Campus</AppText>
          <AppText variant="body" color="#C9D0DC" align="center" style={fam}>
            Your child’s school ride,{'\n'}tracked live.
          </AppText>
        </View>
      </View>
      <View style={{ alignItems: 'center', gap: 20, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', gap: 8 }} accessibilityLabel="Loading">
          {[1, 0.55, 0.25].map((o) => (
            <View key={o} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.yellow, opacity: o }} />
          ))}
        </View>
        <AppText variant="caption" color={colors.textOnDarkMuted} style={fam}>Powered by [Shiv Nxt Gen]</AppText>
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 150, height: 150, borderRadius: 30, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
});
