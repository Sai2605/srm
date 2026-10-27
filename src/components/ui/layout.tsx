/** Screen scaffolding: safe-area screen, headers, sheets, and loading/empty/error states. */
import type { ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
// import { router } from 'expo-router';
import { colors, radius, spacing } from './../../theme';
import { AppText, Icon, type IconName } from './primitives';
import { Button, IconButton } from './controls';
import { useNavigation } from '@react-navigation/native';

/* ---------- Screen ---------- */
interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  padded?: boolean;
  gap?: number;
  bg?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: ReactNode; // pinned to bottom (e.g. primary button)
  contentStyle?: StyleProp<ViewStyle>;
  keyboard?: boolean;
}

export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  padded = true,
  gap = spacing.lg,
  bg = colors.bg,
  refreshing = false,
  onRefresh,
  footer,
  contentStyle,
  keyboard,
}: ScreenProps) {
  const inner = [{ gap, paddingHorizontal: padded ? spacing.xl : 0, paddingTop: spacing.md, paddingBottom: spacing.xxl }, contentStyle];
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={inner}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.navy} /> : undefined}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, inner]}>{children}</View>
  );

  const content = (
    <>
      <View style={{ flex: 1 }}>{body}</View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </>
  );

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: bg }}>
      {keyboard ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

/* ---------- Headers ---------- */
export function TabHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={styles.headerRow}>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="display" accessibilityRole="header">{title}</AppText>
        {subtitle && <AppText variant="small" color={colors.textMuted}>{subtitle}</AppText>}
      </View>
      {right}
    </View>
  );
}

export function BackHeader({ title, right, onBack }: { title?: string; right?: ReactNode; onBack?: () => void }) {
  const navigation = useNavigation()
  return (
    <View style={[styles.headerRow, { gap: spacing.sm + 2 }]}>
      <IconButton name='chevronLeft' label="Back"
        onPress={onBack ?? (() => navigation.goBack())}
      />
      {title && <AppText variant="display" accessibilityRole="header" style={{ flex: 1 }}>{title}</AppText>}
      {right}
    </View>
  );
}

/** Header for screens presented as bottom sheets (formSheet / modal). */
export function SheetHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose?: () => void }) {
  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.handle} />
      <View style={[styles.headerRow, { alignItems: 'flex-start' }]}>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="display" accessibilityRole="header">{title}</AppText>
          {subtitle && <AppText variant="small" color={colors.textMuted}>{subtitle}</AppText>}
        </View>
        <IconButton name='chevronRight' label="Close" variant="soft"
        //  onPress={onClose ?? (() => router.back())}
        />
      </View>
    </View>
  );
}

/* ---------- States ---------- */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.state} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.navy} />
      <AppText variant="small" color={colors.textMuted}>{label}</AppText>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.stateCard}>
      <Icon name="clock" size={32} color={colors.danger} />
      <AppText variant="title" align="center">Couldn’t load this</AppText>
      <AppText variant="small" color={colors.textMuted} align="center">{message}</AppText>
      {onRetry && <Button label="Try again" size="md" variant="secondary" onPress={onRetry} />}
    </View>
  );
}

export function EmptyState({ icon, title, message }: { icon: IconName; title: string; message?: string }) {
  return (
    <View style={styles.stateCard}>
      <Icon name={icon} size={36} color={colors.textMuted} />
      <AppText variant="title" align="center">{title}</AppText>
      {message && <AppText variant="small" color={colors.textMuted} align="center">{message}</AppText>}
    </View>
  );
}

/** Info / warning banner. */
export function Notice({ icon = 'info', text, tone = 'info' }: { icon?: IconName; text: string; tone?: 'info' | 'warning' }) {
  const c = tone === 'info' ? { bg: colors.infoBg, fg: colors.info } : { bg: colors.warningBg, fg: colors.warning };
  return (
    <View style={[styles.notice, { backgroundColor: c.bg }]}>
      <Icon name={icon} size={18} color={c.fg} />
      <AppText variant="caption" color={c.fg} style={{ flex: 1, lineHeight: 18 }}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.lg, backgroundColor: 'transparent' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong, marginTop: spacing.xs },
  state: { paddingVertical: 48, alignItems: 'center', gap: spacing.sm },
  stateCard: {
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: 40,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl - 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notice: { flexDirection: 'row', gap: 10, padding: spacing.md, borderRadius: radius.md, alignItems: 'flex-start' },
});
