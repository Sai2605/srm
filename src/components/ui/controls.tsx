/** Interactive controls: buttons, segmented control, toggle, text field, list row. */
import { forwardRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, HIT, radius, shadows, spacing } from './../../theme';
import { AppText, Icon, type IconName } from './primitives';

/* ---------- Button ---------- */
type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'dashed' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'lg' | 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const btnColors: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.navy, fg: colors.textOnDark },
  accent: { bg: colors.yellow, fg: colors.navy },
  secondary: { bg: colors.bg, fg: colors.navy },
  dashed: { bg: 'transparent', fg: colors.navy, border: '#B9B5A8' },
  danger: { bg: colors.dangerBg, fg: colors.danger },
};

export function Button({ label, onPress, variant = 'primary', icon, loading, disabled, size = 'lg', style, accessibilityLabel }: ButtonProps) {
  const c = btnColors[variant];
  const height = size === 'lg' ? 56 : size === 'md' ? 48 : 36;
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          height,
          backgroundColor: c.bg,
          borderRadius: size === 'sm' ? radius.sm : radius.lg - 2,
          paddingHorizontal: size === 'sm' ? spacing.md : spacing.lg,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        c.border && { borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.border },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} />
      ) : (
        <>
          {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} color={c.fg} />}
          <AppText variant={size === 'sm' ? 'caption' : 'button'} color={c.fg} style={size === 'sm' && { fontWeight: '700' }}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

/* ---------- Icon button ---------- */
interface IconButtonProps {
  name: IconName;
  label: string; // required for screen readers
  onPress?: () => void;
  variant?: 'outline' | 'dark' | 'floating' | 'soft' | 'accent' | 'warning';
  badge?: boolean;
  size?: number;
}

export function IconButton({ name, label, onPress, variant = 'outline', badge, size = HIT }: IconButtonProps) {
  const v = {
    outline: { bg: colors.surface, fg: colors.navy, border: colors.border },
    dark: { bg: colors.navy, fg: colors.textOnDark },
    floating: { bg: colors.surface, fg: colors.navy },
    soft: { bg: colors.bg, fg: colors.navy },
    accent: { bg: colors.yellow, fg: colors.navy },
    warning: { bg: colors.warningBg, fg: colors.warning },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.iconBtn,
        { width: size, height: size, backgroundColor: v.bg, opacity: pressed ? 0.8 : 1 },
        'border' in v && { borderWidth: 1, borderColor: v.border },
        variant === 'floating' && shadows.medium,
      ]}
    >
      <Icon name={name} size={20} color={v.fg} />
      {badge && <View style={styles.badge} />}
    </Pressable>
  );
}

/* ---------- Segmented control ---------- */
interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  /** dark = selected pill is navy; light = selected pill is white */
  tone?: 'dark' | 'light';
  style?: StyleProp<ViewStyle>;
}

export function Segmented<T extends string>({ options, value, onChange, tone = 'dark', style }: SegmentedProps<T>) {
  return (
    <View accessibilityRole="tablist" style={[styles.segment, { backgroundColor: tone === 'dark' ? colors.bg : colors.surfaceAlt }, style]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segmentItem, on && { backgroundColor: tone === 'dark' ? colors.navy : colors.surface }]}
          >
            <AppText variant="small" style={{ fontFamily: fonts.bold }} color={on ? (tone === 'dark' ? colors.textOnDark : colors.navy) : colors.neutral}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- Toggle ---------- */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      hitSlop={8}
      style={[styles.track, { backgroundColor: value ? colors.navy : '#C9C6BB' }]}
    >
      <View style={[styles.knob, { left: value ? 23 : 3, backgroundColor: value ? colors.yellow : colors.surface }]} />
    </Pressable>
  );
}

/* ---------- Text field ---------- */
interface TextFieldProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string | null;
  right?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField(
  { label, hint, error, right, containerStyle, style, editable = true, ...rest },
  ref,
) {
  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label && <AppText variant="small" style={{ fontFamily: fonts.semibold }}>{label}</AppText>}
      <View style={[styles.field, !editable && { backgroundColor: '#EFEDE6', borderColor: colors.border }, !!error && { borderColor: colors.danger }]}>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          editable={editable}
          style={[styles.input, !editable && { color: colors.neutral }, style]}
          {...rest}
        />
        {right}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger}>{error}</AppText>
      ) : hint ? (
        <AppText variant="caption" color={colors.textMuted}>{hint}</AppText>
      ) : null}
    </View>
  );
});

/* ---------- List row ---------- */
interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconColor?: string;
  iconBg?: string;
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  divider?: boolean;
  chevron?: boolean;
  titleColor?: string;
}

export function ListRow({ title, subtitle, icon, iconColor = colors.navy, iconBg = colors.bg, left, right, onPress, divider, chevron = !!onPress, titleColor }: ListRowProps) {
  const content = (
    <View style={[styles.row, divider && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
      {left ??
        (icon && (
          <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
            <Icon name={icon} size={19} color={iconColor} />
          </View>
        ))}
      <View style={{ flex: 1, gap: 1 }}>
        <AppText variant="title" color={titleColor}>{title}</AppText>
        {subtitle && <AppText variant="caption" color={colors.textMuted}>{subtitle}</AppText>}
      </View>
      {right}
      {chevron && <Icon name="bus" size={18} color={colors.textMuted} />}
    </View>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      {content}
    </Pressable>
  ) : (
    content
  );
}

/* ---------- Choice pill (single / multi select) ---------- */
export function ChoicePill({ label, selected, onPress, style }: { label: string; selected: boolean; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.pill, selected ? { backgroundColor: colors.navy, borderColor: colors.navy } : null, style]}
    >
      <AppText variant="small" style={{ fontFamily: selected ? fonts.bold : fonts.semibold }} color={selected ? colors.textOnDark : colors.navy}>
        {label}
      </AppText>
    </Pressable>
  );
}

/* ---------- Selectable card row (radio / checkbox) ---------- */
export function SelectRow({ selected, onPress, children, kind = 'checkbox' }: { selected: boolean; onPress: () => void; children: ReactNode; kind?: 'checkbox' | 'radio' }) {
  return (
    <Pressable
      accessibilityRole={kind}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.selectRow, selected ? { borderWidth: 2, borderColor: colors.navy, backgroundColor: colors.yellowTint } : null]}
    >
      <View style={[kind === 'radio' ? styles.radio : styles.checkbox, selected && { backgroundColor: colors.navy, borderColor: colors.navy }]}>
        {selected && (kind === 'radio' ? <View style={styles.radioDot} /> : <Icon name='bus' size={14} color={colors.textOnDark} />)}
      </View>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  iconBtn: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: 5, backgroundColor: '#C2410C', borderWidth: 2, borderColor: colors.surface },
  segment: { flexDirection: 'row', padding: 4, borderRadius: radius.md, gap: 4 },
  segmentItem: { flex: 1, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  track: { width: 50, height: 30, borderRadius: 15, justifyContent: 'center' },
  knob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    gap: spacing.sm,
  },
  input: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text, paddingVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: 14, minHeight: HIT + 12 },
  rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pill: { height: 40, paddingHorizontal: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, justifyContent: 'center' },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#B9B5A8', alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#B9B5A8', alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surface },
});
