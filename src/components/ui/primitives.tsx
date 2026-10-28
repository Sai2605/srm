import type { ReactNode } from 'react';

import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import {
  UserRound,
  BusFront,
  CircleCheck,
  CircleAlert,
  Info,
  CircleX,
  Clock,
  MapPin,
  House,
  Route,
  Users,
  Bell,
  Settings,
  ChevronRight,
  ChevronLeft,
  Search,
  type LucideIcon,
  Calendar,
  ChevronUp,
  ChevronDown,
  UserRoundX,
  MessageCircleMore,
  CreditCard,
  Sun,
  UserRoundPlus,
  Lock,
  Volume2,
  Phone,
  SendHorizonal,
  SwitchCamera,
  Navigation,
  X,
  LocateFixed
} from 'lucide-react-native';

import {
  colors,
  radius,
  spacing,
  typography,
  type TypographyVariant,
} from '../../theme';

/* ---------- Text ---------- */

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
}

export function AppText({
  variant = 'body',
  color = colors.text,
  align,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[
        typography[variant],
        { color, textAlign: align },
        style,
      ]}
    />
  );
}

/* ---------- Icon ---------- */

export const iconMap = {
  user: UserRound,
  bus: BusFront,
  success: CircleCheck,
  warning: CircleAlert,
  info: Info,
  error: CircleX,
  clock: Clock,
  location: MapPin,
  home: House,
  route: Route,
  users: Users,
  notification: Bell,
  settings: Settings,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  search: Search,
  Calendar: Calendar,
  ChevronUp: ChevronUp,
  ChevronDown: ChevronDown,
  UserRoundX:UserRoundX,
  MessageCircleMore:MessageCircleMore,
  CreditCard:CreditCard,
  MapPin:MapPin, 
  CircleAlert:CircleAlert,
  Sun:Sun,
  UserRoundPlus:UserRoundPlus,
  Lock:Lock,
  Volume2:Volume2,
  Phone:Phone,
  SendHorizonal:SendHorizonal,
  SwitchCamera:SwitchCamera,
  Navigation:Navigation,
  X:X,
  LocateFixed:LocateFixed 
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({
  name,
  size = 20,
  color = colors.text,
  strokeWidth = 2,
}: IconProps) {
  const IconComponent = iconMap[name];

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      accessible={false}
    />
  );
}

/* ---------- Card ---------- */

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export function Card({
  children,
  style,
  padded = true,
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.cardPadded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* ---------- Avatar ---------- */

interface AvatarProps {
  name: string;
  size?: number;
  bg?: string;
  color?: string;
}

function getInitials(name: string): string {
  const cleaned = name.trim();

  if (!cleaned) {
    return '?';
  }

  return cleaned
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export function Avatar({
  name,
  size = 46,
  bg = colors.blueBg,
  color = colors.text,
}: AvatarProps) {
  return (
    <View
      accessible
      accessibilityLabel={name}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <AppText
        variant="title"
        color={color}
        style={{
          fontSize: Math.round(size * 0.33),
        }}
      >
        {getInitials(name)}
      </AppText>
    </View>
  );
}

/* ---------- Student tint ---------- */

/** Stable pastel colour per student ID. */
const TINTS = [
  colors.blueBg,
  colors.pinkBg,
  colors.greenBg,
  colors.purpleBg,
  colors.yellowSoft,
];

export function tintFor(id: string): string {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }

  return TINTS[hash % TINTS.length] ?? colors.blueBg;
}

/* ---------- Chip ---------- */

export type Tone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'live';

const toneMap: Record<Tone, { bg: string; fg: string }> = {
  success: {
    bg: colors.successBg,
    fg: colors.success,
  },
  live: {
    bg: colors.successBg,
    fg: colors.success,
  },
  warning: {
    bg: colors.warningBg,
    fg: colors.warning,
  },
  danger: {
    bg: colors.dangerBg,
    fg: colors.danger,
  },
  info: {
    bg: colors.infoBg,
    fg: colors.info,
  },
  neutral: {
    bg: colors.neutralBg,
    fg: colors.neutral,
  },
};

interface ChipProps {
  label: string;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}

export function Chip({
  label,
  tone = 'neutral',
  style,
}: ChipProps) {
  const { bg, fg } = toneMap[tone];

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: bg },
        style,
      ]}
    >
      {tone === 'live' && <View style={styles.liveDot} />}

      <AppText
        variant="caption"
        color={fg}
        style={styles.chipText}
      >
        {label}
      </AppText>
    </View>
  );
}

/* ---------- Section title ---------- */

interface SectionTitleProps {
  children: string;
  right?: ReactNode;
}

export function SectionTitle({
  children,
  right,
}: SectionTitleProps) {
  return (
    <View style={styles.sectionTitle}>
      <AppText
        variant="overline"
        color={colors.textMuted}
      >
        {children.toUpperCase()}
      </AppText>

      {right}
    </View>
  );
}

/* ---------- Divider ---------- */

export function Divider() {
  return <View style={styles.divider} />;
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardPadded: {
    padding: spacing.md + 2,
  },

  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },

  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.successDot,
  },

  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
});
